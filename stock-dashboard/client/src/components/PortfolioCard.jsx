import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../utils/formatters';

const PortfolioCard = ({ position }) => {
  const navigate = useNavigate();
  const { symbol, quantity, avgCost, currentPrice, value, gain, gainPercent } = position;
  const isPositive = gain >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate(`/stock/${symbol}`)}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
          >
            {symbol.slice(0, 2)}
          </div>
          <div>
            <h3
              onClick={() => navigate(`/stock/${symbol}`)}
              className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            >
              {symbol}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {quantity} shares
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
          isPositive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {formatPercent(gainPercent)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Current Value</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(value)}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Avg Cost</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(avgCost)}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Current Price</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(currentPrice)}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Gain/Loss</p>
          <p className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(gain)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;