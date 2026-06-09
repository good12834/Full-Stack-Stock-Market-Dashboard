/**
 * Finnhub Controller
 * Provides Express route handlers for all Finnhub API endpoints.
 * Each handler calls the corresponding finnhubService method,
 * with error handling and consistent JSON response format.
 */
const finnhubService = require('../services/finnhubService');

// Helper to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to send a success response
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

// Helper to send an error response
const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// ------------- STOCK QUOTE -------------

/**
 * GET /api/finnhub/quote/:symbol
 * Get real-time stock quote
 */
const getQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetQuote(symbol.toUpperCase());
  if (!data) return sendError(res, 'Quote data not available', 404);
  sendSuccess(res, data);
});

// ------------- STOCK CANDLES -------------

/**
 * GET /api/finnhub/candles/:symbol
 * Query: resolution, from, to (unix timestamps)
 */
const getCandles = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D', from, to } = req.query;
  const toTs = to || Math.floor(Date.now() / 1000);
  const fromTs = from || toTs - 365 * 24 * 60 * 60;
  const data = await finnhubService.getStockCandles(symbol.toUpperCase(), resolution, fromTs, toTs);
  if (!data) return sendError(res, 'Candle data not available', 404);
  sendSuccess(res, data);
});

// ------------- BASIC FINANCIALS -------------

/**
 * GET /api/finnhub/basic-financials/:symbol
 * Query: metric (default: all)
 */
const getBasicFinancials = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { metric = 'all' } = req.query;
  const data = await finnhubService.cachedGetBasicFinancials(symbol.toUpperCase(), metric);
  if (!data) return sendError(res, 'Financial data not available', 404);
  sendSuccess(res, data);
});

// ------------- COMPANY EARNINGS -------------

/**
 * GET /api/finnhub/earnings/:symbol
 * Query: limit (default: 5)
 */
const getEarnings = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { limit = 5 } = req.query;
  const data = await finnhubService.cachedGetCompanyEarnings(symbol.toUpperCase(), parseInt(limit));
  sendSuccess(res, data || []);
});

// ------------- EPS ESTIMATES -------------

/**
 * GET /api/finnhub/eps-estimates/:symbol
 * Query: freq (annual | quarterly)
 */
const getEpsEstimates = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { freq = 'annual' } = req.query;
  const data = await finnhubService.cachedGetEpsEstimates(symbol.toUpperCase(), freq);
  sendSuccess(res, data || {});
});

// ------------- REVENUE ESTIMATES -------------

/**
 * GET /api/finnhub/revenue-estimates/:symbol
 * Query: freq (annual | quarterly)
 */
const getRevenueEstimates = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { freq = 'annual' } = req.query;
  const data = await finnhubService.cachedGetRevenueEstimates(symbol.toUpperCase(), freq);
  sendSuccess(res, data || {});
});

// ------------- EBITDA ESTIMATES -------------

/**
 * GET /api/finnhub/ebitda-estimates/:symbol
 * Query: freq (annual | quarterly)
 */
const getEbitdaEstimates = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { freq = 'annual' } = req.query;
  const data = await finnhubService.cachedGetEbitdaEstimates(symbol.toUpperCase(), freq);
  sendSuccess(res, data || {});
});

// ------------- EBIT ESTIMATES -------------

/**
 * GET /api/finnhub/ebit-estimates/:symbol
 * Query: freq (annual | quarterly)
 */
const getEbitEstimates = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { freq = 'annual' } = req.query;
  const data = await finnhubService.cachedGetEbitEstimates(symbol.toUpperCase(), freq);
  sendSuccess(res, data || {});
});

// ------------- COMPANY EXECUTIVE -------------

/**
 * GET /api/finnhub/executive/:symbol
 */
const getCompanyExecutive = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetCompanyExecutive(symbol.toUpperCase());
  sendSuccess(res, data || []);
});

// ------------- COMPANY PEERS -------------

/**
 * GET /api/finnhub/peers/:symbol
 */
const getCompanyPeers = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetCompanyPeers(symbol.toUpperCase());
  sendSuccess(res, data || []);
});

// ------------- COMPANY PROFILE -------------

/**
 * GET /api/finnhub/profile
 * Query: symbol, isin, cusip
 */
const getCompanyProfile = asyncHandler(async (req, res) => {
  const { symbol, isin, cusip } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol.toUpperCase();
  if (isin) opts.isin = isin;
  if (cusip) opts.cusip = cusip;
  const data = await finnhubService.cachedGetCompanyProfile(opts);
  if (!data) return sendError(res, 'Profile not found', 404);
  sendSuccess(res, data);
});

