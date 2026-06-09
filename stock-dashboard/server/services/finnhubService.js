/**
 * Comprehensive Finnhub Service
 * Wraps all Finnhub API endpoints with:
 * - Rate limiting (60 req/min free tier)
 * - Redis caching
 * - Promisified async/await interface
 * - Graceful fallbacks / error handling
 */
const { getClient, promisify } = require('./finnhubClient');
const cacheService = require('./cacheService');

// Rate limiter: ensure at least 1s between API calls (stays under 60 req/min)
let lastCall = 0;
const MIN_INTERVAL = 1000;

const rateLimit = async () => {
  const now = Date.now();
  const elapsed = now - lastCall;
  if (elapsed < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - elapsed));
  }
  lastCall = Date.now();
};

/**
 * Wraps a Finnhub API call with caching and rate limiting.
 * @param {string} cacheKey - Redis cache key
 * @param {number} ttl - Cache TTL in seconds
 * @param {Function} apiCall - Async function that calls Finnhub
 */
const withCache = async (cacheKey, ttl, apiCall) => {
  // Check cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // Rate limit
  await rateLimit();

  // Execute the API call
  try {
    const result = await apiCall();
    if (result) {
      await cacheService.set(cacheKey, result, ttl);
    }
    return result;
  } catch (err) {
    console.warn(`Finnhub API error [${cacheKey}]:`, err.message);
    throw err;
  }
};

// ------------- STOCK DATA -------------

/**
 * Get stock quote for a symbol
 * GET /quote
 */
const getQuote = async (symbol) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'demo') return null;
  
  const client = getClient();
  if (!client) return null;

  const { data } = await promisify(client.quote)(symbol);
  return data;
};

/**
 * Get stock candles (historical OHLCV)
 * GET /stock/candle
 */
