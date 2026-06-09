const Watchlist = require('../models/Watchlist');
const stockService = require('../services/stockService');

// @desc    Get user watchlist
// @route   GET /api/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    let watchlist;

    try {
      watchlist = await Watchlist.findOne({ userId: req.user.id });

      if (!watchlist) {
        watchlist = await Watchlist.create({
          userId: req.user.id,
          stocks: [],
        });
      }
    } catch (dbErr) {
      // MongoDB unavailable - return empty watchlist
      console.warn(`MongoDB unavailable for watchlist fetch: ${dbErr.message}`);
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get current prices for all watchlist stocks
    const stocksWithPrices = [];
    for (const symbol of watchlist.stocks) {
      const stockData = await stockService.getStockPrice(symbol);
      if (stockData) {
        stocksWithPrices.push(stockData);
      }
    }

    res.json({
      success: true,
      data: stocksWithPrices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a stock symbol',
      });
    }

    const symbolUpper = symbol.toUpperCase();

    try {
      let watchlist = await Watchlist.findOne({ userId: req.user.id });

      if (!watchlist) {
        watchlist = await Watchlist.create({
          userId: req.user.id,
          stocks: [symbolUpper],
        });
      } else {
        // Check if already in watchlist
        if (watchlist.stocks.includes(symbolUpper)) {
          return res.status(400).json({
            success: false,
            error: `${symbolUpper} is already in your watchlist`,
          });
        }

        watchlist.stocks.push(symbolUpper);
        await watchlist.save();
      }

      res.status(201).json({
        success: true,
        data: watchlist,
      });
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for watchlist add: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:symbol
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    try {
      const watchlist = await Watchlist.findOne({ userId: req.user.id });

      if (!watchlist) {
        return res.status(404).json({
          success: false,
          error: 'Watchlist not found',
        });
      }

      const symbolUpper = symbol.toUpperCase();
      const index = watchlist.stocks.indexOf(symbolUpper);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: `${symbolUpper} not found in watchlist`,
        });
      }

      watchlist.stocks.splice(index, 1);
      await watchlist.save();

      res.json({
        success: true,
        data: watchlist,
      });
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for watchlist remove: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};