import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const SummaryCard = ({ icon: Icon, label, value, change, isPositive, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass glass-hover rounded-xl p-4 lg:p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-medium ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercent(Math.abs(change))}
        </span>
      )}
    </div>
    <p className="text-xs text-white/50 mb-1">{label}</p>
    <p className="text-xl lg:text-2xl font-bold text-white tabular-nums">{value}</p>
  </motion.div>
);

const PortfolioSummary = ({ portfolio = {} }) => {
  const {
    totalValue = 0,
    totalInvested = 0,
    totalGain = 0,
    totalGainPercent = 0,
    dailyChange = 0,
    dailyChangePercent = 0,
    availableBalance = 0,
  } = portfolio;

  const isDailyPositive = dailyChange >= 0;
  const isTotalPositive = totalGain >= 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Portfolio</h1>
        <p className="text-sm text-white/50 mt-1">Track your investments, performance, and portfolio analytics</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          change={totalGainPercent}
          isPositive={isTotalPositive}
          color="bg-blue-500/10 text-blue-400"
          delay={0}
        />
        <SummaryCard
          icon={Activity}
          label="Today's P&L"
          value={formatCurrency(dailyChange)}
          change={dailyChangePercent}
          isPositive={isDailyPositive}
          color={isDailyPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}
          delay={0.1}
        />
        <SummaryCard
          icon={BarChart3}
          label="Total Gain/Loss"
          value={formatCurrency(totalGain)}
          change={totalGainPercent}
          isPositive={isTotalPositive}
          color={isTotalPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}
          delay={0.2}
        />
        <SummaryCard
          icon={Wallet}
          label="Available Balance"
          value={formatCurrency(availableBalance)}
          color="bg-purple-500/10 text-purple-400"
          delay={0.3}
        />
      </div>
    </div>
  );
};

export default PortfolioSummary;