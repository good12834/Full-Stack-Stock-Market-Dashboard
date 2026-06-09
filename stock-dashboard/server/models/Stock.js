const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  _id: {
    type: String, // symbol
    required: true,
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  change: {
    type: Number,
    default: 0,
  },
  changePercent: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 0,
  },
  marketCap: {
    type: Number,
    default: 0,
  },
  pe: {
    type: Number,
  },
  high: {
    type: Number,
  },
  low: {
    type: Number,
  },
  open: {
    type: Number,
  },
  previousClose: {
    type: Number,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
  timestamps: false,
});

module.exports = mongoose.model('Stock', StockSchema);