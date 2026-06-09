// Deterministic mock OHLC generator for demo / fallback data
// Used by the candlestick chart and the sparklines so the UI always has data.

const rand = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateCandles = ({ count = 80, base = 75000, trend = 0.04, vol = 0.012 } = {}) => {
  const candles = [];
  let price = base;
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const t = Math.floor((now - i * 60 * 60 * 1000) / 1000);
    const open = price;
    const drift = (rand(i * 1.13) - 0.5) * vol * price;
    const close = Math.max(1, open + drift + (trend * price) / count);
    const high = Math.max(open, close) + rand(i * 2.7) * vol * price * 0.6;
    const low = Math.min(open, close) - rand(i * 3.31) * vol * price * 0.6;
    candles.push({
      time: t,
      open,
      high,
      low,
      close,
      volume: Math.floor(rand(i * 4.7) * 5000) + 250,
    });
    price = close;
  }
  return candles;
};

export const generateSparkline = ({ count = 24, base = 100, vol = 0.04, seed = 1 } = {}) => {
  const points = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v = v * (1 + (rand(i * seed * 1.7) - 0.5) * vol);
    points.push(v);
  }
  return points;
};
