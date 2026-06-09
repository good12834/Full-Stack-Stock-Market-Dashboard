import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Brain,
  BarChart3,
  Zap,
  RefreshCw,
  X,
} from 'lucide-react';

// AI suggestions based on market conditions
const generateAISuggestions = () => {
  const now = Date.now();
  const suggestions = [
    {
      id: `suggestion-${now}`,
      type: 'volatility',
      icon: Activity,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      title: 'BTC volatility increasing',
      description: 'Bitcoin showing increased volatility patterns. Consider setting price range alerts to capture movements.',
      action: { symbol: 'BTC', condition: 'above', targetPrice: 120000 },
      confidence: 87,
    },
    {
      id: `suggestion-${now + 1}`,
      type: 'breakout',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      title: 'TSLA breakout likely',
      description: 'Tesla approaching resistance level with increasing volume. Breakout pattern detected.',
      action: { symbol: 'TSLA', condition: 'above', targetPrice: 280 },
      confidence: 73,
    },
    {
      id: `suggestion-${now + 2}`,
      type: 'support',
      icon: TrendingDown,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      title: 'ETH strong support detected',
      description: 'Ethereum found strong support at $3,200 level. Low risk entry opportunity.',
      action: { symbol: 'ETH', condition: 'below', targetPrice: 3200 },
      confidence: 82,
    },
    {
      id: `suggestion-${now + 3}`,
      type: 'volume',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      title: 'NVDA volume surge expected',
      description: 'NVIDIA pre-earnings volume patterns suggest major movement within 48 hours.',
      action: { symbol: 'NVDA', condition: 'percent_change', targetPercent: 5 },
      confidence: 68,
    },
    {
      id: `suggestion-${now + 4}`,
      type: 'rsi',
      icon: Zap,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      title: 'AAPL overbought territory',
      description: 'Apple RSI above 70. Historically, this precedes a short-term correction.',
      action: { symbol: 'AAPL', condition: 'rsi', rsiThreshold: 30 },
      confidence: 76,
    },
    {
      id: `suggestion-${now + 5}`,
      type: 'news',
      icon: Lightbulb,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      title: 'Market-wide alert opportunity',
      description: 'VIX showing elevated levels. Consider setting broad market alerts.',
      action: { symbol: 'SPY', condition: 'percent_change', targetPercent: -2 },
      confidence: 71,
    },
  ];

  // Shuffle and return 3 random suggestions
  return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
};

const SmartAlerts = ({ onCreateAlert }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    setSuggestions(generateAISuggestions());
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setDismissed(new Set());
    setTimeout(() => {
      setSuggestions(generateAISuggestions());
      setRefreshing(false);
    }, 1000);
  };

  const handleCreate = async (suggestion) => {
    setCreating(suggestion.id);
    const alertData = {
      symbol: suggestion.action.symbol,
      assetSymbol: suggestion.action.symbol,
      assetType: suggestion.action.symbol.length <= 5 ? 'stock' : 'crypto',
      condition: suggestion.action.condition,
      notificationType: ['email', 'push'],
      frequency: 'once',
      email: localStorage.getItem('alertEmail') || 'trader@example.com',
    };

    if (suggestion.action.targetPrice) {
      alertData.targetPrice = suggestion.action.targetPrice;
    }
    if (suggestion.action.targetPercent) {
      alertData.targetPercent = suggestion.action.targetPercent;
    }
    if (suggestion.action.rsiThreshold) {
      alertData.rsiThreshold = suggestion.action.rsiThreshold;
    }

    if (onCreateAlert) {
      await onCreateAlert(alertData);
    }

    setCreating(null);
    setDismissed((prev) => new Set([...prev, suggestion.id]));
  };

  const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Smart Alerts</h2>
            <p className="text-xs text-slate-400">
              Intelligent suggestions based on market patterns
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition"
          title="Refresh suggestions"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI-powered suggestions */}
      {visibleSuggestions.length > 0 ? (
        <div className="space-y-3">
          {visibleSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <div
                key={suggestion.id}
                className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-purple-500/30 transition-all"
              >
                {/* Glow border */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <div className="relative p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${suggestion.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${suggestion.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">
                              {suggestion.title}
                            </h3>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${suggestion.bg} ${suggestion.color}`}>
                              {suggestion.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleCreate(suggestion)}
                          disabled={creating === suggestion.id}
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {creating === suggestion.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              Apply Alert
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setDismissed((prev) => new Set([...prev, suggestion.id]))}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="hidden sm:flex flex-col items-center justify-center px-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-700"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${suggestion.confidence * 0.942} 100`}
                            className="text-purple-400"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-purple-400">
                          {suggestion.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <Brain className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No suggestions right now</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition"
          >
            Refresh for new insights
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartAlerts;