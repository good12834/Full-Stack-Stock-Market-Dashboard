import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, X, PieChart, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DEFAULT_HOLDINGS = [
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.42, buyPrice: 62340 },
  { symbol: 'ETH', name: 'Ethereum', amount: 3.5, buyPrice: 3210 },
  { symbol: 'SOL', name: 'Solana', amount: 15, buyPrice: 145 },
];

const PortfolioTracker = ({ coins = [] }) => {
  const [holdings, setHoldings] = useState(DEFAULT_HOLDINGS);
  const [showAdd, setShowAdd] = useState(false);
  const [newHolding, setNewHolding] = useState({ symbol: '', amount: '', buyPrice: '' });
  const [activeTab, setActiveTab] = useState('holdings');

  const getCurrentPrice = (symbol) => {
    const coin = coins.find(c => c.symbol === symbol);
    return coin?.current_price || 0;
  };

  const holdingsWithPrices = holdings.map(h => {
    const currentPrice = getCurrentPrice(h.symbol);
    const currentValue = h.amount * currentPrice;
    const costBasis = h.amount * h.buyPrice;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPercent };
  });

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = holdingsWithPrices.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPnl = totalValue - totalCostBasis;
  const totalPnlPercent = totalCostBasis > 0 ? (totalPnl / totalCostBasis) * 100 : 0;

  const handleAddHolding = () => {
    if (!newHolding.symbol || !newHolding.amount || !newHolding.buyPrice) return;
    const coin = coins.find(c => c.symbol === newHolding.symbol.toUpperCase());
    setHoldings(prev => [...prev, {
      symbol: newHolding.symbol.toUpperCase(),
      name: coin?.name || newHolding.symbol.toUpperCase(),
      amount: parseFloat(newHolding.amount),
      buyPrice: parseFloat(newHolding.buyPrice),
    }]);
    setNewHolding({ symbol: '', amount: '', buyPrice: '' });
    setShowAdd(false);
  };

  const handleRemoveHolding = (symbol) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatUSD = (val) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio Tracker</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Value</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatUSD(totalValue)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">P&L</span>
            <div className={`text-lg font-bold mt-0.5 flex items-center gap-1 ${
              totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {totalPnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {formatUSD(Math.abs(totalPnl))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Return</span>
            <div className={`text-lg font-bold mt-0.5 ${
              totalPnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {holdingsWithPrices.map((h) => (
          <div key={h.symbol} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  h.symbol === 'BTC' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                  h.symbol === 'ETH' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                }`}>
                  {h.symbol.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{h.symbol}</span>
                    <span className="text-xs text-slate-400">{h.amount} coins</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Bought @ {formatPrice(h.buyPrice)}</span>
                    <span>Now @ {formatPrice(h.currentPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatUSD(h.currentValue)}
                </div>
                <div className={`text-xs font-medium flex items-center gap-0.5 justify-end ${
                  h.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {h.pnlPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(h.pnlPercent).toFixed(2)}%
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  h.pnlPercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(h.pnlPercent) * 2, 100)}%` }}
              />
            </div>
            <button
              onClick={() => handleRemoveHolding(h.symbol)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add holding form */}
      {showAdd && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-ink-800">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input
              type="text"
              placeholder="Symbol (BTC)"
              value={newHolding.symbol}
              onChange={(e) => setNewHolding(prev => ({ ...prev, symbol: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-ink-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="number"
              step="any"
              placeholder="Amount"
              value={newHolding.amount}
              onChange={(e) => setNewHolding(prev => ({ ...prev, amount: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-ink-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="number"
              step="any"
              placeholder="Buy Price"
              value={newHolding.buyPrice}
              onChange={(e) => setNewHolding(prev => ({ ...prev, buyPrice: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-ink-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddHolding}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-all"
            >
              Add Holding
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTracker;