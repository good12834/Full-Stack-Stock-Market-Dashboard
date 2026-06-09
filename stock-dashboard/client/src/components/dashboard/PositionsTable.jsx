import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const TABS = [
  { key: 'positions', label: 'Positions' },
  { key: 'orders', label: 'Orders' },
  { key: 'history', label: 'History' },
];

const FALLBACK = {
  positions: [
    { symbol: 'BTC/USD', type: 'LONG',  entry: 64250, mark: 65120, liq: 55320, pnl: 644.3 },
    { symbol: 'ETH/USD', type: 'SHORT', entry: 3150,  mark: 3085,  liq: 3400,  pnl: 68.75 },
    { symbol: 'SOL/USD', type: 'LONG',  entry: 186,   mark: 189.5, liq: 150,   pnl: 8.7 },
    { symbol: 'BTC/USD', type: 'SHORT', entry: 66200, mark: 65950, liq: 70000, pnl: 120 },
  ],
  orders: [
    { symbol: 'AAPL',  type: 'BUY',  entry: 225,  mark: 225.3, liq: '—',     pnl: 0.3 },
    { symbol: 'TSLA',  type: 'SELL', entry: 244,  mark: 243.7, liq: '—',     pnl: 0.42 },
    { symbol: 'NVDA',  type: 'BUY',  entry: 194,  mark: 195.3, liq: '—',     pnl: 1.12 },
  ],
  history: [
    { symbol: 'GOOGL', type: 'BUY',  entry: 2830, mark: 2840, liq: '—',   pnl: 350 },
    { symbol: 'MSFT',  type: 'SELL', entry: 303,  mark: 302.1, liq: '—',  pnl: 4.5 },
  ],
};

const PositionsTable = ({ positions, orders, history }) => {
  const [tab, setTab] = useState('positions');
  const data = positions || FALLBACK[tab];

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-medium pb-1 -mb-1 border-b-2 transition ${
              tab === t.key
                ? 'text-white border-white/80'
                : 'text-white/45 border-transparent hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-white/40 uppercase tracking-wider">
              <th className="text-left font-medium py-2 pr-3">Symbol</th>
              <th className="text-left font-medium py-2 pr-3">Type</th>
              <th className="text-right font-medium py-2 pr-3">Entry</th>
              <th className="text-right font-medium py-2 pr-3">Mark</th>
              <th className="text-right font-medium py-2 pr-3">Liq</th>
              <th className="text-right font-medium py-2 pr-3">PnL</th>
              <th className="text-right font-medium py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const positive = row.pnl >= 0;
              return (
                <tr
                  key={i}
                  className="border-t border-white/[0.04] hover:bg-white/[0.025] transition"
                >
                  <td className="py-2.5 pr-3 font-semibold text-white/90">{row.symbol}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.type === 'LONG' || row.type === 'BUY'
                          ? 'text-bull-500 bg-bull-500/10'
                          : 'text-bear-500 bg-bear-500/10'
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-white/75">{formatCurrency(row.entry)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-white/75">{formatCurrency(row.mark)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-white/45">{row.liq}</td>
                  <td className={`py-2.5 pr-3 text-right tabular-nums font-medium ${positive ? 'text-bull-500' : 'text-bear-500'}`}>
                    {positive ? '+' : ''}{formatCurrency(row.pnl)}
                  </td>
                  <td className="py-2.5 text-right">
                    <button className="text-[10px] text-white/40 hover:text-white/80 mr-1">TP/SL</button>
                    <button className="text-[10px] text-bear-500 hover:text-bear-400">Close</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTable;
