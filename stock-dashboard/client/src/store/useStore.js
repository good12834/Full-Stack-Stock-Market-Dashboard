import { create } from 'zustand';
import { authAPI, stocksAPI, portfolioAPI, watchlistAPI, finnhubAPI } from '../utils/api';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Stock data
  stocks: [],
  selectedStock: null,
  stockHistory: [],
  stockIntraday: [],
  searchResults: [],

  // Portfolio
  portfolio: null,

  // Watchlist
  watchlist: [],

  // Theme
  darkMode: localStorage.getItem('darkMode') === 'true',

  // WebSocket connection
  ws: null,
  connected: false,
  reconnectAttempts: 0,
  reconnectTimer: null,

  // Auth actions
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      set({
        user: response.data.data,
        token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Registration failed',
        loading: false,
      });
      return false;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      set({
        user: response.data.data,
        token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Login failed',
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    // Close WebSocket
    const { ws, reconnectTimer } = get();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (ws) {
      ws.close();
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      stocks: [],
      portfolio: null,
      watchlist: [],
      ws: null,
      connected: false,
      reconnectAttempts: 0,
      reconnectTimer: null,
    });
  },

  clearError: () => set({ error: null }),

  // Stock actions
  fetchStocks: async () => {
    try {
      const response = await stocksAPI.getAll();
      set({ stocks: response.data.data });
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    }
  },

  fetchStockDetail: async (symbol) => {
    set({ loading: true });
    try {
      const response = await stocksAPI.getBySymbol(symbol);
      set({ selectedStock: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch stock', loading: false });
    }
  },

  fetchStockHistory: async (symbol, interval = 'daily') => {
    try {
      const response = await stocksAPI.getHistory(symbol, interval);
      set({ stockHistory: response.data.data });
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  },

  fetchStockIntraday: async (symbol) => {
    try {
      const response = await stocksAPI.getIntraday(symbol);
      set({ stockIntraday: response.data.data });
    } catch (err) {
      console.error('Failed to fetch intraday data:', err);
    }
  },

  searchStocks: async (query) => {
    if (!query || query.length < 1) {
      set({ searchResults: [] });
      return;
    }
    try {
      const response = await stocksAPI.search(query);
      set({ searchResults: response.data.data });
    } catch (err) {
      console.error('Search failed:', err);
    }
  },

  // Portfolio actions
  fetchPortfolio: async () => {
    try {
      const response = await portfolioAPI.get();
      set({ portfolio: response.data.data });
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  },

  addPosition: async (data) => {
    try {
      await portfolioAPI.addPosition(data);
      await get().fetchPortfolio();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to add position' });
      return false;
    }
  },

  removePosition: async (symbol, quantity) => {
    try {
      await portfolioAPI.removePosition(symbol, quantity);
      await get().fetchPortfolio();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to remove position' });
      return false;
    }
  },

  // Watchlist actions
  fetchWatchlist: async () => {
    try {
      const response = await watchlistAPI.get();
      set({ watchlist: response.data.data });
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    }
  },

  addToWatchlist: async (symbol) => {
    try {
      await watchlistAPI.add(symbol);
      await get().fetchWatchlist();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to add to watchlist' });
      return false;
    }
  },

  removeFromWatchlist: async (symbol) => {
    try {
      await watchlistAPI.remove(symbol);
      await get().fetchWatchlist();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to remove from watchlist' });
      return false;
    }
  },

  // WebSocket actions
  connectWebSocket: () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Clear any pending reconnect timer
    if (get().reconnectTimer) {
      clearTimeout(get().reconnectTimer);
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ connected: true, reconnectAttempts: 0 });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'market_update':
              set({ stocks: data.stocks });
              break;
            case 'stock_update':
              // Update the stock in the list if it exists
              set((state) => ({
                stocks: state.stocks.map((s) =>
                  s.symbol === data.symbol ? { ...s, ...data.data } : s
                ),
                selectedStock:
                  state.selectedStock?.symbol === data.symbol
                    ? { ...state.selectedStock, ...data.data }
                    : state.selectedStock,
              }));
              break;
            default:
              break;
          }
        } catch (err) {
          console.warn('WebSocket message parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        set({ connected: false, ws: null });
        // Exponential backoff reconnection: 2^attempt * 1000ms, capped at 30s
        const attempts = get().reconnectAttempts || 0;
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
        console.log(`WebSocket reconnecting in ${delay/1000}s (attempt ${attempts + 1})`);
        const timer = setTimeout(() => {
          if (get().isAuthenticated) {
            set({ reconnectAttempts: get().reconnectAttempts + 1 });
            get().connectWebSocket();
          }
        }, delay);
        set({ reconnectTimer: timer });
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };

      set({ ws, reconnectAttempts: 0 });
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
      // Retry with backoff on connection failure too
      const attempts = get().reconnectAttempts || 0;
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
      const timer = setTimeout(() => {
        if (get().isAuthenticated) {
          set({ reconnectAttempts: (get().reconnectAttempts || 0) + 1 });
          get().connectWebSocket();
        }
      }, delay);
      set({ reconnectTimer: timer });
    }
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, connected: false });
    }
  },

  // Theme actions
  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    localStorage.setItem('darkMode', newMode);
    set({ darkMode: newMode });
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // ---------- Finnhub actions ----------
  finnhubData: {},
  finnhubLoading: false,
  finnhubError: null,

  fetchFinnhubData: async (endpoint, params = {}) => {
    set({ finnhubLoading: true, finnhubError: null });
    try {
      const method = typeof endpoint === 'function' ? endpoint : finnhubAPI[endpoint];
      if (!method) throw new Error(`Unknown Finnhub endpoint: ${endpoint}`);
      const response = await method(...(Array.isArray(params) ? params : [params]));
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Finnhub request failed';
      set({ finnhubError: msg });
      return null;
    } finally {
      set({ finnhubLoading: false });
    }
  },

  fetchQuote: async (symbol) => {
    try {
      const response = await finnhubAPI.getQuote(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`quote:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchCompanyProfile: async (symbol) => {
    try {
      const response = await finnhubAPI.getProfile2(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`profile:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchMarketNews: async (category = 'general') => {
    try {
      const response = await finnhubAPI.getMarketNews(category);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`news:${category}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchCompanyNews: async (symbol, from, to) => {
    try {
      const response = await finnhubAPI.getCompanyNews(symbol, from, to);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`companyNews:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchBasicFinancials: async (symbol, metric = 'all') => {
    try {
      const response = await finnhubAPI.getBasicFinancials(symbol, metric);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`financials:${symbol}:${metric}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchRecommendationTrends: async (symbol) => {
    try {
      const response = await finnhubAPI.getRecommendationTrends(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`recs:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchEarnings: async (symbol, limit = 5) => {
    try {
      const response = await finnhubAPI.getEarnings(symbol, limit);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`earnings:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchPriceTarget: async (symbol) => {
    try {
      const response = await finnhubAPI.getPriceTarget(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`priceTarget:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchPeers: async (symbol) => {
    try {
      const response = await finnhubAPI.getPeers(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`peers:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchExecutive: async (symbol) => {
    try {
      const response = await finnhubAPI.getExecutive(symbol);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`executive:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  fetchInsiderTransactions: async (symbol, from, to) => {
    try {
      const response = await finnhubAPI.getInsiderTransactions(symbol, from, to);
      set((state) => ({
        finnhubData: { ...state.finnhubData, [`insider:${symbol}`]: response.data.data },
      }));
      return response.data.data;
    } catch (err) {
      return null;
    }
  },

  // Clear Finnhub cached data
  clearFinnhubData: () => set({ finnhubData: {}, finnhubError: null }),
}));

export default useStore;