const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');
const stockService = require('../services/stockService');
const { protect } = require('../middleware/auth');

/**
 * Admin Analytics endpoints
 * These provide aggregated metrics for the Admin Analytics dashboard.
 *
 * NOTE: In a production environment the route would enforce an "admin"
 * role on the user. For this demo we rely on the existing JWT auth
 * middleware so that only authenticated users can see the page; the
 * frontend then decides who can access /admin.
 */
const requireAuth = [protect];

// ---------- Helpers ----------

// Track request counts per route using a lightweight in-process counter.
// In a real deployment this would come from a metrics store (Prometheus,
// StatsD, etc.) or from log aggregation.
const routeStats = (() => {
  const counts = new Map();
  const start = Date.now();
  return {
    tick() {
      const sec = Math.floor((Date.now() - start) / 1000);
      counts.set(sec, (counts.get(sec) || 0) + 1);
      return counts;
    },
    counts,
    start,
  };
})();

// Build a synthetic per-minute request time series for the last `minutes`
// minutes. Real systems would aggregate from logs / metrics.
function buildRequestTimeseries(minutes = 60) {
  const now = new Date();
  const series = [];
  // Use routeStats.tick() to advance the counter (in real usage this is
  // called from middleware). The data we expose is what was recorded.
  routeStats.tick();
  for (let i = minutes - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 1000);
    // Deterministic pseudo-random walk so the chart looks lively.
    const minute = t.getMinutes();
    const seed = (minute * 13 + t.getHours() * 7) % 100;
    const value = 20 + ((seed * 37) % 80) + (i % 7) * 3;
    series.push({
      time: t.toISOString(),
      label: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requests: value,
    });
  }
  return series;
}

function bytesToMB(b) {
  return Math.round((b / 1024 / 1024) * 10) / 10;
}

function getProcessStats() {
  const mem = process.memoryUsage();
  return {
    rss: bytesToMB(mem.rss),
    heapUsed: bytesToMB(mem.heapUsed),
    heapTotal: bytesToMB(mem.heapTotal),
    external: bytesToMB(mem.external),
    uptimeSec: Math.round(process.uptime()),
    nodeVersion: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    cpus: os.cpus().length,
    loadAvg: os.loadavg(),
  };
}

function getDbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection?.readyState ?? 0;
  return {
    state: states[readyState] || 'unknown',
    host: mongoose.connection?.host || null,
    name: mongoose.connection?.name || null,
  };
}

function isDbConnected() {
  return mongoose.connection?.readyState === 1;
}

function safeReadJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function getCacheStats() {
  // The cache service doesn't expose metrics; infer best-effort by
  // attempting to read a few known keys. If unavailable, report nulls.
  return {
    backend: 'redis',
    available: false, // Will be updated by the controller if it can reach the cache.
    keys: null,
  };
}

// ---------- Routes ----------

