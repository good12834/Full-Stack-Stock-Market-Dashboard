const axios = require('axios');
const Stock = require('../models/Stock');
const cacheService = require('./cacheService');

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';


// Default stocks to seed
const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
];

// Fallback data for demo/development when API keys are not set
const FALLBACK_PRICES = {
  AAPL: { price: 178.50, change: 2.30, changePercent: 1.31 },
  MSFT: { price: 420.80, change: -1.20, changePercent: -0.28 },
  GOOGL: { price: 175.30, change: 0.85, changePercent: 0.49 },
  AMZN: { price: 178.25, change: -0.45, changePercent: -0.25 },
  META: { price: 510.90, change: 3.50, changePercent: 0.69 },
  TSLA: { price: 245.60, change: -5.20, changePercent: -2.07 },
  NVDA: { price: 880.00, change: 15.40, changePercent: 1.78 },
  JPM: { price: 198.30, change: 1.10, changePercent: 0.56 },
  V: { price: 275.40, change: -0.60, changePercent: -0.22 },
  WMT: { price: 175.80, change: 0.90, changePercent: 0.51 },
};

// Crypto fallback prices (short symbols, used for demo and when API is unavailable).
// `change` is computed from `changePercent` in getFallbackData().
const CRYPTO_FALLBACK_PRICES = {
  BTC:   { price: 67542.80, changePercent: 2.34 },
  ETH:   { price: 3452.16,  changePercent: -1.23 },
  BNB:   { price: 601.45,   changePercent: 0.87 },
  SOL:   { price: 172.33,   changePercent: 5.61 },
  XRP:   { price: 0.6241,   changePercent: -0.45 },
  ADA:   { price: 0.4623,   changePercent: 1.12 },
  DOGE:  { price: 0.0832,   changePercent: -2.15 },
  DOT:   { price: 7.89,     changePercent: 0.34 },
  AVAX:  { price: 38.76,    changePercent: 3.21 },
  MATIC: { price: 0.7245,   changePercent: -0.89 },
  LINK:  { price: 14.56,    changePercent: 1.67 },
  UNI:   { price: 9.23,     changePercent: -1.01 },
};

const CRYPTO_SYMBOLS = new Set(Object.keys(CRYPTO_FALLBACK_PRICES));

// Map a short crypto symbol to its Finnhub crypto pair (e.g. MATIC -> BINANCE:MATICUSDT)
const toFinnhubCryptoSymbol = (symbol) => `BINANCE:${String(symbol).toUpperCase()}USDT`;

// Helper: get the base price (for chart generation) for any supported symbol.
// Returns a number; falls back to 150 for unknown symbols.
const getBasePrice = (symbol) => {
  const upper = String(symbol || '').toUpperCase();
  if (FALLBACK_PRICES[upper]) return FALLBACK_PRICES[upper].price;
  if (CRYPTO_FALLBACK_PRICES[upper]) return CRYPTO_FALLBACK_PRICES[upper].price;
  return 150;
};

// Helper: get normalized fallback quote data for any supported symbol (stock or crypto).
// Returns { symbol, price, change, changePercent } or null if the symbol is unknown.
const getFallbackData = (symbol) => {
  const upper = String(symbol || '').toUpperCase();
  const stock = FALLBACK_PRICES[upper];
  if (stock) {
    return {
      symbol: upper,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
    };
  }
  const crypto = CRYPTO_FALLBACK_PRICES[upper];
  if (crypto) {
    const change = crypto.price * (crypto.changePercent / 100);
    return {
      symbol: upper,
      price: crypto.price,
      change,
      changePercent: crypto.changePercent,
    };
  }
  return null;
};

// Rate limiter: ensure at least 1.5s between Finnhub API calls
let lastFinnhubCall = 0;
const MIN_FINNHUB_INTERVAL = 1500; // ms - stays under 60 req/min

const rateLimitDelay = async () => {
  const now = Date.now();
  const elapsed = now - lastFinnhubCall;
  if (elapsed < MIN_FINNHUB_INTERVAL) {
    const waitTime = MIN_FINNHUB_INTERVAL - elapsed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastFinnhubCall = Date.now();
};

// Fetch stock quote from Finnhub
const fetchFinnhubQuote = async (symbol) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'demo') return null;

  try {
    await rateLimitDelay();
    const response = await axios.get(`${FINNHUB_BASE}/quote`, {
      params: { symbol, token: apiKey },
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn(`Finnhub rate limited for ${symbol}. Using fallback.`);
    } else {
      console.warn(`Finnhub fetch error for ${symbol}:`, err.message);
    }
    return null;
  }
};

// Extract any error / rate-limit message from an Alpha Vantage response.
// Returns the first truthy message found, or null if the response is clean.
const getAlphaVantageError = (data) => {
  if (!data) return null;
  return (
    data['Error Message'] ||
    data['Note'] ||
    data['Information'] ||
    null
  );
};