/**
 * GET /api/finnhub/profile2/:symbol
 */
const getCompanyProfile2 = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetCompanyProfile2({ symbol: symbol.toUpperCase() });
  if (!data) return sendError(res, 'Profile not found', 404);
  sendSuccess(res, data);
});

// ------------- COMPANY NEWS -------------

/**
 * GET /api/finnhub/company-news/:symbol
 * Query: from, to (YYYY-MM-DD)
 */
const getCompanyNews = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await finnhubService.cachedGetCompanyNews(symbol.toUpperCase(), fromDate, toDate);
  sendSuccess(res, data || []);
});

// ------------- MARKET NEWS -------------

/**
 * GET /api/finnhub/market-news
 * Query: category (general, forex, crypto, merger), minId
 */
const getMarketNews = asyncHandler(async (req, res) => {
  const { category = 'general', minId = 0 } = req.query;
  const data = await finnhubService.cachedGetMarketNews(category, parseInt(minId));
  sendSuccess(res, data || []);
});

// ------------- NEWS SENTIMENT -------------

/**
 * GET /api/finnhub/news-sentiment/:symbol
 */
const getNewsSentiment = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetNewsSentiment(symbol.toUpperCase());
  sendSuccess(res, data || {});
});

// ------------- PRESS RELEASES -------------

/**
 * GET /api/finnhub/press-releases/:symbol
 * Query: from, to (YYYY-MM-DD)
 */
const getPressReleases = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.getPressReleases(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || []);
});

// ------------- STOCK DIVIDENDS -------------

/**
 * GET /api/finnhub/dividends/:symbol
 * Query: from, to (YYYY-MM-DD)
 */
const getStockDividends = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await finnhubService.cachedGetStockDividends(symbol.toUpperCase(), fromDate, toDate);
  sendSuccess(res, data || []);
});

// ------------- STOCK SPLITS -------------

/**
 * GET /api/finnhub/splits/:symbol
 * Query: from, to (YYYY-MM-DD)
 */
const getStockSplits = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || '2000-01-01';
  const data = await finnhubService.cachedGetStockSplits(symbol.toUpperCase(), fromDate, toDate);
  sendSuccess(res, data || []);
});

// ------------- STOCK SYMBOLS -------------

/**
 * GET /api/finnhub/stock-symbols
 * Query: exchange (default: US), mic, securityType, currency
 */
const getStockSymbols = asyncHandler(async (req, res) => {
  const { exchange = 'US', mic, securityType, currency } = req.query;
  const opts = {};
  if (mic) opts.mic = mic;
  if (securityType) opts.securityType = securityType;
  if (currency) opts.currency = currency;
  const data = await finnhubService.cachedGetStockSymbols(exchange, opts);
  sendSuccess(res, data || []);
});

// ------------- INSIDER TRANSACTIONS -------------

/**
 * GET /api/finnhub/insider-transactions/:symbol
 * Query: from, to
 */
const getInsiderTransactions = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.cachedGetInsiderTransactions(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || {});
});

// ------------- FUND OWNERSHIP -------------

/**
 * GET /api/finnhub/ownership/:symbol
 * Query: limit (default: 10)
 */
const getOwnership = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { limit = 10 } = req.query;
  const data = await finnhubService.cachedGetOwnership(symbol.toUpperCase(), parseInt(limit));
  sendSuccess(res, data || {});
});

// ------------- PRICE TARGET -------------

/**
 * GET /api/finnhub/price-target/:symbol
 */
const getPriceTarget = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetPriceTarget(symbol.toUpperCase());
  sendSuccess(res, data || {});
});

// ------------- RECOMMENDATION TRENDS -------------

/**
 * GET /api/finnhub/recommendation-trends/:symbol
 */
const getRecommendationTrends = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetRecommendationTrends(symbol.toUpperCase());
  sendSuccess(res, data || []);
});

// ------------- UPGRADE/DOWNGRADE -------------

/**
 * GET /api/finnhub/upgrade-downgrade
 * Query: symbol, from, to
 */
const getUpgradeDowngrade = asyncHandler(async (req, res) => {
  const { symbol, from, to } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol.toUpperCase();
  if (from) opts.from = from;
  if (to) opts.to = to;
  const data = await finnhubService.cachedGetUpgradeDowngrade(opts);
  sendSuccess(res, data || []);
});

// ------------- SUPPORT / RESISTANCE -------------

