import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const COLORS = ['#6c5ce7', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6'];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#e6e8ef" fontSize={16} fontWeight={700}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(230,232,239,0.5)" fontSize={12}>
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy + 36} textAnchor="middle" fill={fill} fontSize={11} fontWeight={600}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.8}
      />
    </g>
  );
};

const AssetAllocation = ({ positions = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const allocationData = useMemo(() => {
    if (!positions?.length) {
      return [
        { name: 'Stocks', value: 60000, color: '#6c5ce7' },
        { name: 'Crypto', value: 30000, color: '#3b82f6' },
        { name: 'Cash', value: 10000, color: '#22c55e' },
      ];
    }

    const totalValue = positions.reduce((sum, p) => sum + (p.value || 0), 0);

    if (totalValue === 0) {
      return [{ name: 'Cash', value: 10000, color: '#22c55e' }];
    }

    return positions.map((p, i) => ({
      name: p.symbol,
      value: p.value || 0,
      color: COLORS[i % COLORS.length],
      quantity: p.quantity,
      gain: p.gain,
      gainPercent: p.gainPercent,
    }));
  }, [positions]);

  const totalValue = allocationData.reduce((sum, d) => sum + d.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="glass rounded-xl p-4 lg:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-500/10">
          <PieChartIcon className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Asset Allocation</h3>
          <p className="text-[10px] text-white/40">Portfolio distribution by asset</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 space-y-2">
          {allocationData.map((item, i) => {
            const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-white/80">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{formatCurrency(item.value)}</p>
                  <p className="text-[10px] text-white/40">{percent.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AssetAllocation;