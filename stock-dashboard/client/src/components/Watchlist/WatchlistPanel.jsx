import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const WatchlistPanel = () => {
  const { watchlist, isAuthenticated, removeFromWatchlist } = useStore();

  if (!isAuthenticated || watchlist.length === 0) {
    return null;
  }

  const handleRemove = (e, symbol) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWatchlist(symbol);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Watchlist ({watchlist.length})
      </p>
      {watchlist.map((stock) => (
        <Link
          key={stock.symbol}
          to={`/stock/${stock.symbol}`}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {stock.symbol}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {formatCurrency(stock.price)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${
              stock.change >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatPercent(stock.changePercent)}
            </span>
            <button
              onClick={(e) => handleRemove(e, stock.symbol)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
              title="Remove from watchlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default WatchlistPanel;