/**
 * GET /api/finnhub/support-resistance/:symbol
 * Query: resolution (default: D)
 */
const getSupportResistance = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D' } = req.query;
  const data = await finnhubService.cachedGetSupportResistance(symbol.toUpperCase(), resolution);
  sendSuccess(res, data || {});
});

// ------------- PATTERN RECOGNITION -------------

/**
 * GET /api/finnhub/pattern-recognition/:symbol
 * Query: resolution (default: D)
 */
const getPatternRecognition = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D' } = req.query;
  const data = await finnhubService.cachedGetPatternRecognition(symbol.toUpperCase(), resolution);
  sendSuccess(res, data || {});
});

// ------------- TECHNICAL INDICATOR -------------

/**
 * GET /api/finnhub/technical-indicator/:symbol
 * Query: resolution, from, to, indicator, and any additional params
 */
const getTechnicalIndicator = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D', from, to, indicator = 'macd', ...indicatorOpts } = req.query;
  const toTs = to || Math.floor(Date.now() / 1000);
  const fromTs = from || toTs - 365 * 24 * 60 * 60;
  const data = await finnhubService.getTechnicalIndicator(
    symbol.toUpperCase(), resolution, fromTs, toTs, indicator, indicatorOpts
  );
  sendSuccess(res, data || {});
});

// ------------- AGGREGATE INDICATOR -------------

/**
 * GET /api/finnhub/aggregate-indicator/:symbol
 * Query: resolution (default: D)
 */
const getAggregateIndicator = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D' } = req.query;
  const data = await finnhubService.cachedGetAggregateIndicator(symbol.toUpperCase(), resolution);
  sendSuccess(res, data || {});
});

// ------------- EARNINGS CALENDAR -------------

/**
 * GET /api/finnhub/earnings-calendar
 * Query: from, to (YYYY-MM-DD)
 */
const getEarningsCalendar = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await finnhubService.cachedGetEarningsCalendar(fromDate, toDate);
  sendSuccess(res, data || []);
});

// ------------- IPO CALENDAR -------------

/**
 * GET /api/finnhub/ipo-calendar
 * Query: from, to (YYYY-MM-DD)
 */
const getIpoCalendar = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await finnhubService.cachedGetIpoCalendar(fromDate, toDate);
  sendSuccess(res, data || []);
});

// ------------- ECONOMIC DATA -------------

/**
 * GET /api/finnhub/economic-code
 */
const getEconomicCode = asyncHandler(async (req, res) => {
  const data = await finnhubService.cachedGetEconomicCode();
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/economic-data/:code
 */
const getEconomicData = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const data = await finnhubService.cachedGetEconomicData(code);
  sendSuccess(res, data || {});
});

// ------------- ESG -------------

/**
 * GET /api/finnhub/esg/:symbol
 */
const getCompanyEsgScore = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetCompanyEsgScore(symbol.toUpperCase());
  sendSuccess(res, data || {});
});

// ------------- EARNINGS QUALITY SCORE -------------

/**
 * GET /api/finnhub/earnings-quality-score/:symbol
 * Query: freq (default: quarterly)
 */
const getEarningsQualityScore = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { freq = 'quarterly' } = req.query;
  const data = await finnhubService.cachedGetEarningsQualityScore(symbol.toUpperCase(), freq);
  sendSuccess(res, data || {});
});

// ------------- REVENUE BREAKDOWN -------------

/**
 * GET /api/finnhub/revenue-breakdown/:symbol
 */
const getRevenueBreakdown = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetRevenueBreakdown({ symbol: symbol.toUpperCase() });
  sendSuccess(res, data || {});
});

// ------------- FILINGS -------------

/**
 * GET /api/finnhub/filings
 * Query: symbol, from, to
 */
const getFilings = asyncHandler(async (req, res) => {
  const { symbol, from, to } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol.toUpperCase();
  if (from) opts.from = from;
  if (to) opts.to = to;
  const data = await finnhubService.cachedGetFilings(opts);
  sendSuccess(res, data || []);
});

// ------------- FINANCIALS -------------

/**
 * GET /api/finnhub/financials/:symbol
 * Query: statement (ic, bs, cf), freq (annual, quarterly)
 */
const getFinancials = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { statement = 'ic', freq = 'annual' } = req.query;
  const data = await finnhubService.cachedGetFinancials(symbol.toUpperCase(), statement, freq);
  sendSuccess(res, data || {});
});

// ------------- FINANCIALS REPORTED -------------

/**
 * GET /api/finnhub/financials-reported
 * Query: symbol, from, to, cik
 */
