import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  RefreshCw,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  HardDrive,
  Cpu,
  Clock,
  AlertCircle,
  Zap,
  Bell,
  Bookmark,
  Briefcase,
  Layers,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import MiniLineChart from '../components/admin/MiniLineChart';

const PIE_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#ec4899', // pink
];

const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return Number(n).toLocaleString();
};

const formatUptime = (sec) => {
  if (!sec && sec !== 0) return '—';
  const s = Math.floor(sec);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// -------- Sub-components --------

const KpiCard = ({ icon: Icon, label, value, sublabel, accent = 'indigo', loading = false }) => {
  const accentClasses = {
    indigo: 'from-indigo-500 to-blue-500',
    green: 'from-emerald-500 to-green-500',
    red: 'from-rose-500 to-red-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    cyan: 'from-cyan-500 to-teal-500',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </div>
          {loading ? (
            <div className="mt-2 h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {value}
            </div>
          )}
          {sublabel && !loading && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sublabel}</div>
          )}
        </div>
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${accentClasses[accent]} text-white shadow-sm`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const DonutChart = ({ data = [], size = 180, thickness = 22 }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const length = (d.value / total) * circumference;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${length} ${circumference}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return seg;
        })}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="currentColor"
        >
          {total}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          opacity="0.6"
        >
          total
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm min-w-0">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-slate-700 dark:text-slate-300">{d.label}</span>
            <span className="ml-auto text-slate-500 dark:text-slate-400 tabular-nums">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BarRow = ({ label, value, max, color = 'bg-indigo-500' }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">
          {value > 0 ? '+' : ''}
          {value.toFixed(2)}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${value >= 0 ? color : 'bg-red-500'} rounded-full transition-all`}
          style={{ width: `${Math.min(100, Math.abs(pct))}%` }}
        />
      </div>
    </div>
  );
};

const StatusPill = ({ ok, label }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
      ok
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-500'}`} />
    {label}
  </span>
);