const getStockCandles = async (symbol, resolution = 'D', from, to) => {
  const client = getClient();
  if (!client) return null;
  try {
    const { data } = await promisify(client.stockCandles)(symbol, resolution, from, to);
    if (data && data.s === 'no_data') {
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Finnhub stock candles error for ${symbol}:`, err.message);
    return null;
  }
};

/**
 * Get basic financials
 * GET /stock/metric
 */
const getBasicFinancials = async (symbol, metric = 'all') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyBasicFinancials)(symbol, metric);
  return data;
};

/**
 * Get company earnings
 * GET /stock/earnings
 */
const getCompanyEarnings = async (symbol, limit = 5) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEarnings)(symbol, { limit });
  return data;
};

/**
 * Get company EPS estimates
 * GET /stock/eps-estimate
 */
const getEpsEstimates = async (symbol, freq = 'annual') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEpsEstimates)(symbol, { freq });
  return data;
};

/**
 * Get company revenue estimates
 * GET /stock/revenue-estimate
 */
const getRevenueEstimates = async (symbol, freq = 'annual') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyRevenueEstimates)(symbol, { freq });
  return data;
};

/**
 * Get EBITDA estimates
 * GET /stock/ebitda-estimate
 */
const getEbitdaEstimates = async (symbol, freq = 'annual') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEbitdaEstimates)(symbol, { freq });
  return data;
};

/**
 * Get EBIT estimates
 * GET /stock/ebit-estimate
 */
const getEbitEstimates = async (symbol, freq = 'annual') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEbitEstimates)(symbol, { freq });
  return data;
};

/**
 * Get company executive info
 * GET /stock/executive
 */
const getCompanyExecutive = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyExecutive)(symbol);
  return data;
};

/**
 * Get company peers
 * GET /stock/peers
 */
const getCompanyPeers = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyPeers)(symbol);
  return data;
};

/**
 * Get company profile (by symbol, isin, or cusip)
 * GET /stock/profile
 */
const getCompanyProfile = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyProfile)(opts);
  return data;
};

/**
 * Get company profile2 (by symbol)
 * GET /stock/profile2
 */
const getCompanyProfile2 = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyProfile2)(opts);
  return data;
};

/**
 * Get company news
 * GET /company-news
 */
const getCompanyNews = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyNews)(symbol, from, to);
  return data;
};

/**
 * Get market news (general)
 * GET /news
 */
const getMarketNews = async (category = 'general', minId = 0) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.marketNews)(category, { minId });
  return data;
};

/**
 * Get news sentiment
 * GET /news-sentiment
 */
const getNewsSentiment = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.newsSentiment)(symbol);
  return data;
};

/**
 * Get press releases (major developments)
 * GET /press-releases
 */
const getPressReleases = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.pressReleases)(symbol, { from, to });
  return data;
};

/**
 * Get stock dividends
 * GET /stock/dividend
 */
const getStockDividends = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockDividends)(symbol, from, to);
  return data;
};

/**
 * Get stock splits
 * GET /stock/split
 */
const getStockSplits = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockSplits)(symbol, from, to);
  return data;
};

/**
 * Get stock symbols for an exchange
 * GET /stock/symbol
 */
const getStockSymbols = async (exchange = 'US', opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockSymbols)(exchange, opts);
  return data;
};

/**
 * Get insider transactions
 * GET /stock/insider-transactions
 */
const getInsiderTransactions = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.insiderTransactions)(symbol, { from, to });
  return data;
};

/**
 * Get fund ownership
 * GET /stock/ownership
 */
const getOwnership = async (symbol, limit = 10) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.ownership)(symbol, { limit });
  return data;
};

/**
 * Get fund ownership (alias)
 */
const getFundOwnership = async (symbol, limit = 10) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.ownership)(symbol, { limit });
  return data;
};

/**
 * Get price target
 * GET /stock/price-target
 */
const getPriceTarget = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.priceTarget)(symbol);
  return data;
};

/**
 * Get recommendation trends
 * GET /stock/recommendation
 */
const getRecommendationTrends = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.recommendationTrends)(symbol);
  return data;
};

/**
 * Get upgrade/downgrade
 * GET /stock/upgrade-downgrade
 */
const getUpgradeDowngrade = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.upgradeDowngrade)(opts);
  return data;
};

/**
 * Get support/resistance levels
 * GET /scan/support-resistance
 */
const getSupportResistance = async (symbol, resolution = 'D') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.supportResistance)(symbol, resolution);
  return data;
};

/**
 * Get pattern recognition
 * GET /scan/pattern
 */
const getPatternRecognition = async (symbol, resolution = 'D') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.patternRecognition)(symbol, resolution);
  return data;
};

/**
 * Get technical indicator
 * GET /indicator
 */
const getTechnicalIndicator = async (symbol, resolution, from, to, indicator, opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.technicalIndicator)(symbol, resolution, from, to, indicator, opts);
  return data;
};

/**
 * Get aggregate indicator
 * GET /scan/technical-indicator
 */
const getAggregateIndicator = async (symbol, resolution = 'D') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.aggregateIndicator)(symbol, resolution);
  return data;
};

/**
 * Get earnings calendar
 * GET /calendar/ipo (actually earnings calendar is separate)
 */
const getEarningsCalendar = async (from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.earningsCalendar)({ from, to });
  return data;
};

/**
 * Get IPO calendar
 * GET /calendar/ipo
 */
const getIpoCalendar = async (from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.ipoCalendar)(from, to);
  return data;
};

// ------------- ECONOMIC DATA -------------

/**
 * Get economic codes
 * GET /economic-code
 */
const getEconomicCode = async () => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.economicCode)();
  return data;
};

/**
 * Get economic data
 * GET /economic
 */
const getEconomicData = async (code) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.economicData)(code);
  return data;
};

// ------------- COMPANY DATA -------------

/**
 * Get company ESG score
 * GET /stock/esg
 */
const getCompanyEsgScore = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEsgScore)(symbol);
  return data;
};

/**
 * Get company earnings quality score
 * GET /stock/earnings-quality-score
 */
const getEarningsQualityScore = async (symbol, freq = 'quarterly') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.companyEarningsQualityScore)(symbol, freq);
  return data;
};

/**
 * Get revenue breakdown
 * GET /stock/revenue-breakdown
 */
const getRevenueBreakdown = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.revenueBreakdown)(opts);
  return data;
};

/**
 * Get company filings
 * GET /stock/filings
 */
const getFilings = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.filings)(opts);
  return data;
};

/**
 * Get financials (income statement, balance sheet, cash flow)
 * GET /stock/financials
 */
const getFinancials = async (symbol, statement = 'ic', freq = 'annual') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.financials)(symbol, statement, freq);
  return data;
};

/**
 * Get financials reported
 * GET /stock/financials-reported
 */
const getFinancialsReported = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.financialsReported)(opts);
  return data;
};

/**
 * Get transcripts
 * GET /stock/transcripts
 */
const getTranscripts = async (id) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.transcripts)(id);
  return data;
};

/**
 * Get transcripts list
 * GET /stock/transcripts/list
 */
const getTranscriptsList = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.transcriptsList)(symbol);
  return data;
};

// ------------- CRYPTO -------------

/**
 * Get crypto candles
 * GET /crypto/candle
 */
const getCryptoCandles = async (symbol, resolution, from, to) => {
  const client = getClient();
  if (!client) return null;
  try {
    const { data } = await promisify(client.cryptoCandles)(symbol, resolution, from, to);
    // Finnhub returns { s: 'no_data' } when no data available
    if (data && data.s === 'no_data') {
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Finnhub crypto candles error for ${symbol}:`, err.message);
    return null;
  }
};

