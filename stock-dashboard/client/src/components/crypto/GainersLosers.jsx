import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCryptoImage, getFallbackImage } from '../../utils/cryptoImages';

const GainersLosers = ({ coins = [] }) => {
  const sorted = [...coins].filter(c => c.price_change_percentage_24h != null);
  const gainers = [...sorted].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const losers = [...sorted].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Gainers */}
      <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Top Gainers</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {gainers.map((coin, i) => {
            const imgSrc = coin.image || getCryptoImage(coin.symbol, '22c55e');
            return (
              <div key={coin.symbol || i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-slate-400 font-medium w-4">{i + 1}</span>
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-6 h-6 rounded-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackImage(coin.symbol, '22c55e', 24);
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{coin.symbol}</span>
                    <span className="text-[10px] text-slate-400 ml-1">{formatPrice(coin.current_price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
          {gainers.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Losers */}
      <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Top Losers</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {losers.map((coin, i) => {
            const imgSrc = coin.image || getCryptoImage(coin.symbol, 'ef4444');
            return (
              <div key={coin.symbol || i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-slate-400 font-medium w-4">{i + 1}</span>
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-6 h-6 rounded-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackImage(coin.symbol, 'ef4444', 24);
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{coin.symbol}</span>
                    <span className="text-[10px] text-slate-400 ml-1">{formatPrice(coin.current_price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
          {losers.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GainersLosers;