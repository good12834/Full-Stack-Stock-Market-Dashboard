import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const TrendingStocks = ({ stocks = [] }) => {
  const navigate = useNavigate();

  const sorted = [...stocks].sort(
    (a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0)
  );

  const trending = sorted.slice(0, 5);
  const gainers = sorted.filter((s) => (s.changePercent ?? 0) > 0).slice(0, 5);
  const losers = sorted.filter((s) => (s.changePercent ?? 0) < 0).slice(0, 5);

  const StockRow = ({ stock, variant }) => {
    const isGainer = (stock.changePercent ?? 0) >= 0;
    const isTrending = variant === 'trending';

    const symbol = stock.symbol ?? '';
    let badgeColor, badgeText;
    if (isTrending) {
      badgeColor = 'bg-amber-500/15 text-amber-400';
      badgeText = (stock.changePercent ?? 0).toFixed(2) + '%';
    } else {
      badgeColor = isGainer ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400';
      badgeText = symbol.slice(0, 2);
    }

    return (
      <button
        onClick={() => navigate(`/stock/${stock.symbol}`)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0 truncate">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${badgeColor}`}>
            {badgeText}
          </div>
          <div className="text-left truncate">
            <div className="text-sm font-semibold text-white/90 group-hover:text-white truncate">{stock.symbol}</div>
            <div className="text-[10px] text-white/40 truncate max-w-[100px]">{stock.name || stock.symbol}</div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-sm font-bold tabular-nums text-white/85">
            ${stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
          </div>
          <div className={`text-[10px] font-semibold ${(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
      {/* Trending Stocks */}
      <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white/80">Trending Stocks</h2>
        </div>
        <div className="space-y-0.5">
          {trending.length > 0
            ? trending.map((s, i) => <StockRow key={s.symbol ?? `trending-${i}`} stock={s} variant="trending" />)
            : <p className="text-xs text-white/35 px-3">No data yet</p>}
        </div>
      </div>

      {/* Top Gainers */}
      <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white/80">Top Gainers</h2>
        </div>
        <div className="space-y-0.5">
          {gainers.length > 0
            ? gainers.map((s, i) => <StockRow key={s.symbol ?? `gainer-${i}`} stock={s} variant="gainers" />)
            : <p className="text-xs text-white/35 px-3">No data yet</p>}
        </div>
      </div>

      {/* Top Losers */}
      <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-white/80">Top Losers</h2>
        </div>
        <div className="space-y-0.5">
          {losers.length > 0
            ? losers.map((s, i) => <StockRow key={s.symbol ?? `loser-${i}`} stock={s} variant="losers" />)
            : <p className="text-xs text-white/35 px-3">No data yet</p>}
        </div>
      </div>
    </div>
  );
};

export default TrendingStocks;
