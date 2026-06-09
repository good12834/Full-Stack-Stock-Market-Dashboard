const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  avgCost: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PerformancePointSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
});

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  positions: [PositionSchema],
  transactions: [TransactionSchema],
  performanceHistory: [PerformancePointSchema],
  totalValue: {
    type: Number,
    default: 0,
  },
  totalInvested: {
    type: Number,
    default: 0,
  },
  totalGain: {
    type: Number,
    default: 0,
  },
  totalGainPercent: {
    type: Number,
    default: 0,
  },
  dailyChange: {
    type: Number,
    default: 0,
  },
  dailyChangePercent: {
    type: Number,
    default: 0,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);