/**
 * Get crypto exchanges
 * GET /crypto/exchange
 */
const getCryptoExchanges = async () => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.cryptoExchanges)();
  return data;
};

/**
 * Get crypto symbols
 * GET /crypto/symbol
 */
const getCryptoSymbols = async (exchange) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.cryptoSymbols)(exchange);
  return data;
};

/**
 * Get crypto profile
 * GET /crypto/profile
 */
const getCryptoProfile = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.cryptoProfile)(symbol);
  return data;
};

// ------------- FOREX -------------

/**
 * Get forex candles
 * GET /forex/candle
 */
const getForexCandles = async (symbol, resolution, from, to) => {
  const client = getClient();
  if (!client) return null;
  try {
    const { data } = await promisify(client.forexCandles)(symbol, resolution, from, to);
    // Finnhub returns { s: 'no_data' } when no data available
    if (data && data.s === 'no_data') {
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Finnhub forex candles error for ${symbol}:`, err.message);
    return null;
  }
};

/**
 * Get forex exchanges
 * GET /forex/exchange
 */
const getForexExchanges = async () => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.forexExchanges)();
  return data;
};

/**
 * Get forex rates
 * GET /forex/rates
 */
const getForexRates = async (base = 'USD') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.forexRates)({ base });
  return data;
};

/**
 * Get forex symbols
 * GET /forex/symbol
 */
const getForexSymbols = async (exchange) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.forexSymbols)(exchange);
  return data;
};

// ------------- ETF -------------

/**
 * Get ETF profile
 * GET /etf/profile
 */
const getEtfProfile = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.etfsProfile)(opts);
  return data;
};

/**
 * Get ETF holdings
 * GET /etf/holdings
 */
const getEtfHoldings = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.etfsHoldings)(opts);
  return data;
};

/**
 * Get ETF sector/industry exposure
 * GET /etf/sector
 */
const getEtfSectorExposure = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.etfsSectorExposure)(symbol);
  return data;
};

/**
 * Get ETF country exposure
 * GET /etf/country
 */
const getEtfCountryExposure = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.etfsCountryExposure)(symbol);
  return data;
};

// ------------- MUTUAL FUND -------------

/**
 * Get mutual fund profile
 * GET /mutual-fund/profile
 */
const getMutualFundProfile = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.mutualFundProfile)(opts);
  return data;
};

/**
 * Get mutual fund holdings
 * GET /mutual-fund/holdings
 */
const getMutualFundHoldings = async (opts = {}) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.mutualFundHoldings)(opts);
  return data;
};

/**
 * Get mutual fund sector exposure
 * GET /mutual-fund/sector
 */
const getMutualFundSectorExposure = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.mutualFundSectorExposure)(symbol);
  return data;
};

/**
 * Get mutual fund country exposure
 * GET /mutual-fund/country
 */
const getMutualFundCountryExposure = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.mutualFundCountryExposure)(symbol);
  return data;
};

// ------------- INDICES -------------

/**
 * Get indices constituents
 * GET /index/constituents
 */
const getIndicesConstituents = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.indicesConstituents)(symbol);
  return data;
};

/**
 * Get indices historical constituents
 * GET /index/historical-constituents
 */
const getIndicesHistoricalConstituents = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.indicesHistoricalConstituents)(symbol);
  return data;
};

// ------------- TICK DATA -------------

/**
 * Get stock tick data
 * GET /stock/tick
 */
const getStockTick = async (symbol, date, limit = 500, skip = 0) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockTick)(symbol, date, limit, skip);
  return data;
};

// ------------- OTHER -------------

/**
 * Get country list
 * GET /country
 */
const getCountry = async () => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.country)();
  return data;
};

/**
 * Get COVID-19 data
 * GET /covid19/us
 */
const getCovid19 = async () => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.covid19)();
  return data;
};

/**
 * Get social sentiment
 * GET /stock/social-sentiment
 */
const getSocialSentiment = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.socialSentiment)(symbol, { from, to });
  return data;
};

/**
 * Get investment theme
 * GET /stock/investment-theme
 */
const getInvestmentThemes = async (theme) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.investmentThemes)(theme);
  return data;
};

/**
 * Get supply chain relationships
 * GET /stock/supply-chain
 */
const getSupplyChainRelationships = async (symbol) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.supplyChainRelationships)(symbol);
  return data;
};

/**
 * Get USPTO patent data
 * GET /stock/uspto-patent
 */
const getUsptoPatent = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockUsptoPatent)(symbol, from, to);
  return data;
};

/**
 * Get visa application data
 * GET /stock/visa-application
 */
const getVisaApplication = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.stockVisaApplication)(symbol, from, to);
  return data;
};

/**
 * Get market status
 * GET /stock/market-status
 */
const getMarketStatus = async (exchange = 'US') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.marketStatus)(exchange);
  return data;
};

/**
 * Get market holiday
 * GET /stock/market-holiday
 */
const getMarketHoliday = async (exchange = 'US') => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.marketHoliday)(exchange);
  return data;
};

/**
 * Symbol search
 * GET /search
 */
const symbolSearch = async (query, exchange) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.symbolSearch)(query, { exchange });
  return data;
};

/**
 * Get insider sentiment
 * GET /stock/insider-sentiment
 */
const getInsiderSentiment = async (symbol, from, to) => {
  const client = getClient();
  if (!client) return null;
  const { data } = await promisify(client.insiderSentiment)(symbol, from, to);
  return data;
};

// ------------- CACHED WRAPPERS -------------

const cachedGetQuote = async (symbol) => {
  return withCache(`finnhub:quote:${symbol}`, 30, () => getQuote(symbol));
};

const cachedGetBasicFinancials = async (symbol, metric = 'all') => {
  return withCache(`finnhub:financials:${symbol}:${metric}`, 3600, () => getBasicFinancials(symbol, metric));
};

const cachedGetCompanyProfile = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:profile:${key}`, 86400, () => getCompanyProfile(opts));
};

const cachedGetCompanyProfile2 = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:profile2:${key}`, 86400, () => getCompanyProfile2(opts));
};

const cachedGetCompanyPeers = async (symbol) => {
  return withCache(`finnhub:peers:${symbol}`, 86400, () => getCompanyPeers(symbol));
};

const cachedGetCompanyExecutive = async (symbol) => {
  return withCache(`finnhub:executive:${symbol}`, 86400, () => getCompanyExecutive(symbol));
};

const cachedGetCompanyEarnings = async (symbol, limit = 5) => {
  return withCache(`finnhub:earnings:${symbol}:${limit}`, 86400, () => getCompanyEarnings(symbol, limit));
};

const cachedGetEpsEstimates = async (symbol, freq = 'annual') => {
  return withCache(`finnhub:eps:${symbol}:${freq}`, 86400, () => getEpsEstimates(symbol, freq));
};

const cachedGetRevenueEstimates = async (symbol, freq = 'annual') => {
  return withCache(`finnhub:revenue:${symbol}:${freq}`, 86400, () => getRevenueEstimates(symbol, freq));
};

const cachedGetEbitdaEstimates = async (symbol, freq = 'annual') => {
  return withCache(`finnhub:ebitda:${symbol}:${freq}`, 86400, () => getEbitdaEstimates(symbol, freq));
};

const cachedGetEbitEstimates = async (symbol, freq = 'annual') => {
  return withCache(`finnhub:ebit:${symbol}:${freq}`, 86400, () => getEbitEstimates(symbol, freq));
};

const cachedGetRecommendationTrends = async (symbol) => {
  return withCache(`finnhub:rec:${symbol}`, 86400, () => getRecommendationTrends(symbol));
};

const cachedGetPriceTarget = async (symbol) => {
  return withCache(`finnhub:pt:${symbol}`, 3600, () => getPriceTarget(symbol));
};

const cachedGetNewsSentiment = async (symbol) => {
  return withCache(`finnhub:sentiment:${symbol}`, 3600, () => getNewsSentiment(symbol));
};

const cachedGetMarketNews = async (category = 'general', minId = 0) => {
  return withCache(`finnhub:news:${category}:${minId}`, 300, () => getMarketNews(category, minId));
};

const cachedGetCompanyNews = async (symbol, from, to) => {
  return withCache(`finnhub:companynews:${symbol}:${from}:${to}`, 600, () => getCompanyNews(symbol, from, to));
};

const cachedGetStockDividends = async (symbol, from, to) => {
  return withCache(`finnhub:dividends:${symbol}:${from}:${to}`, 86400, () => getStockDividends(symbol, from, to));
};

const cachedGetStockSplits = async (symbol, from, to) => {
  return withCache(`finnhub:splits:${symbol}:${from}:${to}`, 86400, () => getStockSplits(symbol, from, to));
};

const cachedGetOwnership = async (symbol, limit = 10) => {
  return withCache(`finnhub:ownership:${symbol}:${limit}`, 86400, () => getOwnership(symbol, limit));
};

const cachedGetInsiderTransactions = async (symbol, from, to) => {
  return withCache(`finnhub:insider:${symbol}:${from}:${to}`, 86400, () => getInsiderTransactions(symbol, from, to));
};

const cachedGetUpgradeDowngrade = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:updown:${key}`, 86400, () => getUpgradeDowngrade(opts));
};

