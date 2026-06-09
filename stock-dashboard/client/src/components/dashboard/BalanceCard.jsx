import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { formatCurrency, formatPercent, formatCompactNumber } from '../../utils/formatters';
import Sparkline from '../charts/Sparkline';
import { generateSparkline } from '../../utils/miniChart';

// Curated ticker set that mirrors the inspiration mock. When real data is
// available, the parent component will pass a `live` array and we'll merge.
const FALLBACK_TICKERS = [
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: 195.33, changePct: 1.2, seed: 1, vol: 0.025, base: 195 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2840, changePct: 0.08, seed: 2, vol: 0.012, base: 2840 },
  { symbol: 'MSFT', name: 'Microsoft', price: 302.1, changePct: 0.24, seed: 3, vol: 0.014, base: 302 },
  { symbol: 'NIKE', name: 'Nike, Inc.', price: 103.1, changePct: -0.082, seed: 4, vol: 0.022, base: 103 },
  { symbol: 'TSLA', name: 'Tesla', price: 243.7, changePct: -1.12, seed: 5, vol: 0.035, base: 243 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 225.3, changePct: 0.23, seed: 6, vol: 0.013, base: 225 },
];

const TABS = [
  { key: 'assets', label: 'Assets' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'gold', label: 'Gold' },
];

const BalanceCard = ({ stocks = [], totalBalance = 310082.2, dayChange = 1364.24 }) => {
  const [tab, setTab] = useState('assets');
  const [q, setQ] = useState('');

  // Build display tickers — prefer live data, otherwise use curated fallback
  const tickers = useMemo(() => {
    const liveMap = new Map(stocks.map((s) => [String(s.symbol).toUpperCase(), s]));
    return FALLBACK_TICKERS.map((t) => {
      const live = liveMap.get(t.symbol);
      if (live) {
        return {
          ...t,
          price: live.price ?? t.price,
          changePct: live.changePercent ?? live.changePct ?? t.changePct,
        };
      }
      return t;
    });
  }, [stocks]);

  const filtered = useMemo(() => {
    if (!q.trim()) return tickers;
    const needle = q.toLowerCase();
    return tickers.filter(
      (t) => t.symbol.toLowerCase().includes(needle) || t.name.toLowerCase().includes(needle)
    );
  }, [q, tickers]);

  const dayPct = (dayChange / (totalBalance - dayChange)) * 100;
  const isPositiveDay = dayChange >= 0;

  return (
    <section className="glass rounded-2xl p-5 h-full flex flex-col">
      {/* Total balance */}
      <div className="flex items-center gap-2 mb-1">
        <span className="trade-label">Total Balance</span>
      </div>
      <h2 className="text-[34px] leading-[1.05] font-semibold tracking-tight tabular-nums">
        {formatCurrency(totalBalance, { decimals: 2 })}
      </h2>
      <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${isPositiveDay ? 'text-bull-500' : 'text-bear-500'}`}>
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-current/15">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3">
            {isPositiveDay ? <path d="M5 15l7-7 7 7" /> : <path d="M5 9l7 7 7-7" />}
          </svg>
        </span>
        <span className="font-medium">{formatCurrency(Math.abs(dayChange))}</span>
        <span className="text-white/45">({formatPercent(dayPct)}) Today</span>
      </div>

      {/* Tabs */}
      <div className="mt-5 mb-3 flex items-center justify-between">
        <div className="seg">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? 'active' : ''}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="bg-white/5 border border-white/10 rounded-lg pl-7 pr-7 py-1.5 text-xs placeholder-white/30 focus:outline-none focus:border-white/25 w-32 transition"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Top assets</h3>
        <button className="text-[11px] text-white/40 hover:text-white/70 transition">•••</button>
      </div>

      {/* Tickers list */}
      <div className="flex-1 -mx-1 overflow-y-auto pr-1" style={{ maxHeight: 360 }}>
        <ul className="space-y-1">
          {filtered.map((t) => {
            const positive = t.changePct >= 0;
            const series = generateSparkline({ count: 28, base: t.base, vol: t.vol, seed: t.seed });
            return (
              <li
                key={t.symbol}
                className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition"
              >
                <div className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[10px] font-semibold tracking-wide">
                  {t.symbol.slice(0, 4)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{t.symbol}</span>
                    <span className="font-medium text-sm tabular-nums">
                      {t.price >= 1000
                        ? `$${formatCompactNumber(t.price)}`
                        : formatCurrency(t.price, { decimals: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-white/45 truncate">{t.name}</span>
                    <span className={`text-[11px] font-medium tabular-nums ${positive ? 'text-bull-500' : 'text-bear-500'}`}>
                      {positive ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="opacity-80 group-hover:opacity-100 transition">
                  <Sparkline points={series} positive={positive} width={70} height={28} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* View all */}
      <button className="mt-3 w-full py-2 rounded-lg text-xs text-white/55 hover:text-white hover:bg-white/5 transition">
        View all
      </button>
    </section>
  );
};

export default BalanceCard;
