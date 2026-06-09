import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../utils/formatters';

const StockCard = ({ stock }) => {
  const navigate = useNavigate();
  const { symbol, name, price, change, changePercent } = stock;
  const isPositive = change >= 0;

  return (
    <div
      onClick={() => navigate(`/stock/${symbol}`)}
      className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all duration-200 cursor-pointer dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{symbol}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{name}</p>
          </div>
          {/* Intraday live indicator */}
          <span className="flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
          isPositive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {formatPercent(changePercent)}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(price)}
        </p>
        <p className={`text-sm font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? '+' : ''}{formatCurrency(change)}
        </p>
      </div>
    </div>
  );
};

export default StockCard;