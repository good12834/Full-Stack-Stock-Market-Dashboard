import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Shield, BarChart3, Target } from 'lucide-react';

const insightsGenerators = [
  {
    icon: Shield,
    title: 'Portfolio Diversification',
    color: 'bg-blue-500/10 text-blue-400',
    generate: (positions, totalValue) => {
      if (!positions?.length) return { description: 'Add assets to your portfolio to receive diversification analysis.', confidence: 0 };
      const stockCount = positions.filter(p => !['BTC', 'ETH', 'SOL'].includes(p.symbol)).length;
      const cryptoCount = positions.filter(p => ['BTC', 'ETH', 'SOL'].includes(p.symbol)).length;
      const isDiversified = stockCount > 2 && (cryptoCount > 0 || positions.length > 3);
      return {
        description: isDiversified
          ? `Your portfolio has ${positions.length} assets across ${stockCount > 0 ? 'stocks' : ''}${stockCount > 0 && cryptoCount > 0 ? ' and ' : ''}${cryptoCount > 0 ? 'crypto' : ''}. Consider adding more sectors for better risk management.`
          : 'Your portfolio is concentrated in few assets. Consider diversifying across different sectors and asset classes to reduce risk.',
        confidence: isDiversified ? 78 : 92,
      };
    },
  },
  {
    icon: TrendingUp,
    title: 'Top Performer',
    color: 'bg-green-500/10 text-green-400',
    generate: (positions) => {
      if (!positions?.length) return { description: 'No positions to analyze.', confidence: 0 };
      const best = positions.reduce((a, b) => ((a.gainPercent || 0) > (b.gainPercent || 0) ? a : b));
      return {
        description: best.gainPercent > 0
          ? `${best.symbol} is your best performer with ${best.gainPercent?.toFixed(1)}% gain. Consider setting trailing stop-loss to protect profits.`
          : `${best.symbol} is your least worst performer at ${best.gainPercent?.toFixed(1)}%. Monitor market conditions before adding more.`,
        confidence: 85,
      };
    },
  },
  {
    icon: AlertTriangle,
    title: 'Risk Warning',
    color: 'bg-orange-500/10 text-orange-400',
    generate: (positions) => {
      if (!positions?.length) return { description: 'No risk assessment available without positions.', confidence: 0 };
      const losers = positions.filter(p => (p.gainPercent || 0) < -10);
      if (losers.length > 0) {
        return {
          description: `${losers.length} position${losers.length > 1 ? 's are' : ' is'} down more than 10%: ${losers.map(p => p.symbol).join(', ')}. Consider reviewing your thesis or setting tighter stop losses.`,
          confidence: 88,
        };
      }
      return {
        description: 'No major risk flags detected. Your positions are within acceptable drawdown thresholds.',
        confidence: 72,
      };
    },
  },
  {
    icon: Lightbulb,
    title: 'Smart Suggestion',
    color: 'bg-purple-500/10 text-purple-400',
    generate: (positions, totalValue, availableBalance) => {
      if (availableBalance > 5000) {
        return {
          description: `You have ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(availableBalance)} available. Consider dollar-cost averaging into your existing positions or exploring new sectors like tech or healthcare.`,
          confidence: 75,
        };
      }
      if (positions?.length < 3) {
        return {
          description: 'Building a portfolio with 3-5 diverse assets can help reduce volatility while maintaining growth potential.',
          confidence: 82,
        };
      }
      return {
        description: 'Consider rebalancing your portfolio quarterly to maintain your target asset allocation and manage risk.',
        confidence: 70,
      };
    },
  },
  {
    icon: BarChart3,
    title: 'Market Context',
    color: 'bg-cyan-500/10 text-cyan-400',
    generate: (positions) => {
      if (!positions?.length) return { description: 'Start investing to get market context for your portfolio.', confidence: 0 };
      const gainers = positions.filter(p => (p.gainPercent || 0) > 0).length;
      const ratio = positions.length > 0 ? (gainers / positions.length * 100) : 0;
      return {
        description: ratio > 60
          ? `${ratio.toFixed(0)}% of your holdings are profitable. Strong market alignment. Consider taking some profits on highly appreciated positions.`
          : `${ratio.toFixed(0)}% of your holdings are in profit. Market conditions may be challenging. Focus on quality assets with strong fundamentals.`,
        confidence: 65,
      };
    },
  },
];

const PortfolioInsights = ({ positions = [], totalValue = 0, availableBalance = 0 }) => {
  const insights = useMemo(() => {
    return insightsGenerators.map((gen, i) => {
      const result = gen.generate(positions, totalValue, availableBalance);
      return {
        ...gen,
        ...result,
        id: i,
      };
    });
  }, [positions, totalValue, availableBalance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10">
            <Brain className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Portfolio Insights</h3>
            <p className="text-[10px] text-white/40">Intelligent analysis and recommendations</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {insights.map((insight) => {
          const Icon = insight.icon;
          if (!insight.confidence) return null;
          return (
            <div key={insight.id} className="p-4 lg:p-5 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${insight.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium ${insight.color}`}>
                      {insight.confidence}% conf
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/5 text-center">
        <span className="text-[10px] text-white/30">
          AI insights are for informational purposes only. Not financial advice.
        </span>
      </div>
    </motion.div>
  );
};

export default PortfolioInsights;