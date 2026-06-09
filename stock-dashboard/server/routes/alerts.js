const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const { protect } = require('../middleware/auth');

// GET /api/alerts - Get all alerts
router.get('/', protect, async (req, res) => {
  try {
    // Try to get from MongoDB
    let dbAlerts = [];
    try {
      const Alert = require('../models/Alert');
      const filter = { userId: req.user?.id || null };
      // Optional query params
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }
      if (req.query.isTriggered !== undefined) {
        filter.isTriggered = req.query.isTriggered === 'true';
      }
      dbAlerts = await Alert.find(filter).sort({ createdAt: -1 });
    } catch (dbErr) {
      // MongoDB unavailable
    }

    // Merge with in-memory alerts
    const inMemoryAlerts = alertService.getInMemoryAlerts();
    const allAlerts = [...dbAlerts, ...inMemoryAlerts];

    res.json({
      success: true,
      count: allAlerts.length,
      data: allAlerts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// POST /api/alerts - Create a new alert
router.post('/', async (req, res) => {
  try {
    const {
      symbol,            // Stock/crypto symbol (e.g., AAPL, BTC)
      assetSymbol,       // Alternative field name
      assetType = 'stock',
      condition,
      targetPrice,
      targetPercent,
      rsiThreshold,
      volumeMultiplier,
      notificationType = ['email'],
      frequency = 'once',
      email,
      phone,
    } = req.body;

    const finalSymbol = (symbol || assetSymbol || '').toUpperCase().trim();

    if (!finalSymbol) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an asset symbol (symbol or assetSymbol)',
      });
    }

    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a condition (above, below, percent_change, volume_spike, rsi)',
      });
    }

    // Validate condition-specific fields
    if (['above', 'below'].includes(condition) && (!targetPrice || isNaN(targetPrice))) {
      return res.status(400).json({
        success: false,
        error: 'Target price is required for above/below conditions',
      });
    }

    if (condition === 'percent_change' && (targetPercent === undefined || isNaN(targetPercent))) {
      return res.status(400).json({
        success: false,
        error: 'Target percentage is required for percent_change condition',
      });
    }

    if (condition === 'volume_spike' && (!volumeMultiplier || isNaN(volumeMultiplier))) {
      return res.status(400).json({
        success: false,
        error: 'Volume multiplier is required for volume_spike condition',
      });
    }

    if (condition === 'rsi' && (!rsiThreshold || isNaN(rsiThreshold))) {
      return res.status(400).json({
        success: false,
        error: 'RSI threshold is required for rsi condition',
      });
    }

    // Try saving to MongoDB
    let savedAlert = null;
    try {
      const Alert = require('../models/Alert');
      savedAlert = await Alert.create({
        assetSymbol: finalSymbol,
        assetType,
        condition,
        targetPrice: targetPrice || undefined,
        targetPercent: targetPercent || undefined,
        rsiThreshold: rsiThreshold || undefined,
        volumeMultiplier: volumeMultiplier || undefined,
        notificationType: Array.isArray(notificationType) ? notificationType : [notificationType],
        frequency,
        email: email || undefined,
        phone: phone || undefined,
      });
    } catch (dbErr) {
      console.warn('MongoDB unavailable, storing alert in memory:', dbErr.message);
    }

    // If MongoDB failed, store in memory
    if (!savedAlert) {
      const alert = {
        id: Date.now().toString(),
        assetSymbol: finalSymbol,
        symbol: finalSymbol,
        assetType,
        condition,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        targetPercent: targetPercent ? Number(targetPercent) : null,
        rsiThreshold: rsiThreshold ? Number(rsiThreshold) : null,
        volumeMultiplier: volumeMultiplier ? Number(volumeMultiplier) : null,
        notificationType: Array.isArray(notificationType) ? notificationType : [notificationType],
        frequency,
        email: email || null,
        phone: phone || null,
        isActive: true,
        isTriggered: false,
        triggeredCount: 0,
        createdAt: new Date().toISOString(),
      };

      alertService.addAlert(alert);
      savedAlert = alert;
    }

    res.status(201).json({
      success: true,
      data: savedAlert,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/alerts/history - Get alert trigger history
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = alertService.getAlertHistory(limit);

  res.json({
    success: true,
    count: history.length,
    data: history,
  });
});

// GET /api/alerts/analytics - Get alert analytics
router.get('/analytics', (req, res) => {
  const analytics = alertService.getAlertAnalytics();

  res.json({
    success: true,
    data: analytics,
  });
});

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Try to delete from MongoDB
  let deletedFromDb = false;
  try {
    const Alert = require('../models/Alert');
    const result = await Alert.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (result) deletedFromDb = true;
  } catch (dbErr) {
    // MongoDB unavailable
  }

  // Also try in-memory
  const removedFromMemory = alertService.removeAlert(id);

  if (!deletedFromDb && !removedFromMemory) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found',
    });
  }

  res.json({
    success: true,
    message: 'Alert deleted/deactivated',
  });
});

// PATCH /api/alerts/:id - Update an alert
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  let updatedAlert = null;

  // Try updating in MongoDB
  try {
    const Alert = require('../models/Alert');
    updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { $set: req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  } catch (dbErr) {
    // MongoDB unavailable
  }

  if (!updatedAlert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found or MongoDB unavailable',
    });
  }

  res.json({
    success: true,
    data: updatedAlert,
  });
});

// POST /api/alerts/check - Manually trigger alert check
router.post('/check', async (req, res) => {
  try {
    const triggered = await alertService.checkAlerts();
    res.json({
      success: true,
      triggered: triggered.length,
      data: triggered,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;