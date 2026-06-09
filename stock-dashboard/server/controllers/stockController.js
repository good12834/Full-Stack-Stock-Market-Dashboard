const Stock = require('../models/Stock');
const finnhubService = require('../services/finnhubService');
const cacheService = require('../services/cacheService');

// @desc    Get all stocks
// @route   GET /api/stocks
exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single stock by symbol
// @route   GET /api/stocks/:symbol
exports.getStockBySymbol = async (req, res) => {
  try {
    let stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    
    if (!stock) {
      // Fallback: fetch live data from Finnhub
      const quote = await finnhubService.cachedGetQuote(req.params.symbol.toUpperCase());
      if (!quote || !quote.c) {
        return res.status(404).json({ success: false, error: 'Stock not found' });
      }
      // Return basic quote info
      stock = {
        symbol: req.params.symbol.toUpperCase(),
        name: req.params.symbol.toUpperCase(),
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        previousClose: quote.pc,
        volume: quote.v,
      };
      return res.json({ success: true, data: stock, fromFinnhub: true });
    }
    
    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get stock price history
// @route   GET /api/stocks/:symbol/history
exports.getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query;
    
    const cacheKey = `history:${symbol}:${interval}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const resolutionMap = {
      '1min': '1',
      '5min': '5',
      '15min': '15',
      '30min': '30',
      '60min': '60',
      'daily': 'D',
      'weekly': 'W',
      'monthly': 'M',
    };
    const resolution = resolutionMap[interval] || 'D';

    const now = Math.floor(Date.now() / 1000);
    let from, to;
    switch (interval) {
      case '1min': from = now - 3600; to = now; break;
      case '5min': from = now - 3600 * 6; to = now; break;
      case '15min': from = now - 3600 * 24; to = now; break;
      case '30min': from = now - 3600 * 48; to = now; break;
      case '60min': from = now - 3600 * 96; to = now; break;
      case 'weekly': from = now - 86400 * 365 * 2; to = now; break;
      case 'monthly': from = now - 86400 * 365 * 10; to = now; break;
      default: from = now - 86400 * 365; to = now; break;
    }

    const data = await finnhubService.getStockCandles(symbol, resolution, from, to);
    
    // Handle no data response from Finnhub
    if (!data || data.s === 'no_data' || !data.t) {
      return res.json({ success: true, data: [] });
    }
    
    const history = data.t.map((time, i) => ({
      time: time * 1000,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    })).filter((d) => d.close > 0);

    await cacheService.set(cacheKey, history, 300);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get stock intraday data
// @route   GET /api/stocks/:symbol/intraday
exports.getStockIntraday = async (req, res) => {
  try {
    const { symbol } = req.params;
    const now = Math.floor(Date.now() / 1000);
    const from = now - 86400; // 1 day

    const data = await finnhubService.getStockCandles(symbol, '5', from, now);
    
    if (!data || data.s === 'no_data' || !data.t) {
      return res.json({ success: true, data: [] });
    }
    
    const intraday = data.t.map((time, i) => ({
      time: time * 1000,
      close: data.c[i],
      volume: data.v[i],
    })).filter((d) => d.close > 0);

    res.json({ success: true, data: intraday });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Search stocks
// @route   GET /api/stocks/search/:query
exports.searchStocks = async (req, res) => {
  try {
    const { query } = req.params;
    const regex = new RegExp(query, 'i');
    const stocks = await Stock.find({
      $or: [{ symbol: regex }, { name: regex }],
    }).limit(10);
    res.json({ success: true, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Compare multiple stocks
// @route   GET /api/stocks/compare?symbols=AAPL,TSLA,MSFT
exports.compareStocks = async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ success: false, error: 'Please provide symbols parameter' });
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (symbolList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid symbols provided' });
    }
    if (symbolList.length > 6) {
      return res.status(400).json({ success: false, error: 'Maximum 6 stocks can be compared at once' });
    }

    const results = await Promise.allSettled(
      symbolList.map(async (symbol) => {
        const cacheKey = `compare:${symbol}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const [quote, profile, financials] = await Promise.all([
          finnhubService.getQuote(symbol),
          finnhubService.getCompanyProfile2(symbol),
          finnhubService.getBasicFinancials(symbol, 'all').catch(() => ({ metric: {} })),
        ]);

        const data = {
          symbol,
          companyName: profile?.name || symbol,
          logo: profile?.logo || '',
          price: quote?.c ?? 0,
          change: quote?.d ?? 0,
          changePercent: quote?.dp ?? 0,
          high: quote?.h ?? 0,
          low: quote?.l ?? 0,
          open: quote?.o ?? 0,
          previousClose: quote?.pc ?? 0,
          marketCap: financials?.metric?.marketCapitalization ?? 0,
          peRatio: financials?.metric?.peTTM ?? 0,
          peForward: financials?.metric?.forwardPE ?? 0,
          eps: financials?.metric?.epsTTM ?? 0,
          earningsGrowth: financials?.metric?.earningsGrowth ?? 0,
          revenueGrowth: financials?.metric?.revenueGrowth ?? 0,
          revenuePerShare: financials?.metric?.revenuePerShare ?? 0,
          profitMargin: financials?.metric?.profitMargin ?? 0,
          dividendYield: financials?.metric?.dividendYieldIndicatedAnnual ?? 0,
          dividendPerShare: financials?.metric?.dividendPerShare ?? 0,
          dividendPayoutRatio: financials?.metric?.dividendPayoutRatio ?? 0,
          volume: quote?.v ?? 0,
          avgVolume: financials?.metric?.avgVolume ?? 0,
          beta: financials?.metric?.beta ?? 0,
          sharesOutstanding: financials?.metric?.sharesOutstanding ?? 0,
          debtToEquity: financials?.metric?.debtToEquity ?? 0,
          roe: financials?.metric?.roe ?? 0,
          roa: financials?.metric?.roa ?? 0,
          currentRatio: financials?.metric?.currentRatio ?? 0,
          quickRatio: financials?.metric?.quickRatio ?? 0,
          weekHigh52: financials?.metric?.['52WeekHigh'] ?? 0,
          weekLow52: financials?.metric?.['52WeekLow'] ?? 0,
          sector: financials?.metric?.sector ?? '',
          industry: financials?.metric?.industry ?? '',
        };

        await cacheService.set(cacheKey, data, 300);
        return data;
      })
    );

    const stocks = results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);

    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};