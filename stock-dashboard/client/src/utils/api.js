import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// AI Insights
export const aiAPI = {
  getInsights: (symbol) => api.get(`/ai/insights/${symbol}`),
  getPrediction: (symbol) => api.get(`/ai/predict/${symbol}`),
};

// Stocks
export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol, interval = 'daily') =>
    api.get(`/stocks/${symbol}/history`, { params: { interval } }),
  getIntraday: (symbol) => api.get(`/stocks/${symbol}/intraday`),
  search: (query) => api.get(`/stocks/search/${query}`),
  compare: (symbols) =>
    api.get('/stocks/compare', { params: { symbols: symbols.join(',') } }),
};

// Portfolio
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  addPosition: (data) => api.post('/portfolio', data),
  sellPosition: (data) => api.post('/portfolio/sell', data),
  removePosition: (symbol, quantity) =>
    api.delete(`/portfolio/${symbol}`, { params: { quantity } }),
  getTransactions: () => api.get('/portfolio/transactions'),
  getPerformance: () => api.get('/portfolio/performance'),
};

// Watchlist
export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (symbol) => api.post('/watchlist', { symbol }),
  remove: (symbol) => api.delete(`/watchlist/${symbol}`),
};

// ---------- Finnhub API ----------
export const finnhubAPI = {
  // Stock Data
  getQuote: (symbol) => api.get(`/finnhub/quote/${symbol}`),
  getCandles: (symbol, params = {}) =>
    api.get(`/finnhub/candles/${symbol}`, { params }),
  getBasicFinancials: (symbol, metric = 'all') =>
    api.get(`/finnhub/basic-financials/${symbol}`, { params: { metric } }),
  getEarnings: (symbol, limit = 5) =>
    api.get(`/finnhub/earnings/${symbol}`, { params: { limit } }),
  getEpsEstimates: (symbol, freq = 'annual') =>
    api.get(`/finnhub/eps-estimates/${symbol}`, { params: { freq } }),
  getRevenueEstimates: (symbol, freq = 'annual') =>
    api.get(`/finnhub/revenue-estimates/${symbol}`, { params: { freq } }),
  getEbitdaEstimates: (symbol, freq = 'annual') =>
    api.get(`/finnhub/ebitda-estimates/${symbol}`, { params: { freq } }),
  getEbitEstimates: (symbol, freq = 'annual') =>
    api.get(`/finnhub/ebit-estimates/${symbol}`, { params: { freq } }),
  getExecutive: (symbol) => api.get(`/finnhub/executive/${symbol}`),
  getPeers: (symbol) => api.get(`/finnhub/peers/${symbol}`),
  getProfile: (params = {}) => api.get('/finnhub/profile', { params }),
  getProfile2: (symbol) => api.get(`/finnhub/profile2/${symbol}`),
  getCompanyNews: (symbol, from, to) =>
    api.get(`/finnhub/company-news/${symbol}`, { params: { from, to } }),
  getMarketNews: (category = 'general', minId = 0) =>
    api.get('/finnhub/market-news', { params: { category, minId } }),
  getNewsSentiment: (symbol) => api.get(`/finnhub/news-sentiment/${symbol}`),
  getPressReleases: (symbol, from, to) =>
    api.get(`/finnhub/press-releases/${symbol}`, { params: { from, to } }),
  getDividends: (symbol, from, to) =>
    api.get(`/finnhub/dividends/${symbol}`, { params: { from, to } }),
  getSplits: (symbol, from, to) =>
    api.get(`/finnhub/splits/${symbol}`, { params: { from, to } }),
  getStockSymbols: (params = {}) =>
    api.get('/finnhub/stock-symbols', { params }),
  getInsiderTransactions: (symbol, from, to) =>
    api.get(`/finnhub/insider-transactions/${symbol}`, { params: { from, to } }),
  getOwnership: (symbol, limit = 10) =>
    api.get(`/finnhub/ownership/${symbol}`, { params: { limit } }),
  getPriceTarget: (symbol) => api.get(`/finnhub/price-target/${symbol}`),
  getRecommendationTrends: (symbol) =>
    api.get(`/finnhub/recommendation-trends/${symbol}`),
  getUpgradeDowngrade: (params = {}) =>
    api.get('/finnhub/upgrade-downgrade', { params }),
  getSupportResistance: (symbol, resolution = 'D') =>
    api.get(`/finnhub/support-resistance/${symbol}`, { params: { resolution } }),
  getPatternRecognition: (symbol, resolution = 'D') =>
    api.get(`/finnhub/pattern-recognition/${symbol}`, { params: { resolution } }),
  getTechnicalIndicator: (symbol, params = {}) =>
    api.get(`/finnhub/technical-indicator/${symbol}`, { params }),
  getAggregateIndicator: (symbol, resolution = 'D') =>
    api.get(`/finnhub/aggregate-indicator/${symbol}`, { params: { resolution } }),
  getEarningsCalendar: (from, to) =>
    api.get('/finnhub/earnings-calendar', { params: { from, to } }),
  getIpoCalendar: (from, to) =>
    api.get('/finnhub/ipo-calendar', { params: { from, to } }),

  // Economic Data
  getEconomicCode: () => api.get('/finnhub/economic-code'),
  getEconomicData: (code) => api.get(`/finnhub/economic-data/${code}`),

  // Company Data
  getEsgScore: (symbol) => api.get(`/finnhub/esg/${symbol}`),
  getEarningsQualityScore: (symbol, freq = 'quarterly') =>
    api.get(`/finnhub/earnings-quality-score/${symbol}`, { params: { freq } }),
  getRevenueBreakdown: (symbol) =>
    api.get(`/finnhub/revenue-breakdown/${symbol}`),
  getFilings: (params = {}) => api.get('/finnhub/filings', { params }),
  getFinancials: (symbol, statement = 'ic', freq = 'annual') =>
    api.get(`/finnhub/financials/${symbol}`, { params: { statement, freq } }),
  getFinancialsReported: (params = {}) =>
    api.get('/finnhub/financials-reported', { params }),
  getTranscripts: (id) => api.get(`/finnhub/transcripts/${id}`),
  getTranscriptsList: (symbol) => api.get(`/finnhub/transcripts-list/${symbol}`),

  // Crypto
  getCryptoCandles: (symbol, params = {}) =>
    api.get(`/finnhub/crypto/candles/${symbol}`, { params }),
  getCryptoExchanges: () => api.get('/finnhub/crypto/exchanges'),
  getCryptoSymbols: (exchange) =>
    api.get(`/finnhub/crypto/symbols/${exchange}`),
  getCryptoProfile: (symbol) =>
    api.get(`/finnhub/crypto/profile/${symbol}`),

  // Forex
  getForexCandles: (symbol, params = {}) =>
    api.get(`/finnhub/forex/candles/${symbol}`, { params }),
  getForexExchanges: () => api.get('/finnhub/forex/exchanges'),
  getForexRates: (base = 'USD') =>
    api.get('/finnhub/forex/rates', { params: { base } }),
  getForexSymbols: (exchange) =>
    api.get(`/finnhub/forex/symbols/${exchange}`),

  // ETF
  getEtfProfile: (params = {}) => api.get('/finnhub/etf/profile', { params }),
  getEtfHoldings: (symbol) => api.get(`/finnhub/etf/holdings/${symbol}`),
  getEtfSectorExposure: (symbol) =>
    api.get(`/finnhub/etf/sector-exposure/${symbol}`),
  getEtfCountryExposure: (symbol) =>
    api.get(`/finnhub/etf/country-exposure/${symbol}`),

  // Mutual Fund
  getMutualFundProfile: (params = {}) =>
    api.get('/finnhub/mutual-fund/profile', { params }),
  getMutualFundHoldings: (symbol) =>
    api.get(`/finnhub/mutual-fund/holdings/${symbol}`),
  getMutualFundSectorExposure: (symbol) =>
    api.get(`/finnhub/mutual-fund/sector-exposure/${symbol}`),
  getMutualFundCountryExposure: (symbol) =>
    api.get(`/finnhub/mutual-fund/country-exposure/${symbol}`),

  // Indices
  getIndicesConstituents: (symbol) =>
    api.get(`/finnhub/indices/constituents/${symbol}`),
  getIndicesHistoricalConstituents: (symbol) =>
    api.get(`/finnhub/indices/historical-constituents/${symbol}`),

  // Market / Misc
  getStockTick: (symbol, params = {}) =>
    api.get(`/finnhub/tick/${symbol}`, { params }),
  getMarketStatus: (exchange = 'US') =>
    api.get('/finnhub/market-status', { params: { exchange } }),
  getMarketHoliday: (exchange = 'US') =>
    api.get('/finnhub/market-holiday', { params: { exchange } }),
  searchSymbols: (q, exchange) =>
    api.get('/finnhub/search', { params: { q, exchange } }),
  getCountry: () => api.get('/finnhub/country'),
  getCovid19: () => api.get('/finnhub/covid19'),
  getSocialSentiment: (symbol, from, to) =>
    api.get(`/finnhub/social-sentiment/${symbol}`, { params: { from, to } }),
  getInvestmentThemes: (theme) =>
    api.get(`/finnhub/investment-theme/${theme}`),
  getSupplyChain: (symbol) => api.get(`/finnhub/supply-chain/${symbol}`),
  getUsptoPatent: (symbol, from, to) =>
    api.get(`/finnhub/uspto-patent/${symbol}`, { params: { from, to } }),
  getVisaApplication: (symbol, from, to) =>
    api.get(`/finnhub/visa-application/${symbol}`, { params: { from, to } }),
  getInsiderSentiment: (symbol, from, to) =>
    api.get(`/finnhub/insider-sentiment/${symbol}`, { params: { from, to } }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Admin analytics
export const adminAPI = {
  getAll: () => api.get('/admin/analytics'),
  getOverview: () => api.get('/admin/analytics/overview'),
  getTimeseries: (minutes = 60) =>
    api.get('/admin/analytics/timeseries', { params: { minutes } }),
  getSystem: () => api.get('/admin/analytics/system'),
  getUsage: () => api.get('/admin/analytics/usage'),
  getSectors: () => api.get('/admin/analytics/sectors'),
};

export default api;
