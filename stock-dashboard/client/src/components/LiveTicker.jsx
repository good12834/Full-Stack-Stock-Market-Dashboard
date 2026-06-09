import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const TickerItem = ({ stock, onClick }) => {
  const isUp = (stock.changePercent ?? stock.change ?? 0) >= 0;
  return (
    <button
      onClick={() => onClick(stock.symbol)}
      className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/5 rounded-lg transition-colors shrink-0 group"
    >
      <span className="text-xs font-bold text-white/90 group-hover:text-white">{stock.symbol}</span>
      <span className="text-xs font-semibold tabular-nums text-white/75">
        ${typeof stock.price === 'number' ? stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
      </span>
      <span className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent ?? 0).toFixed(2)}%
      </span>
    </button>
  );
};

const Separator = () => (
  <span className="text-white/15 mx-1 shrink-0 select-none">•</span>
);

const LiveTicker = () => {
  const { stocks } = useStore();
  const navigate = useNavigate();
  const trackRef = useRef(null);

  if (!stocks || stocks.length === 0) return null;

  // Duplicate the list so it scrolls seamlessly
  const doubled = [...stocks, ...stocks];

  return (
    <div className="ticker-wrap h-9 glass border-b border-white/[0.05] flex items-center">
      <div className="ticker-track flex items-center" ref={trackRef}>
        {doubled.map((stock, idx) => (
          <React.Fragment key={`${stock.symbol}-${idx}`}>
            <TickerItem stock={stock} onClick={(s) => navigate(`/stock/${s}`)} />
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
