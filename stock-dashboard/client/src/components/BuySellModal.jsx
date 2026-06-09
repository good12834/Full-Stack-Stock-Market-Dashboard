import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import useStore from '../store/useStore';

const BuySellModal = ({ stock, onClose }) => {
  const { addPosition, isAuthenticated } = useStore();
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState(stock?.price?.toFixed(2) ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(avgCost) || 0;
  const total = qty * price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qty || !price) return;

    if (!isAuthenticated) {
      setResult({ error: 'Please sign in to add to your portfolio.' });
      return;
    }

    setLoading(true);
    try {
      const ok = await addPosition({
        symbol: stock.symbol,
        quantity: qty,
        avgCost: price,
      });
      if (ok) {
        setSubmitted(true);
        setResult({ success: true });
      } else {
        setResult({ error: 'Failed to add position. Please try again.' });
      }
    } catch {
      setResult({ error: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white">{stock?.symbol}</h2>
            <p className="text-xs text-white/45">{stock?.name || 'Market Simulation'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current price */}
          <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
            <span className="text-xs text-white/45">Market Price</span>
            <div className="text-right">
              <span className="text-lg font-bold tabular-nums text-white">
                ${stock?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
              </span>
              <span className={`ml-2 text-xs font-semibold ${(stock?.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(stock?.changePercent ?? 0) >= 0 ? '+' : ''}{(stock?.changePercent ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Buy / Sell toggle */}
          <div className="seg flex w-full">
            {['BUY', 'SELL'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 flex items-center justify-center gap-1.5 ${side === s ? 'active' : ''} ${
                  s === 'BUY' && side === s ? '!bg-emerald-500/20 !text-emerald-400' :
                  s === 'SELL' && side === s ? '!bg-red-500/20 !text-red-400' : ''
                }`}
              >
                {s === 'BUY' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {s}
              </button>
            ))}
          </div>

          {submitted && result?.success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-white">Position Added!</p>
              <p className="text-xs text-white/50">
                {qty} × {stock.symbol} @ ${price.toFixed(2)} added to your portfolio.
              </p>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="trade-label">Quantity (shares)</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="trade-input"
                  required
                />
              </div>
              <div>
                <label className="trade-label">Price per share ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  placeholder={stock?.price?.toFixed(2)}
                  className="trade-input"
                  required
                />
              </div>

              {/* Order summary */}
              {total > 0 && (
                <div className="glass rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-white/55">
                    <span>Shares</span>
                    <span className="font-semibold text-white/80">{qty}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/55">
                    <span>Price</span>
                    <span className="font-semibold text-white/80">${price.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/[0.05] pt-1.5 flex justify-between text-sm">
                    <span className="font-medium text-white/70">Total</span>
                    <span className="font-bold text-white">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {result?.error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  {result.error}
                </div>
              )}

              {/* Simulation disclaimer */}
              <div className="flex items-start gap-1.5 text-[10px] text-white/30">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <span>This is a paper trading simulation. No real money is involved.</span>
              </div>

              <button
                type="submit"
                disabled={loading || !qty || !price}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  side === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 text-white'
                    : 'bg-red-500 hover:bg-red-400 disabled:bg-red-500/30 text-white'
                } disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing…' : `${side} ${qty || '—'} shares`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuySellModal;
