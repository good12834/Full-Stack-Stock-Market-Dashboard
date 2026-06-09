import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Zap, BarChart3 } from 'lucide-react';

const AIInsights = ({ coins = [] }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const mockInsights = generateInsights(coins);
      setInsights(mockInsights);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [coins, selectedCoin]);

  const generateInsights = (coinsData) => {
    const btc = coinsData.find(c => c.symbol === 'BTC');
    const selected = coinsData.find(c => c.symbol === selectedCoin);

    return [
      {
        type: 'bullish',
        icon: <TrendingUp className="w-4 h-4" />,
        title: `${selectedCoin} Bullish Momentum`,
        description: selected?.price_change_percentage_24h > 0
          ? `Strong upward momentum detected. Price up ${Math.abs(selected.price_change_percentage_24h).toFixed(1)}% in 24h with above-average volume.`
          : `Consolidation phase with potential breakout. Support levels holding steady.`,
        confidence: selected?.price_change_percentage_24h > 0 ? 87 : 65,
        color: 'green',
      },
      {
        type: 'technical',
        icon: <BarChart3 className="w-4 h-4" />,
        title: 'Technical Analysis',
        description: selected?.price_change_percentage_24h > 5
          ? 'RSI indicates overbought conditions. Consider taking partial profits.'
          : selected?.price_change_percentage_24h < -5
          ? 'RSI approaching oversold territory. Potential bounce opportunity.'
          : 'Moving averages showing neutral alignment. Wait for clearer signal.',
        confidence: 72,
        color: 'blue',
      },
      {
        type: 'market',
        icon: <Zap className="w-4 h-4" />,
        title: 'Market Sentiment',
        description: btc?.price_change_percentage_24h > 0
          ? `Bitcoin leading the market with ${Math.abs(btc.price_change_percentage_24h).toFixed(1)}% gain. Altcoin season index rising.`
          : `Bitcoin dominance increasing. Risk-off sentiment across altcoins.`,
        confidence: 81,
        color: 'purple',
      },
      {
        type: 'prediction',
        icon: <Brain className="w-4 h-4" />,
        title: 'AI Price Prediction',
        description: `Model predicts ${selectedCoin} to ${selected?.price_change_percentage_24h > 0 ? 'continue upward trend' : 'recover from recent dip'} over the next 7 days.`,
        confidence: 59,
        color: 'orange',
      },
    ];
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'green': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
      case 'blue': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
      case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
      case 'orange': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
      default: return { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' };
    }
  };

  const uniqueSymbols = [...new Set(coins.map(c => c.symbol))].slice(0, 10);

  return (
    <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500/20 to-blue-500/20 text-brand-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Market Insights</span>
              <p className="text-[10px] text-slate-400">Powered by machine learning analysis</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-[9px] font-medium uppercase tracking-wider ${
            loading ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {loading ? 'Analyzing...' : 'Live'}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide">
          {uniqueSymbols.map(sym => (
            <button
              key={sym}
              onClick={() => setSelectedCoin(sym)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedCoin === sym
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : (
          insights.map((insight, i) => {
            const colors = getColorClasses(insight.color);
            return (
              <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {insight.title}
                      </h4>
                      {insight.confidence && (
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium ${colors.bg} ${colors.text}`}>
                          {insight.confidence}% conf
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/50 text-center">
        <span className="text-[10px] text-slate-400">
          AI predictions are for informational purposes only. Not financial advice.
        </span>
      </div>
    </div>
  );
};

export default AIInsights;