// -------- Page --------

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(60);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, timeseries, system, usage, sectors] = await Promise.all([
        adminAPI.getOverview().then((r) => r.data.data).catch(() => null),
        adminAPI.getTimeseries(range).then((r) => r.data.data).catch(() => null),
        adminAPI.getSystem().then((r) => r.data.data).catch(() => null),
        adminAPI.getUsage().then((r) => r.data.data).catch(() => null),
        adminAPI.getSectors().then((r) => r.data.data).catch(() => []),
      ]);
      setData({ overview, timeseries, system, usage, sectors });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const seriesData = useMemo(() => {
    const s = data?.timeseries?.series || [];
    return s.map((p) => ({ value: p.requests, label: p.label }));
  }, [data]);

  const sectorDonut = useMemo(() => {
    const s = data?.sectors || [];
    const total = s.reduce((acc, x) => acc + x.count, 0) || 1;
    return s
      .slice(0, 7)
      .map((x, i) => ({
        label: x.sector,
        value: x.count,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }))
      .concat(
        s.length > 7
          ? [
              {
                label: 'Other',
                value: s.slice(7).reduce((acc, x) => acc + x.count, 0),
                color: PIE_COLORS[PIE_COLORS.length - 1],
              },
            ]
          : []
      );
  }, [data]);

  const movers = data?.overview?.topGainers?.length || data?.overview?.topLosers?.length;
  const totalAdvDecl = (data?.overview?.advancers || 0) + (data?.overview?.decliners || 0);
  const advancersPct = totalAdvDecl > 0
    ? (data.overview.advancers / totalAdvDecl) * 100
    : 50;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('admin.title', 'Admin Analytics')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('admin.subtitle', 'Platform usage, system health, and market overview')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchAll}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-sm">
                  {t('admin.refresh', 'Refresh')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 p-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Layers}
            label={t('admin.kpi.symbols', 'Tracked Symbols')}
            value={formatNumber(data?.overview?.totalSymbols)}
            accent="indigo"
            loading={loading && !data}
          />
          <KpiCard
            icon={TrendingUp}
            label={t('admin.kpi.advancers', 'Advancers')}
            value={formatNumber(data?.overview?.advancers)}
            sublabel={
              data?.overview
                ? `${advancersPct.toFixed(0)}% ${t('admin.ofMovers', 'of movers')}`
                : ''
            }
            accent="green"
            loading={loading && !data}
          />
          <KpiCard
            icon={TrendingDown}
            label={t('admin.kpi.decliners', 'Decliners')}
            value={formatNumber(data?.overview?.decliners)}
            sublabel={
              data?.overview
                ? `${(100 - advancersPct).toFixed(0)}% ${t('admin.ofMovers', 'of movers')}`
                : ''
            }
            accent="red"
            loading={loading && !data}
          />
          <KpiCard
            icon={Activity}
            label={t('admin.kpi.avgChange', 'Avg % Change')}
            value={
              data?.overview?.avgChange !== undefined
                ? `${data.overview.avgChange >= 0 ? '+' : ''}${data.overview.avgChange.toFixed(2)}%`
                : '—'
            }
            accent="amber"
            loading={loading && !data}
          />
        </div>

        {/* Usage / Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label={t('admin.kpi.users', 'Users')}
            value={formatNumber(data?.usage?.users)}
            accent="purple"
            loading={loading && !data}
          />
          <KpiCard
            icon={Briefcase}
            label={t('admin.kpi.portfolios', 'Portfolios')}
            value={formatNumber(data?.usage?.portfolios)}
            accent="indigo"
            loading={loading && !data}
          />
          <KpiCard
            icon={Bookmark}
            label={t('admin.kpi.watchlists', 'Watchlists')}
            value={formatNumber(data?.usage?.watchlist)}
            accent="cyan"
            loading={loading && !data}
          />
          <KpiCard
            icon={Bell}
            label={t('admin.kpi.alerts', 'Price Alerts')}
            value={formatNumber(data?.usage?.alerts)}
            accent="amber"
            loading={loading && !data}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Request time series */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  {t('admin.requests.title', 'Request Volume')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('admin.requests.subtitle', 'Per-minute request count over the selected window')}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-0.5">
                {[15, 30, 60, 120].map((m) => (
                  <button
                    key={m}
                    onClick={() => setRange(m)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      range === m
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-700 dark:text-slate-300">
              <MiniLineChart
                data={seriesData}
                width={760}
                height={220}
                stroke="#6366f1"
                yLabel={t('admin.requests.label', 'Requests / min')}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {t('admin.requests.total', 'Total requests in window')}:{' '}
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatNumber(data?.timeseries?.totalRequests || 0)}
                </span>
              </span>
              <span>
                {t('admin.requests.peak', 'Peak')}:{' '}
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {seriesData.length > 0
                    ? formatNumber(Math.max(...seriesData.map((d) => d.value)))
                    : '—'}
                </span>
              </span>
            </div>
          </div>

          {/* Sector donut */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                {t('admin.sectors.title', 'Symbols by Sector')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('admin.sectors.subtitle', 'Distribution of tracked tickers')}
              </p>
            </div>
            {sectorDonut.length > 0 ? (
              <DonutChart data={sectorDonut} size={170} thickness={20} />
            ) : (
              <div className="h-44 flex items-center justify-center text-sm text-slate-400">
                {t('admin.sectors.empty', 'No sector data available')}
              </div>
            )}
          </div>
        </div>

        {/* Movers + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top gainers */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              {t('admin.movers.gainers', 'Top Gainers')}
            </h2>
            <div className="space-y-2.5">
              {(data?.overview?.topGainers || []).map((g) => {
                const max = Math.max(
                  ...(data?.overview?.topGainers || []).map((x) => Math.abs(x.changePercent || 0)),
                  0.01
                );
                return (
                  <div key={g.symbol}>
                    <BarRow
                      label={
                        <Link
                          to={`/stock/${g.symbol}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span className="font-semibold">{g.symbol}</span>
                          <span className="ml-1 text-slate-500 dark:text-slate-400 font-normal">
                            {g.name}
                          </span>
                        </Link>
                      }
                      value={g.changePercent || 0}
                      max={max}
                      color="bg-emerald-500"
                    />
                  </div>
                );
              })}
              {(!data?.overview?.topGainers || data.overview.topGainers.length === 0) && (
                <div className="text-sm text-slate-400 py-4 text-center">
                  {t('admin.movers.empty', 'No data')}
                </div>
              )}
            </div>
          </div>

          {/* Top losers */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-500" />
              {t('admin.movers.losers', 'Top Losers')}
            </h2>
            <div className="space-y-2.5">
              {(data?.overview?.topLosers || []).map((g) => {
                const max = Math.max(
                  ...(data?.overview?.topLosers || []).map((x) => Math.abs(x.changePercent || 0)),
                  0.01
                );
                return (
                  <div key={g.symbol}>
                    <BarRow
                      label={
                        <Link
                          to={`/stock/${g.symbol}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span className="font-semibold">{g.symbol}</span>
                          <span className="ml-1 text-slate-500 dark:text-slate-400 font-normal">
                            {g.name}
                          </span>
                        </Link>
                      }
                      value={g.changePercent || 0}
                      max={max}
                      color="bg-emerald-500"
                    />
                  </div>
                );
              })}
              {(!data?.overview?.topLosers || data.overview.topLosers.length === 0) && (
                <div className="text-sm text-slate-400 py-4 text-center">
                  {t('admin.movers.empty', 'No data')}
                </div>
              )}
            </div>
          </div>

          {/* System health */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-indigo-500" />
              {t('admin.system.title', 'System Health')}
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Database className="w-4 h-4 text-slate-400" />
                  {t('admin.system.database', 'Database')}
                </span>
                <StatusPill
                  ok={data?.system?.database?.connected}
                  label={data?.system?.database?.state || '—'}
                />
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  {t('admin.system.cache', 'Cache')}
                </span>
                <StatusPill
                  ok={data?.system?.cache?.available}
                  label={data?.system?.cache?.backend || '—'}
                />
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Cpu className="w-4 h-4 text-slate-400" />
                  {t('admin.system.memory', 'Heap')}
                </span>
                <span className="tabular-nums text-slate-700 dark:text-slate-300">
                  {data?.system?.process?.heapUsed ?? '—'} / {data?.system?.process?.heapTotal ?? '—'} MB
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Activity className="w-4 h-4 text-slate-400" />
                  {t('admin.system.uptime', 'Uptime')}
                </span>
                <span className="tabular-nums text-slate-700 dark:text-slate-300">
                  {formatUptime(data?.system?.process?.uptimeSec)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Server className="w-4 h-4 text-slate-400" />
                  {t('admin.system.platform', 'Platform')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {data?.system?.process?.platform || '—'} · {data?.system?.process?.nodeVersion || '—'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4 pb-2">
          {t('admin.footer', 'Data refreshes automatically every 30 seconds.')}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
