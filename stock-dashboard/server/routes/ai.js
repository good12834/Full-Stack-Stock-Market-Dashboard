const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Helper: safe Finnhub GET
const finnhubGet = async (path, params = {}) => {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  try {
    const res = await axios.get(`${FINNHUB_BASE}${path}`, {
      params: { ...params, token: key },
      timeout: 8000,
    });
    return res.data;
  } catch (e) {
    return null;
  }
};

// Rule-based signal from recommendation data
const deriveSignal = (recs, priceTarget, quote) => {
  if (!recs || !recs.length) return { signal: 'NEUTRAL', confidence: 50, reason: 'Insufficient analyst data' };

  const latest = recs[0];
  const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0 } = latest;
  const total = strongBuy + buy + hold + sell + strongSell || 1;

  const bullScore = ((strongBuy * 2 + buy) / total) * 100;
  const bearScore = ((strongSell * 2 + sell) / total) * 100;

  let signal = 'NEUTRAL';
  let confidence = 50;
  let reason = '';

  // Price target upside
  let upside = null;
  if (priceTarget?.targetMean && quote?.c) {
    upside = ((priceTarget.targetMean - quote.c) / quote.c) * 100;
  }

  if (bullScore > 60) {
    signal = 'STRONG BUY';
    confidence = Math.min(95, Math.round(bullScore));
    reason = `${strongBuy + buy} of ${total} analysts rate this a Buy/Strong Buy`;
  } else if (bullScore > 40) {
    signal = 'BUY';
    confidence = Math.round(bullScore);
    reason = `Moderate bullish consensus among ${total} analysts`;
  } else if (bearScore > 50) {
    signal = 'SELL';
    confidence = Math.round(bearScore);
    reason = `${strongSell + sell} of ${total} analysts rate this a Sell/Strong Sell`;
  } else {
    signal = 'HOLD';
    confidence = Math.round(50 + (bullScore - bearScore) / 2);
    reason = `Mixed sentiment — ${hold} analysts recommend holding`;
  }

  // Upside boost
  if (upside !== null) {
    if (upside > 20 && signal !== 'SELL') {
      reason += `. Analyst price target implies ${upside.toFixed(1)}% upside`;
    } else if (upside < -10) {
      reason += `. Target price implies ${Math.abs(upside).toFixed(1)}% downside risk`;
    }
  }

  return {
    signal,
    confidence: Math.max(0, Math.min(100, confidence)),
    reason,
    analystCount: total,
    breakdown: { strongBuy, buy, hold, sell, strongSell },
    targetPrice: priceTarget?.targetMean || null,
    targetHigh: priceTarget?.targetHigh || null,
    targetLow: priceTarget?.targetLow || null,
    upside: upside !== null ? parseFloat(upside.toFixed(2)) : null,
  };
};

// OpenAI-powered analysis (optional — only if OPENAI_API_KEY is set)
const getOpenAIInsight = async (symbol, signal, metrics) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const prompt = `You are a stock market analyst. Analyze ${symbol} stock in 2-3 sentences.
Signal: ${signal.signal} (${signal.confidence}% confidence)
Analyst target: $${signal.targetPrice || 'N/A'} (${signal.upside ? signal.upside + '% upside' : 'N/A'})
Metric highlights: P/E: ${metrics?.metric?.peNormalizedAnnual || 'N/A'}, 52W High: ${metrics?.metric?.['52WeekHigh'] || 'N/A'}, 52W Low: ${metrics?.metric?.['52WeekLow'] || 'N/A'}
Be concise, professional, and data-driven.`;

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.4,
      },
      {
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    return res.data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.warn('[AI] OpenAI error:', e.message);
    return null;
  }
};

// @route   GET /api/ai/insights/:symbol
// @desc    Get AI-powered stock insights
router.get('/insights/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    // Fetch data in parallel
    const [recs, priceTarget, metrics, quote] = await Promise.all([
      finnhubGet('/stock/recommendation', { symbol }),
      finnhubGet('/stock/price-target', { symbol }),
      finnhubGet('/stock/metric', { symbol, metric: 'all' }),
      finnhubGet('/quote', { symbol }),
    ]);

    const signal = deriveSignal(recs, priceTarget, quote);

    // Try to get OpenAI insight
    const aiText = await getOpenAIInsight(symbol, signal, metrics);

    // Historical context from metrics
    const keyMetrics = metrics?.metric ? {
      pe: metrics.metric.peNormalizedAnnual,
      eps: metrics.metric.epsNormalizedAnnual,
      revenueGrowth: metrics.metric.revenueGrowthQuarterlyYoy,
      beta: metrics.metric.beta,
      week52High: metrics.metric['52WeekHigh'],
      week52Low: metrics.metric['52WeekLow'],
      dividendYield: metrics.metric.dividendYieldIndicatedAnnual,
      roa: metrics.metric.roa5Y,
      roe: metrics.metric.roe5Y,
    } : {};

    res.json({
      success: true,
      data: {
        symbol,
        signal: signal.signal,
        confidence: signal.confidence,
        reason: signal.reason,
        aiAnalysis: aiText,
        analystCount: signal.analystCount,
        breakdown: signal.breakdown,
        priceTarget: {
          mean: signal.targetPrice,
          high: signal.targetHigh,
          low: signal.targetLow,
          upside: signal.upside,
        },
        keyMetrics,
        currentPrice: quote?.c || null,
        generatedAt: new Date().toISOString(),
        source: aiText ? 'OpenAI + Finnhub' : 'Finnhub (rule-based)',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/ai/predict
// @desc    Simple ML-style price prediction using historical trend
router.get('/predict/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const stockService = require('../services/stockService');
    const history = await stockService.getHistoricalData(symbol, 'daily');

    if (!history || history.length < 30) {
      return res.json({ success: false, error: 'Insufficient historical data' });
    }

    // Simple linear regression on closing prices
    const closes = history.slice(-90).map((d, i) => ({ x: i, y: d.close }));
    const n = closes.length;
    const sumX = closes.reduce((s, p) => s + p.x, 0);
    const sumY = closes.reduce((s, p) => s + p.y, 0);
    const sumXY = closes.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = closes.reduce((s, p) => s + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const currentPrice = closes[closes.length - 1].y;
    const predict7d = intercept + slope * (n + 7);
    const predict30d = intercept + slope * (n + 30);

    // Volatility (standard deviation)
    const mean = sumY / n;
    const variance = closes.reduce((s, p) => s + Math.pow(p.y - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    res.json({
      success: true,
      data: {
        symbol,
        currentPrice,
        predictions: {
          '7d': parseFloat(predict7d.toFixed(2)),
          '30d': parseFloat(predict30d.toFixed(2)),
        },
        change: {
          '7d': parseFloat(((predict7d - currentPrice) / currentPrice * 100).toFixed(2)),
          '30d': parseFloat(((predict30d - currentPrice) / currentPrice * 100).toFixed(2)),
        },
        trend: slope > 0 ? 'UPWARD' : 'DOWNWARD',
        volatility: parseFloat(stdDev.toFixed(2)),
        confidence: Math.max(20, Math.min(85, 70 - (stdDev / currentPrice * 100) * 2)),
        method: 'Linear Regression (90-day window)',
        dataPoints: n,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/forgot-password
module.exports = router;
