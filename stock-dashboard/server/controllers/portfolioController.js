const Portfolio = require('../models/Portfolio');
const stockService = require('../services/stockService');

// @desc    Get user portfolio (enhanced)
// @route   GET /api/portfolio
const getPortfolio = async (req, res, next) => {
  try {
    let portfolio;

    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });

      if (!portfolio) {
        portfolio = await Portfolio.create({
          userId: req.user.id,
          positions: [],
          transactions: [],
          performanceHistory: [],
          totalValue: 0,
          totalInvested: 0,
          totalGain: 0,
          totalGainPercent: 0,
          dailyChange: 0,
          dailyChangePercent: 0,
          availableBalance: 100000, // Paper trading starting balance
        });
      }
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio fetch: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    // Update current prices for all positions
    let totalValue = 0;
    const updatedPositions = [];

    for (const position of portfolio.positions) {
      let currentPrice = position.currentPrice;
      try {
        const stockData = await stockService.getStockPrice(position.symbol);
        if (stockData?.price) {
          currentPrice = stockData.price;
        }
      } catch (err) {
        // Keep last known price
      }

      const positionValue = position.quantity * currentPrice;
      totalValue += positionValue;

      const gain = (currentPrice - position.avgCost) * position.quantity;
      const gainPercent = position.avgCost > 0
        ? ((currentPrice - position.avgCost) / position.avgCost) * 100
        : 0;

      updatedPositions.push({
        ...position.toObject(),
        currentPrice,
        value: positionValue,
        gain,
        gainPercent,
      });
    }

    // Calculate daily change (simulated - compare to yesterday's close)
    const dailyChange = updatedPositions.reduce((sum, p) => {
      const dailyMove = (Math.random() - 0.48) * p.value * 0.02;
      return sum + dailyMove;
    }, 0);

    const previousValue = totalValue - dailyChange;
    const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;

    // Update portfolio totals
    portfolio.totalValue = totalValue;
    portfolio.totalGain = totalValue - portfolio.totalInvested;
    portfolio.totalGainPercent = portfolio.totalInvested > 0
      ? ((totalValue - portfolio.totalInvested) / portfolio.totalInvested) * 100
      : 0;
    portfolio.dailyChange = dailyChange;
    portfolio.dailyChangePercent = dailyChangePercent;
    portfolio.updatedAt = new Date();

    // Add performance snapshot (keep last 365 points)
    portfolio.performanceHistory.push({
      date: new Date(),
      value: totalValue,
    });
    if (portfolio.performanceHistory.length > 365) {
      portfolio.performanceHistory = portfolio.performanceHistory.slice(-365);
    }

    try {
      await portfolio.save();
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio save: ${dbErr.message}`);
    }

    res.json({
      success: true,
      data: {
        ...portfolio.toObject(),
        positions: updatedPositions,
        dailyChange,
        dailyChangePercent,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add position to portfolio
// @route   POST /api/portfolio
const addPosition = async (req, res, next) => {
  try {
    const { symbol, quantity, avgCost } = req.body;

    if (!symbol || !quantity || !avgCost) {
      return res.status(400).json({
        success: false,
        error: 'Please provide symbol, quantity, and avgCost',
      });
    }

    // Get current price
    const stockData = await stockService.getStockPrice(symbol.toUpperCase());
    const currentPrice = stockData?.price || avgCost;

    let portfolio;

    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });

      if (!portfolio) {
        portfolio = await Portfolio.create({
          userId: req.user.id,
          positions: [],
          transactions: [],
          performanceHistory: [],
          totalInvested: 0,
          availableBalance: 100000,
        });
      }
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio add: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    const totalCost = avgCost * quantity;

    // Check available balance
    if (totalCost > portfolio.availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance. Please add funds or sell other assets.',
      });
    }

    // Deduct from balance
    portfolio.availableBalance -= totalCost;

    // Check if position already exists
    const existingIndex = portfolio.positions.findIndex(
      (p) => p.symbol === symbol.toUpperCase()
    );

    if (existingIndex > -1) {
      // Update existing position (weighted average cost)
      const existing = portfolio.positions[existingIndex];
      const totalCostExisting = existing.avgCost * existing.quantity + avgCost * quantity;
      const totalQty = existing.quantity + quantity;

      portfolio.positions[existingIndex].quantity = totalQty;
      portfolio.positions[existingIndex].avgCost = totalCostExisting / totalQty;
      portfolio.positions[existingIndex].currentPrice = currentPrice;
    } else {
      // Add new position
      portfolio.positions.push({
        symbol: symbol.toUpperCase(),
        quantity,
        avgCost,
        currentPrice,
        addedAt: new Date(),
      });
    }

    // Add transaction record
    portfolio.transactions.push({
      type: 'BUY',
      symbol: symbol.toUpperCase(),
      quantity,
      price: avgCost,
      total: totalCost,
      date: new Date(),
    });

    // Update totals
    portfolio.totalInvested += totalCost;
    portfolio.updatedAt = new Date();

    try {
      await portfolio.save();
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio save: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    res.status(201).json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sell position from portfolio
// @route   POST /api/portfolio/sell
const sellPosition = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Please provide symbol and quantity',
      });
    }

    let portfolio;

    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });
    } catch (dbErr) {
      console.warn(`MongoDB unavailable: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable.',
      });
    }

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    const positionIndex = portfolio.positions.findIndex(
      (p) => p.symbol === symbol.toUpperCase()
    );

    if (positionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Position ${symbol} not found in portfolio`,
      });
    }

    const position = portfolio.positions[positionIndex];
    const qtyToSell = parseFloat(quantity);

    if (qtyToSell > position.quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient shares. You have ${position.quantity} shares of ${symbol}.`,
      });
    }

    // Get current price for sale
    let sellPrice = position.currentPrice;
    try {
      const stockData = await stockService.getStockPrice(symbol.toUpperCase());
      if (stockData?.price) sellPrice = stockData.price;
    } catch (err) {
      // Use last known price
    }

    const saleTotal = qtyToSell * sellPrice;
    const costBasisSold = qtyToSell * position.avgCost;

    // Add funds back to balance
    portfolio.availableBalance += saleTotal;

    // Add transaction record
    portfolio.transactions.push({
      type: 'SELL',
      symbol: symbol.toUpperCase(),
      quantity: qtyToSell,
      price: sellPrice,
      total: saleTotal,
      date: new Date(),
    });

    if (qtyToSell >= position.quantity) {
      // Remove entire position
      portfolio.positions.splice(positionIndex, 1);
      portfolio.totalInvested -= costBasisSold;
    } else {
      // Reduce position
      portfolio.positions[positionIndex].quantity -= qtyToSell;
      portfolio.totalInvested -= costBasisSold;
    }

    portfolio.updatedAt = new Date();

    try {
      await portfolio.save();
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio save: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable.',
      });
    }

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove position from portfolio (legacy)
// @route   DELETE /api/portfolio/:symbol
const removePosition = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { quantity } = req.query;

    let portfolio;

    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio remove: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    const positionIndex = portfolio.positions.findIndex(
      (p) => p.symbol === symbol.toUpperCase()
    );

    if (positionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Position ${symbol} not found in portfolio`,
      });
    }

    const position = portfolio.positions[positionIndex];
    const qtyToRemove = quantity ? parseFloat(quantity) : position.quantity;
    const sellPrice = position.currentPrice;
    const saleTotal = qtyToRemove * sellPrice;

    // Add back to balance
    portfolio.availableBalance += saleTotal;

    // Record transaction
    portfolio.transactions.push({
      type: 'SELL',
      symbol: symbol.toUpperCase(),
      quantity: qtyToRemove,
      price: sellPrice,
      total: saleTotal,
      date: new Date(),
    });

    if (qtyToRemove >= position.quantity) {
      portfolio.positions.splice(positionIndex, 1);
      portfolio.totalInvested -= position.avgCost * position.quantity;
    } else {
      portfolio.positions[positionIndex].quantity -= qtyToRemove;
      portfolio.totalInvested -= position.avgCost * qtyToRemove;
    }

    portfolio.updatedAt = new Date();

    try {
      await portfolio.save();
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for portfolio save: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get portfolio transactions
// @route   GET /api/portfolio/transactions
const getTransactions = async (req, res, next) => {
  try {
    let portfolio;
    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });
    } catch (dbErr) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable.',
      });
    }

    if (!portfolio) {
      return res.json({ success: true, data: [] });
    }

    // Sort by date descending
    const transactions = (portfolio.transactions || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get portfolio performance history
// @route   GET /api/portfolio/performance
const getPerformance = async (req, res, next) => {
  try {
    let portfolio;
    try {
      portfolio = await Portfolio.findOne({ userId: req.user.id });
    } catch (dbErr) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable.',
      });
    }

    if (!portfolio) {
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: portfolio.performanceHistory || [],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPortfolio,
  addPosition,
  sellPosition,
  removePosition,
  getTransactions,
  getPerformance,
};