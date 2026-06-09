const stockService = require('./stockService');

// In-memory alert store (used when MongoDB is unavailable)
let inMemoryAlerts = [];
let alertCheckInterval = null;

// Store triggered alerts for history
const alertHistory = [];

/**
 * Evaluate if a single alert should be triggered based on current market data.
 */
const evaluateAlert = async (alert) => {
  try {
    const { assetSymbol, condition, targetPrice, targetPercent, rsiThreshold, volumeMultiplier } = alert;

    // Get current price data
    const priceData = await stockService.getStockPrice(assetSymbol);
    if (!priceData) return { triggered: false, reason: 'No price data' };

    const currentPrice = priceData.price;
    const currentChange = priceData.changePercent || 0;
    let triggered = false;
    let reason = '';

    switch (condition) {
      case 'above':
        if (currentPrice >= targetPrice) {
          triggered = true;
          reason = `${assetSymbol} crossed above $${targetPrice.toLocaleString()} (current: $${currentPrice.toLocaleString()})`;
        }
        break;

      case 'below':
        if (currentPrice <= targetPrice) {
          triggered = true;
          reason = `${assetSymbol} dropped below $${targetPrice.toLocaleString()} (current: $${currentPrice.toLocaleString()})`;
        }
        break;

      case 'percent_change':
        if (targetPercent >= 0 && currentChange >= targetPercent) {
          triggered = true;
          reason = `${assetSymbol} gained ${currentChange.toFixed(2)}% (target: +${targetPercent}%)`;
        } else if (targetPercent < 0 && currentChange <= targetPercent) {
          triggered = true;
          reason = `${assetSymbol} dropped ${currentChange.toFixed(2)}% (target: ${targetPercent}%)`;
        }
        break;

      case 'volume_spike':
        // Volume spike detection (simplified - uses random heuristic for demo)
        const avgVolume = priceData.volume || 1000000;
        const spikeThreshold = volumeMultiplier || 2;
        // In production, compare against historical average volume
        if (priceData.volume && priceData.volume > avgVolume * spikeThreshold) {
          triggered = true;
          reason = `${assetSymbol} volume spike detected: ${(priceData.volume / 1000000).toFixed(1)}M vs avg ${(avgVolume / 1000000).toFixed(1)}M`;
        }
        break;

      case 'rsi':
        // RSI alert (simplified - uses price change as proxy)
        const rsiProxy = Math.min(100, Math.max(0, 50 + currentChange * 2));
        if (rsiThreshold >= 70 && rsiProxy >= rsiThreshold) {
          triggered = true;
          reason = `${assetSymbol} RSI overbought: ${rsiProxy.toFixed(1)} (threshold: ${rsiThreshold})`;
        } else if (rsiThreshold <= 30 && rsiProxy <= rsiThreshold) {
          triggered = true;
          reason = `${assetSymbol} RSI oversold: ${rsiProxy.toFixed(1)} (threshold: ${rsiThreshold})`;
        }
        break;

      default:
        break;
    }

    return {
      triggered,
      reason,
      currentPrice,
      currentChange,
    };
  } catch (err) {
    console.warn(`[AlertService] Error evaluating alert ${alert.id || alert._id}:`, err.message);
    return { triggered: false, reason: 'Evaluation error' };
  }
};

/**
 * Fire notification for a triggered alert.
 * In production, this would send emails via Nodemailer, push via Firebase, etc.
 */
const fireNotification = (alert, evaluation) => {
  const { notificationType, email, phone, assetSymbol } = alert;
  const { reason, currentPrice } = evaluation;

  const notification = {
    alertId: alert._id || alert.id,
    assetSymbol,
    condition: alert.condition,
    targetPrice: alert.targetPrice,
    currentPrice,
    message: reason,
    timestamp: new Date().toISOString(),
    method: notificationType,
  };

  // Log notification
  console.log(`[AlertService] 🔔 NOTIFICATION: ${reason}`);

  // Simulate email notification
  if (notificationType.includes('email') && email) {
    console.log(`[AlertService] 📧 Email sent to ${email}: ${reason}`);
  }

  // Add to history
  alertHistory.unshift(notification);

  // Keep history at 100 entries
  if (alertHistory.length > 100) {
    alertHistory.length = 100;
  }

  return notification;
};

/**
 * Check all active alerts and trigger any that match conditions.
 */