const getFinancialsReported = asyncHandler(async (req, res) => {
  const { symbol, from, to, cik } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol.toUpperCase();
  if (from) opts.from = from;
  if (to) opts.to = to;
  if (cik) opts.cik = cik;
  const data = await finnhubService.getFinancialsReported(opts);
  sendSuccess(res, data || {});
});

// ------------- TRANSCRIPTS -------------

/**
 * GET /api/finnhub/transcripts/:id
 */
const getTranscripts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await finnhubService.getTranscripts(id);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/transcripts-list/:symbol
 */
const getTranscriptsList = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getTranscriptsList(symbol.toUpperCase());
  sendSuccess(res, data || []);
});

// ------------- CRYPTO -------------

/**
 * GET /api/finnhub/crypto/candles/:symbol
 * Query: resolution, from, to
 */
const getCryptoCandles = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D', from, to } = req.query;
  const toTs = to || Math.floor(Date.now() / 1000);
  const fromTs = from || toTs - 30 * 24 * 60 * 60;
  const data = await finnhubService.getCryptoCandles(symbol, resolution, fromTs, toTs);
  if (!data) return sendError(res, 'Crypto candle data not available', 404);
  sendSuccess(res, data);
});

/**
 * GET /api/finnhub/crypto/exchanges
 */
const getCryptoExchanges = asyncHandler(async (req, res) => {
  const data = await finnhubService.getCryptoExchanges();
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/crypto/symbols/:exchange
 */
const getCryptoSymbols = asyncHandler(async (req, res) => {
  const { exchange } = req.params;
  const data = await finnhubService.getCryptoSymbols(exchange);
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/crypto/profile/:symbol
 */
const getCryptoProfile = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetCryptoProfile(symbol);
  sendSuccess(res, data || {});
});

// ------------- FOREX -------------

/**
 * GET /api/finnhub/forex/candles/:symbol
 * Query: resolution, from, to
 */
const getForexCandles = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D', from, to } = req.query;
  const toTs = to || Math.floor(Date.now() / 1000);
  const fromTs = from || toTs - 30 * 24 * 60 * 60;
  const data = await finnhubService.getForexCandles(symbol, resolution, fromTs, toTs);
  if (!data) return sendError(res, 'Forex candle data not available', 404);
  sendSuccess(res, data);
});

/**
 * GET /api/finnhub/forex/exchanges
 */
const getForexExchanges = asyncHandler(async (req, res) => {
  const data = await finnhubService.getForexExchanges();
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/forex/rates
 * Query: base (default: USD)
 */
const getForexRates = asyncHandler(async (req, res) => {
  const { base = 'USD' } = req.query;
  const data = await finnhubService.getForexRates(base);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/forex/symbols/:exchange
 */
const getForexSymbols = asyncHandler(async (req, res) => {
  const { exchange } = req.params;
  const data = await finnhubService.getForexSymbols(exchange);
  sendSuccess(res, data || []);
});

// ------------- ETF -------------

/**
 * GET /api/finnhub/etf/profile
 * Query: symbol, isin
 */
const getEtfProfile = asyncHandler(async (req, res) => {
  const { symbol, isin } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol;
  if (isin) opts.isin = isin;
  const data = await finnhubService.cachedGetEtfProfile(opts);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/etf/holdings/:symbol
 */
const getEtfHoldings = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getEtfHoldings({ symbol });
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/etf/sector-exposure/:symbol
 */
const getEtfSectorExposure = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getEtfSectorExposure(symbol);
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/etf/country-exposure/:symbol
 */
const getEtfCountryExposure = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getEtfCountryExposure(symbol);
  sendSuccess(res, data || []);
});

// ------------- MUTUAL FUND -------------

/**
 * GET /api/finnhub/mutual-fund/profile
 * Query: symbol, isin
 */
const getMutualFundProfile = asyncHandler(async (req, res) => {
  const { symbol, isin } = req.query;
  const opts = {};
  if (symbol) opts.symbol = symbol;
  if (isin) opts.isin = isin;
  const data = await finnhubService.cachedGetMutualFundProfile(opts);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/mutual-fund/holdings/:symbol
 */
const getMutualFundHoldings = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getMutualFundHoldings({ symbol });
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/mutual-fund/sector-exposure/:symbol
 */
const getMutualFundSectorExposure = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getMutualFundSectorExposure(symbol);
  sendSuccess(res, data || []);
});

/**
 * GET /api/finnhub/mutual-fund/country-exposure/:symbol
 */
const getMutualFundCountryExposure = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getMutualFundCountryExposure(symbol);
  sendSuccess(res, data || []);
});

// ------------- INDICES -------------

/**
 * GET /api/finnhub/indices/constituents/:symbol
 */
const getIndicesConstituents = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetIndicesConstituents(symbol);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/indices/historical-constituents/:symbol
 */
const getIndicesHistoricalConstituents = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.getIndicesHistoricalConstituents(symbol);
  sendSuccess(res, data || {});
});