// Fetch intraday (5min interval) data from Alpha Vantage
const fetchAlphaVantageIntraday = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === 'demo') return null;

  try {
    const response = await axios.get(`${ALPHA_VANTAGE_BASE}`, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval: '5min',
        apikey: apiKey,
      },
    });

    // Check for API error response (invalid key, rate limit, etc.)
    const avError = getAlphaVantageError(response.data);
    if (avError) {
      console.warn(`Alpha Vantage API error for ${symbol}: ${avError}`);
      return null;
    }

    const timeSeries = response.data['Time Series (5min)'];
    if (!timeSeries) return null;

    // Convert to sorted array of data points
    const intraday = Object.entries(timeSeries)
      .map(([time, values]) => ({
        time: new Date(time).toISOString(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10),
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    return intraday;
  } catch (err) {
    console.warn(`Alpha Vantage intraday fetch error for ${symbol}:`, err.message);
    return null;
  }
};

// Generate fallback intraday data for demo
const generateFallbackIntraday = (symbol) => {
  const basePrice = getBasePrice(symbol);
  const intraday = [];
  const now = new Date();
  // Generate data for the last 6 hours at 5min intervals
  for (let i = 72; i >= 0; i--) {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - i * 5);
    // Include all hours for demo purposes (not just market hours)
    // This ensures we always return data even outside market hours

    const volatility = 0.003;
    const change = basePrice * volatility * (Math.random() - 0.5);
    // Use basePrice when intraday array is empty (e.g. outside market hours)
    const lastClose = intraday.length > 0 ? intraday[intraday.length - 1].close : basePrice;
    const open = i === 72 || intraday.length === 0 ? basePrice : lastClose;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.002);
    const low = Math.min(open, close) * (1 - Math.random() * 0.002);
    intraday.push({
      time: date.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 500000) + 100000,
    });
  }
  return intraday;
};

// Fetch stock quote from Alpha Vantage
const fetchAlphaVantageQuote = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === 'demo') return null;

  try {
    const response = await axios.get(`${ALPHA_VANTAGE_BASE}`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: apiKey,
      },
    });

    // Check for API error response (invalid key, rate limit, etc.)
    const avError = getAlphaVantageError(response.data);
    if (avError) {
      console.warn(`Alpha Vantage API error for ${symbol}: ${avError}`);
      return null;
    }

    const quote = response.data['Global Quote'];
    if (!quote || !quote['05. price']) return null;

    return {
      c: parseFloat(quote['05. price']),
      d: parseFloat(quote['09. change']),
      dp: parseFloat(quote['10. change percent']?.replace('%', '')),
      h: parseFloat(quote['03. high']),
      l: parseFloat(quote['04. low']),
      o: parseFloat(quote['02. open']),
      pc: parseFloat(quote['08. previous close']),
    };
  } catch (err) {
    console.warn(`Alpha Vantage fetch error for ${symbol}:`, err.message);
    return null;
  }
};


