/**
 * Calculate the total value of all positions
 */
export const calculateTotalValue = (positions) => {
  if (!positions || positions.length === 0) return 0;
  return positions.reduce((sum, pos) => {
    const price = pos.currentPrice || 0;
    return sum + pos.quantity * price;
  }, 0);
};

/**
 * Calculate the total invested amount
 */
export const calculateTotalInvested = (positions) => {
  if (!positions || positions.length === 0) return 0;
  return positions.reduce((sum, pos) => sum + pos.quantity * pos.avgCost, 0);
};

/**
 * Calculate the total gain/loss
 */
export const calculateTotalGain = (totalValue, totalInvested) => {
  return totalValue - totalInvested;
};

/**
 * Calculate the total gain/loss percentage
 */
export const calculateTotalGainPercent = (totalValue, totalInvested) => {
  if (totalInvested === 0) return 0;
  return ((totalValue - totalInvested) / totalInvested) * 100;
};

/**
 * Calculate weighted average cost for a position
 */
export const calculateWeightedAvgCost = (existingQty, existingCost, newQty, newCost) => {
  const totalCost = existingQty * existingCost + newQty * newCost;
  const totalQty = existingQty + newQty;
  return totalQty > 0 ? totalCost / totalQty : 0;
};

/**
 * Calculate position value
 */
export const calculatePositionValue = (quantity, currentPrice) => {
  return quantity * currentPrice;
};

/**
 * Calculate position gain
 */
export const calculatePositionGain = (quantity, currentPrice, avgCost) => {
  return (currentPrice - avgCost) * quantity;
};

/**
 * Calculate position gain percentage
 */
export const calculatePositionGainPercent = (currentPrice, avgCost) => {
  if (avgCost === 0) return 0;
  return ((currentPrice - avgCost) / avgCost) * 100;
};

/**
 * Calculate portfolio diversification (percentage each position represents)
 */
export const calculateDiversification = (positions) => {
  const totalValue = calculateTotalValue(positions);
  if (totalValue === 0) return [];

  return positions.map((pos) => {
    const value = calculatePositionValue(pos.quantity, pos.currentPrice || 0);
    return {
      symbol: pos.symbol,
      value,
      percentage: (value / totalValue) * 100,
    };
  }).sort((a, b) => b.percentage - a.percentage);
};

/**
 * Calculate day change for a position
 */
export const calculateDayChange = (currentPrice, previousClose, quantity) => {
  if (!previousClose) return 0;
  return (currentPrice - previousClose) * (quantity || 1);
};

/**
 * Format a number as a percentage string
 */
export const toPercentString = (value, decimals = 2) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Calculate the Beta (volatility) of a stock relative to the market
 * Simplified: uses close prices from historical data
 */
export const calculateBeta = (stockReturns, marketReturns) => {
  if (!stockReturns || !marketReturns || stockReturns.length < 2) return null;

  const n = Math.min(stockReturns.length, marketReturns.length);
  const stockMean = stockReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const marketMean = marketReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let marketVariance = 0;

  for (let i = 0; i < n; i++) {
    const stockDiff = stockReturns[i] - stockMean;
    const marketDiff = marketReturns[i] - marketMean;
    covariance += stockDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }

  return marketVariance !== 0 ? covariance / marketVariance : null;
};

/**
 * Calculate the Sharpe Ratio (risk-adjusted return)
 * Simplified: uses average return / standard deviation
 */
export const calculateSharpeRatio = (returns, riskFreeRate = 0.02) => {
  if (!returns || returns.length < 2) return null;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev !== 0 ? (avgReturn - riskFreeRate / 252) / stdDev : 0;
};