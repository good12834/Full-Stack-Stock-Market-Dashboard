import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Globe, Activity, AlertTriangle, DollarSign, Shield, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCryptoImage, getFallbackImage } from '../../utils/cryptoImages';

const StatCard = ({ icon, label, value, change, isLoading }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-4 transition-all duration-200 hover:border-brand-500/30">
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              {icon}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          {change !== undefined && change !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

const FearGreedGauge = ({ value, classification }) => {
  const getColor = (val) => {
    if (val <= 25) return '#ef4444';
    if (val <= 45) return '#f97316';
    if (val <= 55) return '#eab308';
    if (val <= 75) return '#22c55e';
    return '#16a34a';
  };

  const rotation = ((value || 50) / 100) * 180 - 90;
  const color = getColor(value || 50);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="80" height="52" viewBox="0 0 80 52" className="overflow-visible">
        <path
          d="M 5 45 A 35 35 0 0 1 75 45"
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 5 45 A 35 35 0 0 1 75 45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 108.5} 108.5`}
          className="transition-all duration-1000 ease-out"
        />
        <line
          x1="40"
          y1="45"
          x2={40 + 28 * Math.cos((rotation * Math.PI) / 180)}
          y2={45 + 28 * Math.sin((rotation * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <circle cx="40" cy="45" r="3.5" fill={color} />
      </svg>
      <div className="text-center mt-1">
        <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
          {classification || 'N/A'}
        </div>
      </div>
    </div>
  );
};

const MarketOverview = () => {
  const [globalData, setGlobalData] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [globalRes, fgRes, trendingRes] = await Promise.all([
          fetch('/api/crypto/global'),
          fetch('/api/crypto/fear-greed'),
          fetch('/api/crypto/trending'),
        ]);

        const global = await globalRes.json();
        const fg = await fgRes.json();
        const trend = await trendingRes.json();

        if (global.success) setGlobalData(global.data);
        if (fg.success && fg.data?.length > 0) setFearGreed(fg.data[0]);
        if (trend.success) setTrending(trend.data.slice(0, 5));
      } catch (err) {
        console.error('MarketOverview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatLargeNumber = (num) => {
    if (!num) return '$0';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${(num).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Market Cap"
          value={formatLargeNumber(globalData?.total_market_cap)}
          change={globalData?.market_cap_change_percentage_24h_usd}
          isLoading={loading}
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="24h Volume"
          value={formatLargeNumber(globalData?.total_volume)}
          isLoading={loading}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="BTC Dominance"
          value={globalData?.btc_dominance ? `${globalData.btc_dominance.toFixed(1)}%` : '—'}
          isLoading={loading}
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="ETH Dominance"
          value={globalData?.eth_dominance ? `${globalData.eth_dominance.toFixed(1)}%` : '—'}
          isLoading={loading}
        />
        <StatCard
          icon={<Globe className="w-4 h-4" />}
          label="Active Coins"
          value={globalData?.active_cryptocurrencies?.toLocaleString() || '—'}
          isLoading={loading}
        />
      </div>

      {/* Fear & Greed + Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fear & Greed Index */}
        <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Fear & Greed Index</span>
            </div>
            {fearGreed && (
              <span className="text-[10px] text-slate-400">
                {new Date(parseInt(fearGreed.timestamp) * 1000).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex justify-center">
            {loading ? (
              <div className="h-[80px] w-[80px] animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full" />
            ) : (
              <FearGreedGauge
                value={parseInt(fearGreed?.value) || 50}
                classification={fearGreed?.value_classification || 'Neutral'}
              />
            )}
          </div>
        </div>

        {/* Trending Coins */}
        <div className="lg:col-span-2 bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Trending Coins</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-2" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 mx-auto rounded" />
                  </div>
                ))
              : trending.map((coin) => (
                  <div
                    key={coin.id}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <img
                      src={coin.image || getCryptoImage(coin.symbol)}
                      alt={coin.name}
                      className="w-9 h-9 rounded-full mb-1.5 group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getFallbackImage(coin.symbol, '8b5cf6', 36);
                      }}
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-full">
                      {coin.symbol?.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">#{coin.market_cap_rank || '—'}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;