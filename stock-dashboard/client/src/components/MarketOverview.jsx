import React from 'react';

const INDICES = [
  { name: 'S&P 500', symbol: 'SPX', value: 5234.18, change: 12.4, changePercent: 0.24 },
  { name: 'NASDAQ', symbol: 'IXIC', value: 16742.39, change: 89.2, changePercent: 0.54 },
  { name: 'DOW JONES', symbol: 'DJI', value: 38671.5, change: -45.8, changePercent: -0.12 },
  { name: 'RUSSELL 2000', symbol: 'RUT', value: 2023.2, change: 8.9, changePercent: 0.44 },
  { name: 'VIX', symbol: 'VIX', value: 13.62, change: -0.34, changePercent: -2.43 },
];

const MarketOverview = ({ liveStocks = [] }) => {
  // Merge live stock data into indices where we have matching symbols
  const enriched = INDICES.map((idx) => {
    const live = liveStocks.find((s) => s.symbol === idx.symbol);
    return live ? { ...idx, value: live.price, change: live.change, changePercent: live.changePercent } : idx;
  });

  return (
    <div className="glass rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/80">Market Overview</h2>
        <span className="text-[10px] text-white/35 uppercase tracking-wider">Live</span>
      </div>
      <div className="space-y-2">
        {enriched.map((idx) => {
          const isUp = idx.changePercent >= 0;
          return (
            <div key={idx.symbol} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <div>
                <div className="text-xs font-semibold text-white/85">{idx.name}</div>
                <div className="text-[10px] text-white/35">{idx.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold tabular-nums text-white/90">
                  {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] font-semibold tabular-nums ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketOverview;
