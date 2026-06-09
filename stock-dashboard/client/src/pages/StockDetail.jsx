import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bookmark, Plus, ArrowLeft } from 'lucide-react';
import CandlestickChart from '../components/charts/CandlestickChart';
import Sparkline from '../components/charts/Sparkline';
import useStore from '../store/useStore';
import { formatCurrency, formatPercent, formatCompactNumber, formatMarketCap } from '../utils/formatters';
import { generateCandles, generateSparkline } from '../utils/miniChart';

const INTERVALS = [
  { key: 'intraday', label: 'Intraday (5m)' },
  { key: 'daily',    label: 'Daily' },
  { key: 'weekly',   label: 'Weekly' },
  { key: 'monthly',  label: 'Monthly' },
];

// Normalize the API data to the { time, open, high, low, close, volume } format
// the new chart expects. Falls back to locally generated candles if nothing
// comes back so the chart is never empty.
const normalize = (raw, base) => {
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length && typeof raw[0] === 'object' && 'open' in raw[0]) {
    return raw.map((c, i) => ({
      time: c.time ?? c.t ?? Math.floor((Date.now() - (raw.length - i) * 86400000) / 1000),
      open: Number(c.open ?? c.o ?? base),
      high: Number(c.high ?? c.h ?? base),
      low: Number(c.low ?? c.l ?? base),
      close: Number(c.close ?? c.c ?? base),
      volume: Number(c.volume ?? c.v ?? 1000),
    }));
  }
  if (Array.isArray(raw) && raw.length && 'date' in raw[0]) {
    return raw.map((c) => ({
      time: Math.floor(new Date(c.date).getTime() / 1000) || 0,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume ?? 1000),
    }));
  }
  return null;
};

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const {
    selectedStock,
    stockHistory,
    stockIntraday,
    loading,
    error,
    fetchStockDetail,
    fetchStockHistory,
    fetchStockIntraday,
    isAuthenticated,
    addToWatchlist,
    removeFromWatchlist,
    watchlist,
  } = useStore();

  const [chartType, setChartType] = useState('candlestick');
  const [range, setRange] = useState('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');

  const isInWatchlist = watchlist.some(
    (s) => String(s.symbol).toUpperCase() === String(symbol).toUpperCase()
  );

  useEffect(() => {
    if (!symbol) return;
    fetchStockDetail(symbol);
    if (range === 'intraday') fetchStockIntraday(symbol);
    else fetchStockHistory(symbol, range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, range]);

  useEffect(() => {
    if (!symbol || range !== 'intraday') return;
    const poll = window.setInterval(() => fetchStockIntraday(symbol), 60000);
    return () => window.clearInterval(poll);
  }, [symbol, range, fetchStockIntraday]);

  const raw = range === 'intraday' ? stockIntraday : stockHistory;
  const basePrice = selectedStock?.price ?? 100;

  const candles = useMemo(() => {
    const n = normalize(raw, basePrice);
    if (n && n.length) return n;
    const map = { intraday: 48, daily: 80, weekly: 100, monthly: 120 };
    return generateCandles({
      count: map[range] || 80,
      base: basePrice,
      trend: 0.05,
      vol: 0.014,
    });
  }, [raw, basePrice, range]);

  const sparkSeries = useMemo(
    () => generateSparkline({ count: 30, base: basePrice, vol: 0.02, seed: 7 }),
    [basePrice]
  );

  const handleAddToWatchlist = async () => {
    if (isInWatchlist) await removeFromWatchlist(symbol);
    else await addToWatchlist(symbol);
  };

  const handleAddPosition = async () => {
    if (!quantity || !avgCost) return;
    await useStore.getState().addPosition({
      symbol: String(symbol).toUpperCase(),
      quantity: parseFloat(quantity),
      avgCost: parseFloat(avgCost),
    });
    setShowAddModal(false);
    setQuantity('');
    setAvgCost('');
  };

  if (loading && !selectedStock) {
    return (
      <div className="starfield min-h-[calc(100vh-72px)] p-5 flex items-center justify-center">
        <div className="glass-strong px-5 py-4 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <span className="text-sm text-white/70">Loading {symbol}…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="starfield min-h-[calc(100vh-72px)] p-5">
        <div className="glass rounded-xl p-4 text-bear-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="starfield min-h-[calc(100vh-72px)] p-5 flex items-center justify-center">
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-white/65">Stock not found</p>
          <button onClick={() => navigate('/')} className="mt-3 text-sm text-brand-300 hover:underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPositive = selectedStock.change >= 0;
  const isUp = candles[candles.length - 1]?.close >= candles[0]?.open;

  return (
    <div className="starfield min-h-[calc(100vh-72px)] p-4 sm:p-5">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <section className="glass rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-base font-bold">
                {String(selectedStock.symbol).slice(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold tracking-tight">{selectedStock.symbol}</h1>
                  {selectedStock.name && (
                    <span className="text-sm text-white/55">{selectedStock.name}</span>
                  )}
                  <span className="text-[10px] text-bull-500 bg-bull-500/10 px-1.5 py-0.5 rounded font-semibold">
                    {formatPercent(selectedStock.changePercent)}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-3xl font-semibold tabular-nums">
                    {formatCurrency(selectedStock.price)}
                  </span>
                  <span className={`text-sm font-medium tabular-nums ${isPositive ? 'text-bull-500' : 'text-bear-500'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(selectedStock.change)} ({formatPercent(selectedStock.changePercent)})
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-[11px] text-white/45">
                  <span>O {formatCurrency(selectedStock.open)}</span>
                  <span>H {formatCurrency(selectedStock.high)}</span>
                  <span>L {formatCurrency(selectedStock.low)}</span>
                  <span>PC {formatCurrency(selectedStock.previousClose)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkline points={sparkSeries} positive={isUp} width={140} height={40} />
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleAddToWatchlist}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                      isInWatchlist
                        ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/40'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-current' : ''}`} />
                    {isInWatchlist ? 'Saved' : 'Watchlist'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-brand-500 to-blue-500 hover:brightness-110 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Portfolio
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Volume', value: formatCompactNumber(selectedStock.volume) },
            { label: 'Market Cap', value: formatMarketCap(selectedStock.marketCap) },
            { label: 'P/E Ratio', value: selectedStock.pe ?? 'N/A' },
            { label: 'Day Range', value: `${formatCurrency(selectedStock.low)} – ${formatCurrency(selectedStock.high)}` },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-4">
              <p className="text-[10px] text-white/45 tracking-wider uppercase">{m.label}</p>
              <p className="text-base font-semibold mt-1 truncate tabular-nums">{m.value}</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="seg">
              <button onClick={() => setChartType('line')} className={chartType === 'line' ? 'active' : ''}>
                Line
              </button>
              <button onClick={() => setChartType('candlestick')} className={chartType === 'candlestick' ? 'active' : ''}>
                Candlestick
              </button>
            </div>
            <div className="seg">
              {INTERVALS.map((iv) => (
                <button
                  key={iv.key}
                  onClick={() => setRange(iv.key)}
                  className={range === iv.key ? 'active' : ''}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>

          {range === 'intraday' && (
            <div className="mb-3 flex items-center gap-2 text-[11px] text-blue-400">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Live intraday (5m) — auto-refreshes every 60s
            </div>
          )}

          <CandlestickChart candles={candles} height={360} />
        </section>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Add {symbol} to Portfolio</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/45 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="trade-label block mb-1.5">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="trade-input w-full"
                    placeholder="Number of shares"
                  />
                </div>
                <div>
                  <label className="trade-label block mb-1.5">Average cost / share ($)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={avgCost}
                    onChange={(e) => setAvgCost(e.target.value)}
                    className="trade-input w-full"
                    placeholder="Purchase price"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPosition}
                  disabled={!quantity || !avgCost}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-blue-500 hover:brightness-110 disabled:opacity-50 rounded-lg transition"
                >
                  Add Position
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDetail;
