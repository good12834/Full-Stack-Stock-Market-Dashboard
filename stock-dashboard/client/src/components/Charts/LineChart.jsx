import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {new Date(label).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const LineChart = ({ data, gradientId = 'colorPrice' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        No data available
      </div>
    );
  }

  const isPositive = data[data.length - 1]?.close >= data[0]?.close;
  const color = isPositive ? '#22c55e' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['dataMin - 5', 'dataMax + 5']}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineChart;