import React, { useEffect, useState } from 'react';
import { aiAPI } from '../utils/api';
import { Brain, TrendingUp, Target, Users, AlertCircle, Loader2 } from 'lucide-react';

const signalClass = (signal) => {
  const s = String(signal).toLowerCase().replace(' ', '-');
  if (s.includes('strong-buy') || s.includes('strongbuy')) return 'signal-strong-buy';
  if (s.includes('buy')) return 'signal-buy';
  if (s.includes('sell')) return 'signal-sell';
  if (s.includes('hold')) return 'signal-hold';
  return 'signal-neutral';
};

const ConfidenceBar = ({ value }) => (
  <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div
      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
      style={{
        width: `${value}%`,
        background: value > 60
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : value > 40
          ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
          : 'linear-gradient(90deg, #ef4444, #f87171)',
      }}
    />
  </div>
);

const AIInsights = ({ symbol }) => {
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    Promise.all([
      aiAPI.getInsights(symbol).catch(() => null),
      aiAPI.getPrediction(symbol).catch(() => null),
    ]).then(([insRes, predRes]) => {
      if (insRes?.data?.data) setInsights(insRes.data.data);
      if (predRes?.data?.data) setPrediction(predRes.data.data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load AI insights');
      setLoading(false);
    });
  }, [symbol]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-center gap-3 h-40">
        <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
        <span className="text-sm text-white/50">Analyzing {symbol}…</span>
      </div>
    );
  }

  if (error || (!insights && !prediction)) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-white/30 shrink-0" />
        <span className="text-sm text-white/40">AI insights unavailable for {symbol}</span>
      </div>
    );
  }

  const breakdown = insights?.breakdown ?? {};
  const totalAnalysts = (breakdown.strongBuy || 0) + (breakdown.buy || 0) + (breakdown.hold || 0) + (breakdown.sell || 0) + (breakdown.strongSell || 0);

  return (
    <div className="glass rounded-2xl p-5 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-brand-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">AI Insights</h3>
          <p className="text-[10px] text-white/40">{insights?.source || 'Rule-based analysis'}</p>
        </div>
      </div>

      {insights && (
        <>
          {/* Signal badge */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${signalClass(insights.signal)}`}>
              {insights.signal}
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-white/45 mb-1">
                <span>Confidence</span>
                <span>{insights.confidence}%</span>
              </div>
              <ConfidenceBar value={insights.confidence} />
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-white/65 leading-relaxed">{insights.reason}</p>

          {/* AI text analysis */}
          {insights.aiAnalysis && (
            <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl p-3">
              <p className="text-xs text-white/70 leading-relaxed italic">"{insights.aiAnalysis}"</p>
            </div>
          )}

          {/* Price targets */}
          {insights.priceTarget?.mean && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Target Low', val: insights.priceTarget.low, color: 'text-red-400' },
                { label: 'Target Mean', val: insights.priceTarget.mean, color: 'text-white/85' },
                { label: 'Target High', val: insights.priceTarget.high, color: 'text-emerald-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="glass rounded-xl p-2 text-center">
                  <div className="text-[10px] text-white/40 mb-0.5">{label}</div>
                  <div className={`text-sm font-bold tabular-nums ${color}`}>
                    {val ? `$${val.toFixed(2)}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upside */}
          {insights.priceTarget?.upside != null && (
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-white/35" />
              <span className="text-xs text-white/55">
                Price target implies{' '}
                <span className={`font-semibold ${insights.priceTarget.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {insights.priceTarget.upside >= 0 ? '+' : ''}{insights.priceTarget.upside}% upside
                </span>
              </span>
            </div>
          )}

          {/* Analyst breakdown */}
          {totalAnalysts > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-white/35" />
                <span className="text-[10px] text-white/45">{totalAnalysts} Analyst Ratings</span>
              </div>
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                {[
                  { val: breakdown.strongBuy, color: '#10b981' },
                  { val: breakdown.buy, color: '#34d399' },
                  { val: breakdown.hold, color: '#fbbf24' },
                  { val: breakdown.sell, color: '#f87171' },
                  { val: breakdown.strongSell, color: '#ef4444' },
                ].map(({ val, color }, i) => val > 0 && (
                  <div
                    key={i}
                    style={{ width: `${(val / totalAnalysts) * 100}%`, background: color }}
                    title={`${val}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-white/35 mt-1">
                <span>Strong Buy ({breakdown.strongBuy || 0})</span>
                <span>Hold ({breakdown.hold || 0})</span>
                <span>Strong Sell ({breakdown.strongSell || 0})</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Price prediction */}
      {prediction && (
        <div className="border-t border-white/[0.05] pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-brand-300" />
            <span className="text-xs font-semibold text-white/70">ML Price Prediction</span>
            <span className="text-[10px] text-white/30 ml-auto">{prediction.method}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '7-Day Forecast', val: prediction.predictions?.['7d'], change: prediction.change?.['7d'] },
              { label: '30-Day Forecast', val: prediction.predictions?.['30d'], change: prediction.change?.['30d'] },
            ].map(({ label, val, change }) => (
              <div key={label} className="glass rounded-xl p-3">
                <div className="text-[10px] text-white/40 mb-1">{label}</div>
                <div className="text-base font-bold tabular-nums text-white/90">${val?.toFixed(2) ?? '—'}</div>
                {change != null && (
                  <div className={`text-[10px] font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${prediction.trend === 'UPWARD' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {prediction.trend}
            </span>
            <span className="text-[10px] text-white/35">
              {prediction.confidence?.toFixed(0)}% confidence · volatility σ{prediction.volatility?.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
