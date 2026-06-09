import React from 'react';
import { Star, TrendingUp, TrendingDown, X, Bell } from 'lucide-react';
import { getCryptoImage, getFallbackImage } from '../../utils/cryptoImages';

const Watchlist = ({ coins = [], watchlist = [], onToggleWatch, allCoins = [] }) => {
  const watchedCoins = allCoins.filter(coin => watchlist.includes(coin.symbol));

  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Watchlist</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-medium">
              {watchlist.length}
            </span>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {watchedCoins.length === 0 ? (
        <div className="p-6 text-center">
          <Star className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Your watchlist is empty</p>
          <p className="text-[10px] text-slate-500 mt-1">Click the star icon on any coin to add it</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {watchedCoins.map((coin) => {
            const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
            const imgSrc = coin.image || getCryptoImage(coin.symbol);

            return (
              <div key={coin.symbol} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-7 h-7 rounded-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackImage(coin.symbol, '8b5cf6', 28);
                    }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{coin.symbol}</div>
                    <div className="text-[10px] text-slate-400">#{coin.market_cap_rank || '—'}</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div className={`text-xs font-medium flex items-center gap-0.5 justify-end ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleWatch?.(coin.symbol)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;