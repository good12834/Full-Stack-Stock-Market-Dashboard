import React from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Zap,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const CONDITION_ICONS = {
  above: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  below: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' },
  percent_change: { icon: Percent, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  volume_spike: { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  rsi: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

const AlertHistory = ({ history = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-800/30 rounded-xl border border-slate-700/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Alert History</h2>
          <p className="text-xs text-slate-400">
            {history.length} triggered alerts recorded
          </p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map((item, index) => {
            const config = CONDITION_ICONS[item.condition] || CONDITION_ICONS.above;
            const Icon = config.icon;
            const isPriceUp =
              item.currentPrice && item.targetPrice
                ? Number(item.currentPrice) >= Number(item.targetPrice)
                : null;

            return (
              <div
                key={item.alertId || index}
                className="group flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-700/30 transition cursor-default"
              >
                {/* Timeline dot */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-px flex-1 bg-slate-700/50 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {item.assetSymbol}
                        </span>
                        {item.currentPrice && (
                          <span className={`text-sm font-semibold ${
                            isPriceUp === true
                              ? 'text-green-400'
                              : isPriceUp === false
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}>
                            ${Number(item.currentPrice).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mt-0.5">
                        {item.message}
                      </p>
                    </div>

                    {/* Method badges */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {Array.isArray(item.method) &&
                        item.method.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500"
                          >
                            {m}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-500">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : ''}
                    </span>
                    {item.targetPrice && (
                      <>
                        <span className="text-slate-700">|</span>
                        <span className="text-[10px] text-slate-500">
                          Target: ${Number(item.targetPrice).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">
            No triggered alerts yet
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Alert history will appear here when your price conditions are met
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertHistory;