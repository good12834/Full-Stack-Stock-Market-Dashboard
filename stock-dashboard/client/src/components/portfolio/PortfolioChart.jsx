import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const prevValue = payload[0]?.payload?.prevValue || value;
  const change = value - prevValue;
  const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="glass-strong rounded-xl p-3 shadow-xl border border-white/10">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{formatCurrency(value)}</p>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{formatCurrency(Math.abs(change))} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </div>
    </div>
  );
};

const PortfolioChart = ({ performanceHistory = [] }) => {
  const [range, setRange] = useState('1M');

  const chartData = useMemo(() => {
    if (!performanceHistory?.length) {
      // Generate mock data for demo
      const now = Date.now();
      const mockData = [];
      let baseValue = 50000;
      const points = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : range === '6M' ? 180 : range === '1Y' ? 365 : 365;
      for (let i = points; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const change = (Math.random() - 0.48) * baseValue * 0.03;
        baseValue = Math.max(baseValue + change, baseValue * 0.8);
        const jitter = (Math.random() - 0.5) * baseValue * 0.01;
        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.round(baseValue + jitter),
          prevValue: i < points ? mockData[i + 1]?.value || baseValue : baseValue,
        });
      }
      return mockData;
    }

    // Use actual performance data
    let data = performanceHistory.map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: p.value,
    }));

    // Apply range filter
    if (range !== 'ALL') {
      const daysMap = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
      const maxDays = daysMap[range] || 30;
      const cutoff = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);
      data = data.filter(p => new Date(p.date) >= cutoff);
    }

    // Add prevValue for tooltip
    return data.map((point, i, arr) => ({
      ...point,
      prevValue: i > 0 ? arr[i - 1].value : point.value,
    }));
  }, [performanceHistory, range]);

  const isPositive = chartData.length > 1
    ? chartData[chartData.length - 1].value >= chartData[0].value
    : true;

  const gradientId = 'portfolioChartGradient';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="glass rounded-xl p-4 lg:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10">
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Portfolio Performance</h3>
            <p className="text-[10px] text-white/40">Value growth over time</p>
          </div>
        </div>
        <div className="seg">
          {timeRanges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={range === r ? 'active' : ''}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px] lg:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 2000', 'dataMax + 2000']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickMargin={8}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: isPositive ? '#22c55e' : '#ef4444', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PortfolioChart;