import React from 'react';

const StatCard = ({ label, value, icon, trend = 'neutral', subtext, onClick }) => {
  const trendColor =
    trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-600 dark:text-slate-400';

  const bgColor =
    trend === 'up'
      ? 'bg-green-100 dark:bg-green-900/30'
      : trend === 'down'
        ? 'bg-red-100 dark:bg-red-900/30'
        : 'bg-slate-100 dark:bg-slate-700';

  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-default"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        {icon && <div className={`p-2 rounded-lg ${bgColor} ${trendColor}`}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtext}</p>
      )}
    </div>
  );
};

export default StatCard;