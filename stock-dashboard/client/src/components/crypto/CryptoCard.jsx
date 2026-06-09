import React from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { getCryptoImage, getFallbackImage } from '../../utils/cryptoImages';

const sparklineSvg = (data, isPositive, width = 80, height = 32) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const path = points.join(' L ');
  const fillPath = `M 0,${height} L ${path} L ${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <path d={`M ${path}`} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={fillPath} fill={isPositive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'} />
    </svg>
  );
};

const CryptoCard = ({ coin, onToggleWatch, isWatched }) => {
  if (!coin) return null;

  const isPositive = coin.price_change_percentage_24h >= 0;
  const price = coin.current_price || coin.price || 0;
  const change = coin.price_change_percentage_24h || 0;
  const marketCap = coin.market_cap || 0;
  const volume = coin.total_volume || 0;
  const sparklineData = coin.sparkline_in_7d || [];

  const formatPrice = (p) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(6)}`;
  };

  const formatLarge = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const imgSrc = coin.image || getCryptoImage(coin.symbol);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-4 transition-all duration-200 hover:border-brand-500/30 hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={imgSrc}
                alt={coin.name}
                className="w-10 h-10 rounded-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getFallbackImage(coin.symbol, '8b5cf6', 40);
                }}
              />
              {coin.market_cap_rank && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {coin.market_cap_rank}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{coin.symbol}</h3>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                  #{coin.market_cap_rank || '—'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{coin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-0.5 text-sm font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          {formatPrice(price)}
        </div>

        {/* Sparkline */}
        <div className="flex justify-center mb-3">
          {sparklineData.length > 0 ? (
            sparklineSvg(sparklineData, isPositive, 160, 36)
          ) : (
            <div className="h-9 w-full flex items-center justify-center">
              <span className="text-[10px] text-slate-400">No chart data</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Market Cap</span>
            <p className="font-medium text-slate-700 dark:text-slate-300">{formatLarge(marketCap)}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Volume (24h)</span>
            <p className="font-medium text-slate-700 dark:text-slate-300">{formatLarge(volume)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={() => onToggleWatch?.(coin.symbol)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              isWatched
                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-yellow-500' : ''}`} />
            {isWatched ? 'Watched' : 'Watch'}
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-all">
            Trade
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;