// ------------- TICK DATA -------------

/**
 * GET /api/finnhub/tick/:symbol
 * Query: date, limit (default: 500), skip (default: 0)
 */
const getStockTick = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { date, limit = 500, skip = 0 } = req.query;
  const tickDate = date || new Date().toISOString().split('T')[0];
  const data = await finnhubService.getStockTick(symbol.toUpperCase(), tickDate, parseInt(limit), parseInt(skip));
  sendSuccess(res, data || {});
});

// ------------- MARKET STATUS / HOLIDAY -------------

/**
 * GET /api/finnhub/market-status
 * Query: exchange (default: US)
 */
const getMarketStatus = asyncHandler(async (req, res) => {
  const { exchange = 'US' } = req.query;
  const data = await finnhubService.cachedGetMarketStatus(exchange);
  sendSuccess(res, data || {});
});

/**
 * GET /api/finnhub/market-holiday
 * Query: exchange (default: US)
 */
const getMarketHoliday = asyncHandler(async (req, res) => {
  const { exchange = 'US' } = req.query;
  const data = await finnhubService.getMarketHoliday(exchange);
  sendSuccess(res, data || []);
});

// ------------- SYMBOL SEARCH -------------

/**
 * GET /api/finnhub/search
 * Query: q (search query), exchange (optional)
 */
const getSymbolSearch = asyncHandler(async (req, res) => {
  const { q, exchange } = req.query;
  if (!q) return sendError(res, 'Search query (q) is required', 400);
  const data = await finnhubService.symbolSearch(q, exchange);
  sendSuccess(res, data || {});
});

// ------------- COUNTRY -------------

/**
 * GET /api/finnhub/country
 */
const getCountry = asyncHandler(async (req, res) => {
  const data = await finnhubService.getCountry();
  sendSuccess(res, data || []);
});

// ------------- COVID-19 -------------

/**
 * GET /api/finnhub/covid19
 */
const getCovid19 = asyncHandler(async (req, res) => {
  const data = await finnhubService.getCovid19();
  sendSuccess(res, data || []);
});

// ------------- SOCIAL SENTIMENT -------------

/**
 * GET /api/finnhub/social-sentiment/:symbol
 * Query: from, to
 */
const getSocialSentiment = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.cachedGetSocialSentiment(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || {});
});

// ------------- INVESTMENT THEME -------------

/**
 * GET /api/finnhub/investment-theme/:theme
 */
const getInvestmentThemes = asyncHandler(async (req, res) => {
  const { theme } = req.params;
  const data = await finnhubService.cachedGetInvestmentThemes(theme);
  sendSuccess(res, data || {});
});

// ------------- SUPPLY CHAIN -------------

/**
 * GET /api/finnhub/supply-chain/:symbol
 */
const getSupplyChain = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const data = await finnhubService.cachedGetSupplyChain(symbol.toUpperCase());
  sendSuccess(res, data || {});
});

// ------------- USPTO PATENT -------------

/**
 * GET /api/finnhub/uspto-patent/:symbol
 * Query: from, to
 */
const getUsptoPatent = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.getUsptoPatent(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || []);
});

// ------------- VISA APPLICATION -------------

/**
 * GET /api/finnhub/visa-application/:symbol
 * Query: from, to
 */
const getVisaApplication = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.getVisaApplication(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || []);
});

// ------------- INSIDER SENTIMENT -------------

/**
 * GET /api/finnhub/insider-sentiment/:symbol
 * Query: from, to
 */
const getInsiderSentiment = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { from, to } = req.query;
  const data = await finnhubService.getInsiderSentiment(symbol.toUpperCase(), from, to);
  sendSuccess(res, data || {});
});

module.exports = {
  getQuote,
  getCandles,
  getBasicFinancials,
  getEarnings,
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
  getMarketStatus,
  getMarketHoliday,
  getSymbolSearch,
  getCountry,
  getCovid19,
  getSocialSentiment,
  getInvestmentThemes,
  getSupplyChain,
  getUsptoPatent,
  getVisaApplication,
  getInsiderSentiment,
};