const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assetSymbol: {
    type: String,
    required: [true, 'Asset symbol is required'],
    uppercase: true,
    trim: true,
  },
  assetType: {
    type: String,
    enum: ['stock', 'crypto', 'forex', 'index'],
    default: 'stock',
  },
  condition: {
    type: String,
    enum: ['above', 'below', 'percent_change', 'volume_spike', 'rsi'],
    required: [true, 'Condition is required'],
  },
  targetPrice: {
    type: Number,
    default: null,
  },
  targetPercent: {
    type: Number,
    default: null,
  },
  rsiThreshold: {
    type: Number,
    default: null,
  },
  volumeMultiplier: {
    type: Number,
    default: null,
  },
  notificationType: {
    type: [String],
    enum: ['email', 'push', 'sms', 'browser', 'telegram'],
    default: ['email'],
  },
  frequency: {
    type: String,
    enum: ['once', 'every_minute', 'every_5_minutes', 'every_15_minutes', 'every_hour', 'daily'],
    default: 'once',
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    default: null,
  },
  isTriggered: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
    default: null,
  },
  triggeredCount: {
    type: Number,
    default: 0,
  },
  lastChecked: {
    type: Date,
    default: null,
  },
  currentPrice: {
    type: Number,
    default: null,
  },
  currentChange: {
    type: Number,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` on save
AlertSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
AlertSchema.index({ userId: 1, isActive: 1 });
AlertSchema.index({ assetSymbol: 1, isActive: 1 });

module.exports = mongoose.model('Alert', AlertSchema);