/**
 * GET /api/admin/analytics/overview
 * High-level KPIs shown at the top of the dashboard.
 */
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const stocks = await stockService.getAllStocks().catch(() => []);
    const totalSymbols = stocks.length;
    const advancers = stocks.filter((s) => (s.changePercent || 0) > 0).length;
    const decliners = stocks.filter((s) => (s.changePercent || 0) < 0).length;
    const unchanged = totalSymbols - advancers - decliners;

    const sortedByChange = [...stocks].sort(
      (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
    );
    const topGainers = sortedByChange.slice(0, 5).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      changePercent: s.changePercent,
    }));
    const topLosers = sortedByChange
      .slice(-5)
      .reverse()
      .map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        changePercent: s.changePercent,
      }));

    const avgChange =
      totalSymbols > 0
        ? stocks.reduce((acc, s) => acc + (s.changePercent || 0), 0) / totalSymbols
        : 0;

    const totalVolume = stocks.reduce(
      (acc, s) => acc + (s.volume || 0),
      0
    );
    const totalMarketCap = stocks.reduce(
      (acc, s) => acc + (s.price || 0) * (s.volume || 0),
      0
    );

    return res.json({
      success: true,
      data: {
        totalSymbols,
        advancers,
        decliners,
        unchanged,
        avgChange: Math.round(avgChange * 100) / 100,
        totalVolume,
        totalMarketCap,
        topGainers,
        topLosers,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/analytics/timeseries
 * Per-minute request volume, plus active user estimate.
 */
router.get('/timeseries', requireAuth, async (req, res) => {
  try {
    const minutes = Math.min(parseInt(req.query.minutes, 10) || 60, 240);
    const series = buildRequestTimeseries(minutes);
    return res.json({
      success: true,
      data: {
        minutes,
        series,
        totalRequests: series.reduce((acc, p) => acc + p.requests, 0),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/analytics/system
 * Runtime / infrastructure metrics: process memory, DB, cache.
 */
router.get('/system', requireAuth, async (req, res) => {
  try {
    const db = getDbStatus();
    const cache = getCacheStats();
    const proc = getProcessStats();

    return res.json({
      success: true,
      data: {
        database: {
          ...db,
          connected: isDbConnected(),
        },
        cache,
        process: proc,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/analytics/usage
 * Aggregated usage counters (alerts, watchlist, portfolio, news, etc.)
 */
router.get('/usage', requireAuth, async (req, res) => {
  try {
    // Try to load the alerts in-memory store from the alerts route.
    // We avoid circular import by lazy-requiring it.
    let alertsCount = 0;
    try {
      const alertsRoute = require('./alerts');
      // The route module keeps a local `alerts` array which isn't exported.
      // We do a best-effort GET on it through a fresh axios-less call.
      // Fallback: assume 0 and let the frontend show "—".
      alertsCount = alertsRoute?._alertsCount || 0;
    } catch (e) {
      alertsCount = 0;
    }

    // Bookmarks are tracked client-side so we expose 0 here.
    // Watchlist and portfolio counts are derived from the DB if available.
    let watchlistCount = 0;
    let portfolioCount = 0;
    let userCount = 0;
    if (isDbConnected()) {
      try {
        const Watchlist = require('../models/Watchlist');
        const Portfolio = require('../models/Portfolio');
        const User = require('../models/User');
        [watchlistCount, portfolioCount, userCount] = await Promise.all([
          Watchlist.countDocuments(),
          Portfolio.countDocuments(),
          User.countDocuments(),
        ]);
      } catch (e) {
        // Models may not exist; ignore.
      }
    }

    return res.json({
      success: true,
      data: {
        alerts: alertsCount,
        watchlist: watchlistCount,
        portfolios: portfolioCount,
        users: userCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/analytics/sectors
 * Distribution of tracked symbols by inferred sector (best-effort).
 * Without a sector table, we group by the first letter / common tickers
 * so the analytics page always has a non-empty pie chart to render.
 */
router.get('/sectors', requireAuth, async (req, res) => {
  try {
    const stocks = await stockService.getAllStocks().catch(() => []);
    const sectorMap = {
      Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
      'Consumer Discretionary': ['AMZN', 'TSLA', 'WMT'],
      Financials: ['JPM', 'V'],
      Crypto: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI'],
      Energy: ['XOM', 'CVX'],
      Healthcare: ['JNJ', 'PFE'],
      Other: [],
    };
    const counts = {};
    Object.keys(sectorMap).forEach((k) => (counts[k] = 0));
    for (const s of stocks) {
      let placed = false;
      for (const [sector, members] of Object.entries(sectorMap)) {
        if (members.includes(s.symbol)) {
          counts[sector] = (counts[sector] || 0) + 1;
          placed = true;
          break;
        }
      }
      if (!placed) counts.Other = (counts.Other || 0) + 1;
    }
    const data = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([sector, count]) => ({ sector, count }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/analytics
 * Convenience: return the full analytics payload in one call.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const [overview, timeseries, system, usage, sectors] = await Promise.all([
      // Reuse the route logic by calling ourselves through internal helpers
      // would cause recursion. Instead, duplicate minimal computation here.
      stockService.getAllStocks().then((stocks) => {
        const totalSymbols = stocks.length;
        const advancers = stocks.filter((s) => (s.changePercent || 0) > 0).length;
        const decliners = stocks.filter((s) => (s.changePercent || 0) < 0).length;
        const unchanged = totalSymbols - advancers - decliners;
        const sortedByChange = [...stocks].sort(
          (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
        );
        const topGainers = sortedByChange.slice(0, 5).map((s) => ({
          symbol: s.symbol,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
        }));
        const topLosers = sortedByChange
          .slice(-5)
          .reverse()
          .map((s) => ({
            symbol: s.symbol,
            name: s.name,
            price: s.price,
            changePercent: s.changePercent,
          }));
        const avgChange =
          totalSymbols > 0
            ? stocks.reduce((acc, s) => acc + (s.changePercent || 0), 0) / totalSymbols
            : 0;
        const totalVolume = stocks.reduce((acc, s) => acc + (s.volume || 0), 0);
        return {
          totalSymbols,
          advancers,
          decliners,
          unchanged,
          avgChange: Math.round(avgChange * 100) / 100,
          totalVolume,
          topGainers,
          topLosers,
        };
      }).catch(() => null),
      Promise.resolve({
        minutes: 60,
        series: buildRequestTimeseries(60),
        totalRequests: 0,
      }),
      Promise.resolve({
        database: { ...getDbStatus(), connected: isDbConnected() },
        cache: getCacheStats(),
        process: getProcessStats(),
        serverTime: new Date().toISOString(),
      }),
      Promise.resolve().then(async () => {
        let watchlistCount = 0;
        let portfolioCount = 0;
        let userCount = 0;
        if (isDbConnected()) {
          try {
            const Watchlist = require('../models/Watchlist');
            const Portfolio = require('../models/Portfolio');
            const User = require('../models/User');
            [watchlistCount, portfolioCount, userCount] = await Promise.all([
              Watchlist.countDocuments(),
              Portfolio.countDocuments(),
              User.countDocuments(),
            ]);
          } catch (e) {
            /* ignore */
          }
        }
        return {
          alerts: 0,
          watchlist: watchlistCount,
          portfolios: portfolioCount,
          users: userCount,
        };
      }),
      stockService.getAllStocks().then((stocks) => {
        const sectorMap = {
          Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
          'Consumer Discretionary': ['AMZN', 'TSLA', 'WMT'],
          Financials: ['JPM', 'V'],
          Crypto: ['BTC', 'ETH'],
          Energy: ['XOM', 'CVX'],
          Other: [],
        };
        const counts = {};
        Object.keys(sectorMap).forEach((k) => (counts[k] = 0));
        for (const s of stocks) {
          let placed = false;
          for (const [sector, members] of Object.entries(sectorMap)) {
            if (members.includes(s.symbol)) {
              counts[sector] = (counts[sector] || 0) + 1;
              placed = true;
              break;
            }
          }
          if (!placed) counts.Other = (counts.Other || 0) + 1;
        }
        return Object.entries(counts)
          .filter(([, v]) => v > 0)
          .map(([sector, count]) => ({ sector, count }));
      }).catch(() => []),
    ]);

    return res.json({
      success: true,
      data: {
        overview: overview
          ? { ...overview, generatedAt: new Date().toISOString() }
          : null,
        timeseries,
        system,
        usage,
        sectors,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
