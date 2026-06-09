import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatVolume } from '../../utils/formatters';

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
          Volume: {formatVolume(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const VolumeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
        No volume data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          tickFormatter={(value) => formatVolume(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="volume"
          fill="#3b82f6"
          opacity={0.5}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;