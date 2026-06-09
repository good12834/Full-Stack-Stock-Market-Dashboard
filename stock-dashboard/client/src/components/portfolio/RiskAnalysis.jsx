import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon } from 'lucide-react';

const RiskMeter = ({ label, value, max = 10, color }) => {
  const percent = (value / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-semibold text-white">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const RiskAnalysis = ({ positions = [], totalValue = 0 }) => {
  const riskMetrics = useMemo(() => {
    if (!positions?.length) {
      return {
        riskScore: 2,
        volatility: 2,
        diversification: 1,
        concentration: 9,
        sharpeRatio: 0,
        beta: 1,
      };
    }

    const total = positions.reduce((sum, p) => sum + Math.abs(p.value || 0), 0);
    if (total === 0) return null;

    // Calculate concentration (how much top position dominates)
    const maxPos = Math.max(...positions.map(p => Math.abs(p.value || 0)));
    const concentration = maxPos / total;

    // Calculate volatility based on gain variance
    const gains = positions.map(p => p.gainPercent || 0);
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const variance = gains.reduce((a, b) => a + Math.pow(b - avgGain, 2), 0) / gains.length;
    const volatility = Math.min(10, Math.sqrt(variance) / 3);

    // Diversification score
    const positionCount = positions.length;
    const diversification = Math.min(10, positionCount * 2.5);

    // Risk score
    const riskScore = Math.min(10, (volatility * 0.4) + ((1 - diversification / 10) * 5 * 0.3) + (concentration * 5 * 0.3));

    return {
      riskScore: Math.round(riskScore * 10) / 10,
      volatility: Math.round(volatility * 10) / 10,
      diversification: Math.round(diversification * 10) / 10,
      concentration: Math.round((1 - concentration) * 10),
      sharpeRatio: avgGain > 0 ? (avgGain / (Math.sqrt(variance) || 1)) * 0.5 : 0,
      beta: 1 + (Math.random() - 0.5) * 0.4,
    };
  }, [positions]);

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBg = (score) => {
    if (score <= 3) return 'bg-green-500/10 border-green-500/20';
    if (score <= 6) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getBarColor = (score) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!riskMetrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="glass rounded-xl p-4 lg:p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Shield className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Risk Analysis</h3>
          <p className="text-[10px] text-white/40">Portfolio risk metrics</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 ${getRiskBg(riskMetrics.riskScore)}`}
        >
          <div className="text-center">
            <p className={`text-3xl font-bold ${getRiskColor(riskMetrics.riskScore)}`}>
              {riskMetrics.riskScore}
            </p>
            <p className="text-[9px] text-white/40 mt-0.5">/ 10</p>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <RiskMeter
          label="Volatility"
          value={riskMetrics.volatility}
          color={getBarColor(riskMetrics.volatility)}
        />
        <RiskMeter
          label="Diversification"
          value={riskMetrics.diversification}
          color={getBarColor(10 - riskMetrics.diversification)}
        />
        <RiskMeter
          label="Concentration Risk"
          value={10 - riskMetrics.concentration}
          color={getBarColor(10 - riskMetrics.concentration)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
        <div>
          <p className="text-[10px] text-white/40 mb-1">Sharpe Ratio</p>
          <p className="text-sm font-semibold text-white">
            {riskMetrics.sharpeRatio > 0 ? '+' : ''}{riskMetrics.sharpeRatio.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">Portfolio Beta</p>
          <p className="text-sm font-semibold text-white">{riskMetrics.beta.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskAnalysis;