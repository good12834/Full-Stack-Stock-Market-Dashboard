/**
 * Format large numbers into readable format (B, M, K)
 */
export const formatVolume = (volume) => {
  if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
};

/**
 * Format currency values
 */
export const formatCurrency = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format percentage change
 */
export const formatPercentage = (value, decimals = 2) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Get color based on stock trend
 */
export const getTrendColor = (value, style = 'text') => {
  const darkMode = style === 'text' ? 'dark:text' : 'dark:bg';

  return value >= 0
    ? `${style === 'text' ? 'text' : 'bg'}-green-600 ${darkMode}-green-400`
    : `${style === 'text' ? 'text' : 'bg'}-red-600 ${darkMode}-red-400`;
};

/**
 * Calculate portfolio metrics
 */
export const calculatePortfolioMetrics = (positions) => {
  const totalInvested = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.avgCost,
    0
  );
  const currentValue = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.currentPrice,
    0
  );
  const totalGain = currentValue - totalInvested;
  const totalGainPercent = (totalGain / totalInvested) * 100;

  return {
    totalInvested,
    currentValue,
    totalGain,
    totalGainPercent,
  };
};

/**
 * Separate stocks into categories
 */
export const categorizeStocks = (stocks, watchlistSymbols) => {
  return {
    watchlist: stocks.filter((s) => watchlistSymbols.has(s.symbol)),
    others: stocks.filter((s) => !watchlistSymbols.has(s.symbol)),
  };
};