const cachedGetFinancials = async (symbol, statement = 'ic', freq = 'annual') => {
  return withCache(`finnhub:financials:${symbol}:${statement}:${freq}`, 86400, () => getFinancials(symbol, statement, freq));
};

const cachedGetFilings = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:filings:${key}`, 86400, () => getFilings(opts));
};

const cachedGetEarningsCalendar = async (from, to) => {
  return withCache(`finnhub:earningscal:${from}:${to}`, 3600, () => getEarningsCalendar(from, to));
};

const cachedGetIpoCalendar = async (from, to) => {
  return withCache(`finnhub:ipo:${from}:${to}`, 3600, () => getIpoCalendar(from, to));
};

const cachedGetEconomicCode = async () => {
  return withCache('finnhub:econocode', 86400, () => getEconomicCode());
};

const cachedGetEconomicData = async (code) => {
  return withCache(`finnhub:econodata:${code}`, 86400, () => getEconomicData(code));
};

const cachedGetCompanyEsgScore = async (symbol) => {
  return withCache(`finnhub:esg:${symbol}`, 86400, () => getCompanyEsgScore(symbol));
};

const cachedGetEarningsQualityScore = async (symbol, freq = 'quarterly') => {
  return withCache(`finnhub:eqs:${symbol}:${freq}`, 86400, () => getEarningsQualityScore(symbol, freq));
};

const cachedGetRevenueBreakdown = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:revenuebd:${key}`, 86400, () => getRevenueBreakdown(opts));
};