// Get price update for a symbol (stocks + crypto)
const getStockPrice = async (symbol) => {
  const upperSymbol = String(symbol || '').toUpperCase();
  const isCrypto = CRYPTO_SYMBOLS.has(upperSymbol);

  // Try cache first
  const cacheKey = `stock:${upperSymbol}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // Try live API.
  // For known crypto symbols, request the BINANCE:SYMBOLUSDT pair from Finnhub.
  // Otherwise try the plain stock symbol.
  const apiSymbol = isCrypto ? toFinnhubCryptoSymbol(upperSymbol) : upperSymbol;
  let data = await fetchFinnhubQuote(apiSymbol);

  if (!data || !data.c) {
    // Finnhub failed or is disabled — try Alpha Vantage (stocks only)
    if (!isCrypto) {
      data = await fetchAlphaVantageQuote(upperSymbol);
    }
  }

  if (data && data.c) {
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || data.c,
      low: data.l || data.c,
      open: data.o || data.c,
      previousClose: data.pc || data.c,
    };

    // Cache the result
    await cacheService.set(cacheKey, stockData, 60); // 1 minute TTL

    // Update MongoDB (safe: wrap in try-catch to avoid crashing when DB is unavailable)
    try {
      await Stock.findByIdAndUpdate(
        symbol.toUpperCase(),
        {
          price: data.c,
          change: data.d || 0,
          changePercent: data.dp || 0,
          high: data.h || data.c,
          low: data.l || data.c,
          open: data.o || data.c,
          previousClose: data.pc || data.c,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    } catch (dbErr) {
      // MongoDB unavailable - continue without persisting to DB
      console.warn(`MongoDB unavailable, skipping DB update for ${symbol}: ${dbErr.message}`);
    }

    return stockData;
  }

  // Fallback to demo data (stocks + crypto)
  const fallback = getFallbackData(upperSymbol);
  if (fallback) {
    return {
      symbol: fallback.symbol,
      price: fallback.price,
      change: fallback.change,
      changePercent: fallback.changePercent,
      high: fallback.price * 1.01,
      low: fallback.price * 0.99,
      open: fallback.price - fallback.change,
      previousClose: fallback.price - fallback.change,
    };
  }

  // Last resort: check MongoDB (safe: wrapped in try-catch)
  try {
    const dbStock = await Stock.findById(symbol.toUpperCase());
    if (dbStock) {
      return {
        symbol: dbStock._id,
        price: dbStock.price,
        change: dbStock.change,
        changePercent: dbStock.changePercent,
        high: dbStock.high,
        low: dbStock.low,
        open: dbStock.open,
        previousClose: dbStock.previousClose,
      };
    }
  } catch (dbErr) {
    // MongoDB unavailable - return null to let caller handle it
    console.warn(`MongoDB unavailable, unable to fetch ${symbol} from DB: ${dbErr.message}`);
  }

  return null;
};

// Get historical data
const getHistoricalData = async (symbol, interval = 'daily') => {
  const cacheKey = `history:${symbol}:${interval}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // Try Finnhub
  const apiKey = process.env.FINNHUB_API_KEY;
  if (apiKey && apiKey !== 'demo') {
    try {
      await rateLimitDelay();
      const resolution = interval === 'weekly' ? 'W' : interval === 'monthly' ? 'M' : 'D';
      const to = Math.floor(Date.now() / 1000);
      const from = to - 365 * 24 * 60 * 60; // 1 year ago

      const response = await axios.get(`${FINNHUB_BASE}/stock/candle`, {
        params: {
          symbol,
          resolution,
          from,
          to,
          token: apiKey,
        },
      });

      if (response.data.s === 'ok') {
        const history = response.data.t.map((time, i) => ({
          time: new Date(time * 1000).toISOString(),
          open: response.data.o[i],
          high: response.data.h[i],
          low: response.data.l[i],
          close: response.data.c[i],
          volume: response.data.v[i],
        }));

        await cacheService.set(cacheKey, history, 300); // 5 min cache
        return history;
      }
    } catch (err) {
      console.warn(`History fetch error for ${symbol}:`, err.message);
    }
  }

  // Generate demo historical data (stocks + crypto)
  const basePrice = getBasePrice(symbol);
  const history = [];
  const now = new Date();
  for (let i = 180; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const volatility = 0.02;
    const change = basePrice * volatility * (Math.random() - 0.5);
    const open = i === 180 ? basePrice : history[history.length - 1].close;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    history.push({
      time: date.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }

  await cacheService.set(cacheKey, history, 300);
  return history;
};

// Get intraday data (5min intervals)
const getIntradayData = async (symbol) => {
  const cacheKey = `intraday:${symbol}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // Try Alpha Vantage first (now has a real API key)
  let data = await fetchAlphaVantageIntraday(symbol);

  // Fallback to generated intraday data if API fails
  if (!data || data.length === 0) {
    data = generateFallbackIntraday(symbol);
  }

  if (data && data.length > 0) {
    await cacheService.set(cacheKey, data, 60); // 1 min cache
  }
  return data;
};

// Get all default stocks with prices (parallelized for performance)
const getAllStocks = async () => {
  const priceResults = await Promise.allSettled(
    DEFAULT_STOCKS.map(async (stock) => {
      const priceData = await getStockPrice(stock.symbol);
      if (priceData) {
        return {
          symbol: stock.symbol,
          name: stock.name,
          ...priceData,
        };
      }
      return null;
    })
  );

  return priceResults
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
};

// Seed default stocks into database
const seedStocks = async () => {
  for (const stock of DEFAULT_STOCKS) {
    const fallback = FALLBACK_PRICES[stock.symbol];
    if (fallback) {
      try {
        await Stock.findByIdAndUpdate(
          stock.symbol,
          {
            name: stock.name,
            price: fallback.price,
            change: fallback.change,
            changePercent: fallback.changePercent,
            volume: Math.floor(Math.random() * 100000000) + 10000000,
            marketCap: fallback.price * (Math.floor(Math.random() * 10000000000) + 5000000000),
            pe: parseFloat((Math.random() * 30 + 10).toFixed(2)),
            high: fallback.price * 1.02,
            low: fallback.price * 0.98,
            open: fallback.price - fallback.change,
            previousClose: fallback.price - fallback.change,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      } catch (dbErr) {
        console.warn(`MongoDB unavailable, skipping seed for ${stock.symbol}: ${dbErr.message}`);
      }
    }
  }
  console.log('Default stocks seeded');
};

module.exports = {
  getStockPrice,
  getHistoricalData,
  getIntradayData,
  getAllStocks,
  seedStocks,
  DEFAULT_STOCKS,
  CRYPTO_FALLBACK_PRICES,
  CRYPTO_SYMBOLS,
};
