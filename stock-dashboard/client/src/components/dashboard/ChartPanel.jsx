import React, { useEffect, useMemo, useState } from 'react';
import CandlestickChart from '../charts/CandlestickChart';
import PositionsTable from './PositionsTable';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { generateCandles } from '../../utils/miniChart';

const INTERVALS = ['1D', '7D', '1M', '1Y', 'All'];

const Stat = ({ label, value, positive }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-white/45 tracking-wider uppercase">{label}</span>
    <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-bear-500' : 'text-bull-500'}`}>
      {value}
    </span>
  </div>
);

const ChartPanel = ({ symbol = 'BTC/USDT', basePrice = 65433.5 }) => {
  const [interval, setInterval_] = useState('1M');
  const [candles, setCandles] = useState(() =>
    generateCandles({ count: 80, base: basePrice, trend: 0.04, vol: 0.012 })
  );

  // Regenerate candles when symbol or interval changes
  useEffect(() => {
    const map = { '1D': 24, '7D': 56, '1M': 80, '1Y': 120, 'All': 160 };
    setCandles(
      generateCandles({
        count: map[interval] || 80,
        base: basePrice,
        trend: interval === '1Y' || interval === 'All' ? 0.18 : 0.04,
        vol: 0.012,
      })
    );
  }, [interval, basePrice]);

  // Live price = last close
  const livePrice = candles[candles.length - 1]?.close || basePrice;

  // 24h stats derived from first vs last
  const stats = useMemo(() => {
    if (candles.length < 2) return null;
    const first = candles[0];
    const last = candles[candles.length - 1];
    const change = last.close - first.open;
    const changePct = (change / first.open) * 100;
    const high24 = Math.max(...candles.map((c) => c.high));
    const low24 = Math.min(...candles.map((c) => c.low));
    const volume = candles.reduce((s, c) => s + (c.volume || 0), 0);
    return { change, changePct, high24, low24, volume };
  }, [candles]);

  const baseSymbol = (symbol || 'BTC/USDT').split('/')[0] || 'BTC';
  const quote = (symbol || 'BTC/USDT').split('/')[1] || 'USDT';

  return (
    <section className="glass rounded-2xl p-5 flex flex-col gap-4 h-full">
      {/* Symbol header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold">
            ₿
          </div>
          <div>
            <div className="text-base font-semibold flex items-center gap-2">
              {symbol}
              <span className="text-[10px] font-semibold text-bull-500 bg-bull-500/10 px-1.5 py-0.5 rounded">2.4%</span>
            </div>
            <div className="text-[11px] text-white/45">Bitcoin / TetherUS · Spot</div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-5 gap-5 text-right">
            <Stat label="24h Change" value={`${stats.change >= 0 ? '+' : ''}${stats.changePct.toFixed(2)}%`} positive={stats.change < 0} />
            <Stat label="24h Highest" value={formatCurrency(stats.high24)} positive={false} />
            <Stat label="24h Lowest" value={formatCurrency(stats.low24)} positive={true} />
            <Stat label="24h Volume" value={`${baseSymbol} ${formatCompactNumber(stats.volume)}`} positive={false} />
            <Stat label="24h Value" value={`$${formatCompactNumber(stats.volume * livePrice)}`} positive={false} />
          </div>
        )}
      </div>

      {/* Interval + actions */}
      <div className="flex items-center justify-between">
        <div className="seg">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval_(iv)}
              className={interval === iv ? 'active' : ''}
            >
              {iv}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {['i', '↗', '★'].map((s, i) => (
            <button
              key={i}
              className="w-7 h-7 rounded-lg text-white/45 hover:text-white hover:bg-white/5 flex items-center justify-center text-xs"
              title={['Indicators', 'Share', 'Watch'][i]}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        <CandlestickChart candles={candles} height={320} />
      </div>

      {/* Positions table */}
      <div className="pt-2 border-t border-white/[0.05]">
        <PositionsTable />
      </div>
    </section>
  );
};

export default ChartPanel;