const cachedGetSupportResistance = async (symbol, resolution = 'D') => {
  return withCache(`finnhub:sr:${symbol}:${resolution}`, 3600, () => getSupportResistance(symbol, resolution));
};

const cachedGetPatternRecognition = async (symbol, resolution = 'D') => {
  return withCache(`finnhub:pattern:${symbol}:${resolution}`, 3600, () => getPatternRecognition(symbol, resolution));
};

const cachedGetAggregateIndicator = async (symbol, resolution = 'D') => {
  return withCache(`finnhub:aggind:${symbol}:${resolution}`, 3600, () => getAggregateIndicator(symbol, resolution));
};

const cachedGetMarketStatus = async (exchange = 'US') => {
  return withCache(`finnhub:marketstatus:${exchange}`, 600, () => getMarketStatus(exchange));
};

const cachedGetSocialSentiment = async (symbol, from, to) => {
  return withCache(`finnhub:socialsent:${symbol}:${from}:${to}`, 3600, () => getSocialSentiment(symbol, from, to));
};

const cachedGetInvestmentThemes = async (theme) => {
  return withCache(`finnhub:theme:${theme}`, 86400, () => getInvestmentThemes(theme));
};

const cachedGetSupplyChain = async (symbol) => {
  return withCache(`finnhub:supplychain:${symbol}`, 86400, () => getSupplyChainRelationships(symbol));
};

const cachedGetStockSymbols = async (exchange = 'US', opts = {}) => {
  const key = `exchange=${exchange}:${Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':')}`;
  return withCache(`finnhub:symbols:${key}`, 86400, () => getStockSymbols(exchange, opts));
};

