import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Zap,
  Bell,
  BellOff,
  Trash2,
  Edit2,
  Clock,
  Mail,
  Smartphone,
  Globe,
  BellRing,
  MessageCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const CONDITION_CONFIG = {
  above: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Above' },
  below: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Below' },
  percent_change: { icon: Percent, color: 'text-blue-500', bg: 'bg-blue-500/10', label: '% Change' },
  volume_spike: { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Volume' },
  rsi: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'RSI' },
};

const NOTIFICATION_ICONS = {
  email: Mail,
  push: BellRing,
  sms: Smartphone,
  browser: Globe,
  telegram: MessageCircle,
};

const AlertCard = ({ alert, onDelete, onToggle, showActions = true }) => {
  const config = CONDITION_CONFIG[alert.condition] || CONDITION_CONFIG.above;
  const Icon = config.icon;
  const isActive = alert.isActive !== false;

  const formatTarget = () => {
    if (alert.targetPrice) {
      return `$${Number(alert.targetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (alert.targetPercent) {
      const val = Number(alert.targetPercent);
      return `${val > 0 ? '+' : ''}${val}%`;
    }
    if (alert.rsiThreshold) {
      return `RSI ${alert.rsiThreshold}`;
    }
    if (alert.volumeMultiplier) {
      return `${alert.volumeMultiplier}x volume`;
    }
    return '';
  };

  const formatCurrentPrice = () => {
    if (alert.currentPrice) {
      return `$${Number(alert.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '—';
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 ${
        isActive
          ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/40'
          : 'bg-slate-800/20 border-slate-700/30 opacity-60'
      }`}
    >
      {/* Glow effect for triggered alerts */}
      {alert.isTriggered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Condition icon */}
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            {/* Alert details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Symbol */}
                <span className="font-bold text-sm text-white">{alert.assetSymbol || alert.symbol}</span>
                
                {/* Condition label */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                  {config.label}
                </span>

                {/* Status badge */}
                {alert.isTriggered ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Triggered
                  </span>
                ) : isActive ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 flex items-center gap-1">
                    <BellOff className="w-3 h-3" />
                    Paused
                  </span>
                )}
              </div>

              {/* Target info */}
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {alert.condition === 'above' && `> `}
                  {alert.condition === 'below' && `< `}
                  {formatTarget()}
                </span>
                {alert.currentPrice && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-xs text-slate-400">
                      Current: {formatCurrentPrice()}
                    </span>
                    {alert.currentChange !== undefined && alert.currentChange !== null && (
                      <span className={`text-xs ${Number(alert.currentChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Number(alert.currentChange) >= 0 ? '+' : ''}{Number(alert.currentChange).toFixed(2)}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Meta info */}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                {/* Notification methods */}
                <span className="flex items-center gap-1">
                  {Array.isArray(alert.notificationType) &&
                    alert.notificationType.map((method) => {
                      const NIcon = NOTIFICATION_ICONS[method];
                      return NIcon ? <NIcon key={method} className="w-3 h-3" /> : null;
                    })}
                  {alert.email && <span className="ml-1">{alert.email}</span>}
                </span>

                {/* Frequency */}
                {alert.frequency && alert.frequency !== 'once' && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.frequency.replace(/_/g, ' ')}
                  </span>
                )}

                {/* Trigger count */}
                {alert.triggeredCount > 0 && (
                  <span className="text-green-400/70">
                    Triggered {alert.triggeredCount}x
                  </span>
                )}

                {/* Created date */}
                <span>
                  {alert.createdAt
                    ? new Date(alert.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Toggle active */}
              <button
                onClick={() => onToggle?.(alert._id || alert.id, !isActive)}
                className={`p-2 rounded-lg transition ${
                  isActive
                    ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                    : 'text-slate-600 hover:text-green-400 hover:bg-green-500/10'
                }`}
                title={isActive ? 'Pause alert' : 'Activate alert'}
              >
                {isActive ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete?.(alert._id || alert.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Delete alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;