const checkAlerts = async () => {
  const now = new Date();
  const triggeredNotifications = [];

  // Get active alerts from both MongoDB (if available) and in-memory store
  let activeAlerts = [...inMemoryAlerts.filter((a) => !a._id && a.isActive)];

  // Try to get alerts from MongoDB
  try {
    const Alert = require('../models/Alert');
    const dbAlerts = await Alert.find({
      isActive: true,
      $or: [
        { isTriggered: false },
        { frequency: { $ne: 'once' } },
      ],
    });
    // Merge DB alerts with in-memory (prefer DB)
    const dbAlertMap = new Map();
    for (const a of dbAlerts) {
      dbAlertMap.set(String(a._id), a);
    }
    // Replace in-memory alerts that have DB counterparts
    activeAlerts = [
      ...dbAlerts,
      ...activeAlerts.filter((a) => !dbAlertMap.has(String(a._id))),
    ];
  } catch (dbErr) {
    // MongoDB unavailable, just use in-memory
  }

  if (activeAlerts.length === 0) return [];

  for (const alert of activeAlerts) {
    try {
      // Check frequency cooldown
      if (alert.lastChecked) {
        const minutesSinceCheck = (now - new Date(alert.lastChecked)) / 60000;
        const cooldownMinutes = {
          once: 0,
          every_minute: 1,
          every_5_minutes: 5,
          every_15_minutes: 15,
          every_hour: 60,
          daily: 1440,
        };
        const minCooldown = cooldownMinutes[alert.frequency] || 0;
        if (minutesSinceCheck < minCooldown) continue;
      }

      const evaluation = await evaluateAlert(alert);

      // Update last checked
      alert.lastChecked = now;

      if (evaluation.triggered) {
        alert.isTriggered = true;
        alert.triggeredAt = now;
        alert.triggeredCount = (alert.triggeredCount || 0) + 1;
        alert.currentPrice = evaluation.currentPrice;
        alert.currentChange = evaluation.currentChange;

        // Fire notification
        const notification = fireNotification(alert, evaluation);
        triggeredNotifications.push(notification);

        // Update in database if applicable
        if (alert.save) {
          try {
            if (alert.frequency === 'once') {
              alert.isActive = false;
            }
            await alert.save();
          } catch (saveErr) {
            console.warn(`[AlertService] Failed to save alert state: ${saveErr.message}`);
          }
        }
      } else {
        alert.currentPrice = evaluation.currentPrice;
        alert.currentChange = evaluation.currentChange;
      }
    } catch (err) {
      console.warn(`[AlertService] Error processing alert:`, err.message);
    }
  }

  return triggeredNotifications;
};

/**
 * Start the alert checking interval.
 */
const startAlertMonitor = (io) => {
  // Check alerts every 30 seconds
  alertCheckInterval = setInterval(async () => {
    try {
      const triggered = await checkAlerts();
      if (triggered.length > 0 && io) {
        // Broadcast triggered alerts to all connected clients
        io.emit('alert_triggered', {
          alerts: triggered,
          timestamp: new Date().toISOString(),
        });

        // Also broadcast alert history update
        io.emit('alert_history_update', {
          history: alertHistory.slice(0, 10),
          timestamp: new Date().toISOString(),
        });
      }

      // Broadcast updated alert list periodically
      io.emit('alerts_update', {
        alerts: inMemoryAlerts.filter((a) => a.isActive),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[AlertService] Alert check cycle error:', err.message);
    }
  }, 30000);

  console.log('[AlertService] Alert monitor started (30s interval)');

  // Do an initial check after 5 seconds
  setTimeout(async () => {
    try {
      await checkAlerts();
    } catch (err) {
      // Silent
    }
  }, 5000);
};

/**
 * Stop the alert monitor.
 */
const stopAlertMonitor = () => {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
  }
};

/**
 * Add an alert to the in-memory store.
 */
const addAlert = (alert) => {
  inMemoryAlerts.push(alert);
  return alert;
};

/**
 * Remove an alert from the in-memory store.
 */
const removeAlert = (id) => {
  const initialLength = inMemoryAlerts.length;
  inMemoryAlerts = inMemoryAlerts.filter((a) => a.id !== id);
  return inMemoryAlerts.length !== initialLength;
};

/**
 * Get all in-memory alerts.
 */
const getInMemoryAlerts = () => [...inMemoryAlerts];

/**
 * Get alert history.
 */
const getAlertHistory = (limit = 20) => alertHistory.slice(0, limit);

/**
 * Get alert analytics.
 */
const getAlertAnalytics = () => {
  const total = inMemoryAlerts.length + alertHistory.length;
  const triggeredToday = alertHistory.filter((h) => {
    const date = new Date(h.timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  // Find most watched asset
  const assetCount = {};
  for (const a of inMemoryAlerts) {
    const sym = a.assetSymbol || a.symbol;
    assetCount[sym] = (assetCount[sym] || 0) + 1;
  }
  for (const h of alertHistory) {
    assetCount[h.assetSymbol] = (assetCount[h.assetSymbol] || 0) + 1;
  }

  let mostWatched = null;
  let maxCount = 0;
  for (const [sym, count] of Object.entries(assetCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostWatched = sym;
    }
  }

  const successRate = total > 0
    ? ((alertHistory.length / total) * 100).toFixed(1)
    : 0;

  return {
    totalAlerts: total,
    activeAlerts: inMemoryAlerts.filter((a) => a.isActive).length,
    triggeredToday,
    totalTriggered: alertHistory.length,
    successRate: `${successRate}%`,
    mostWatched,
    byCondition: {
      above: inMemoryAlerts.filter((a) => a.condition === 'above').length,
      below: inMemoryAlerts.filter((a) => a.condition === 'below').length,
      percentChange: inMemoryAlerts.filter((a) => a.condition === 'percent_change').length,
      volumeSpike: inMemoryAlerts.filter((a) => a.condition === 'volume_spike').length,
      rsi: inMemoryAlerts.filter((a) => a.condition === 'rsi').length,
    },
  };
};

module.exports = {
  startAlertMonitor,
  stopAlertMonitor,
  checkAlerts,
  addAlert,
  removeAlert,
  getInMemoryAlerts,
  getAlertHistory,
  getAlertAnalytics,
};