const cachedGetCryptoProfile = async (symbol) => {
  return withCache(`finnhub:crpro:${symbol}`, 86400, () => getCryptoProfile(symbol));
};

const cachedGetEtfProfile = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:etfpro:${key}`, 86400, () => getEtfProfile(opts));
};

const cachedGetMutualFundProfile = async (opts = {}) => {
  const key = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(':');
  return withCache(`finnhub:mfpro:${key}`, 86400, () => getMutualFundProfile(opts));
};

const cachedGetIndicesConstituents = async (symbol) => {
  return withCache(`finnhub:index:${symbol}`, 86400, () => getIndicesConstituents(symbol));
};

module.exports = {
  // Direct (uncached) API calls
  getQuote,
  getStockCandles,
  getBasicFinancials,
  getCompanyEarnings,
  getEpsEstimates,
  getRevenueEstimates,
  getEbitdaEstimates,
  getEbitEstimates,
  getCompanyExecutive,
  getCompanyPeers,
  getCompanyProfile,
  getCompanyProfile2,
  getCompanyNews,
  getMarketNews,
  getNewsSentiment,
  getPressReleases,
  getStockDividends,
  getStockSplits,
  getStockSymbols,
  getInsiderTransactions,
  getOwnership,
  getFundOwnership,
  getPriceTarget,
  getRecommendationTrends,
  getUpgradeDowngrade,
  getSupportResistance,
  getPatternRecognition,
  getTechnicalIndicator,
  getAggregateIndicator,
  getEarningsCalendar,
  getIpoCalendar,
  getEconomicCode,
  getEconomicData,
  getCompanyEsgScore,
  getEarningsQualityScore,
  getRevenueBreakdown,
  getFilings,
  getFinancials,
  getFinancialsReported,
  getTranscripts,
  getTranscriptsList,
  getCryptoCandles,
  getCryptoExchanges,
  getCryptoSymbols,
  getCryptoProfile,
  getForexCandles,
  getForexExchanges,
  getForexRates,
  getForexSymbols,
  getEtfProfile,
  getEtfHoldings,
  getEtfSectorExposure,
  getEtfCountryExposure,
  getMutualFundProfile,
  getMutualFundHoldings,
  getMutualFundSectorExposure,
  getMutualFundCountryExposure,
  getIndicesConstituents,
  getIndicesHistoricalConstituents,
  getStockTick,
  getCountry,
  getCovid19,
  getSocialSentiment,
  getInvestmentThemes,
  getSupplyChainRelationships,
  getUsptoPatent,
  getVisaApplication,
  getMarketStatus,
  getMarketHoliday,
  symbolSearch,
  getInsiderSentiment,

  // Cached wrappers (recommended for most use cases)
  cachedGetQuote,
  cachedGetBasicFinancials,
  cachedGetCompanyProfile,
  cachedGetCompanyProfile2,
  cachedGetCompanyPeers,
  cachedGetCompanyExecutive,
  cachedGetCompanyEarnings,
  cachedGetEpsEstimates,
  cachedGetRevenueEstimates,
  cachedGetEbitdaEstimates,
  cachedGetEbitEstimates,
  cachedGetRecommendationTrends,
  cachedGetPriceTarget,
  cachedGetNewsSentiment,
  cachedGetMarketNews,
  cachedGetCompanyNews,
  cachedGetStockDividends,
  cachedGetStockSplits,
  cachedGetOwnership,
  cachedGetInsiderTransactions,
  cachedGetUpgradeDowngrade,
  cachedGetFinancials,
  cachedGetFilings,
  cachedGetEarningsCalendar,
  cachedGetIpoCalendar,
  cachedGetEconomicCode,
  cachedGetEconomicData,
  cachedGetCompanyEsgScore,
  cachedGetEarningsQualityScore,
  cachedGetRevenueBreakdown,
  cachedGetSupportResistance,
  cachedGetPatternRecognition,
  cachedGetAggregateIndicator,
  cachedGetMarketStatus,
  cachedGetSocialSentiment,
  cachedGetInvestmentThemes,
  cachedGetSupplyChain,
  cachedGetStockSymbols,
  cachedGetCryptoProfile,
  cachedGetEtfProfile,
  cachedGetMutualFundProfile,
  cachedGetIndicesConstituents,
};