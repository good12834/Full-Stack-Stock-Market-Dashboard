import React from 'react';
import {
  BarChart3,
  Bell,
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  LineChart,
} from 'lucide-react';

const CONDITION_LABELS = {
  above: { label: 'Price Above', color: 'text-green-400', bg: 'bg-green-500/10', icon: TrendingUp },
  below: { label: 'Price Below', color: 'text-red-400', bg: 'bg-red-500/10', icon: TrendingDown },
  percent_change: { label: '% Change', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Percent },
  volume_spike: { label: 'Volume Spike', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Activity },
  rsi: { label: 'RSI Alert', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Zap },
};

const AlertAnalytics = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-800/30 rounded-xl border border-slate-700/30 animate-pulse" />
        ))}
      </div>
    );
  }

  const byCondition = analytics.byCondition || {};

  const kpiCards = [
    {
      label: 'Total Alerts',
      value: analytics.totalAlerts || 0,
      icon: Bell,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Active Now',
      value: analytics.activeAlerts || 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Triggered Today',
      value: analytics.triggeredToday || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Success Rate',
      value: analytics.successRate || '0%',
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Alert Analytics</h2>
          <p className="text-xs text-slate-400">
            Most watched: {analytics.mostWatched || 'N/A'}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-xl bg-slate-800/50 border ${card.border} hover:bg-slate-700/50 transition`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* By condition breakdown */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <LineChart className="w-4 h-4 text-slate-400" />
          By Alert Condition
        </h3>
        <div className="space-y-2">
          {Object.entries(CONDITION_LABELS).map(([key, config]) => {
            const Icon = config.icon;
            const count = byCondition[key] || 0;
            const total = Object.values(byCondition).reduce((a, b) => a + b, 0) || 1;
            const percentage = ((count / total) * 100).toFixed(0);
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{config.label}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${config.bg.replace('/10', '/30')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total triggered */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Triggered</p>
              <p className="text-xl font-bold text-white">{analytics.totalTriggered || 0}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Most Watched</p>
            <p className="text-lg font-bold text-brand-400">{analytics.mostWatched || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertAnalytics;