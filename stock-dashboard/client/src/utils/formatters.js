// Number / currency / percent formatters used across the redesigned UI.

export const formatCurrency = (value, { compact = false, decimals } = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (compact) {
    if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}k`;
  }
  const d = decimals ?? (abs < 1 ? 4 : abs < 10 ? 3 : 2);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
};

export const formatPercent = (value, { sign = true } = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const s = sign && value > 0 ? '+' : '';
  return `${s}${value.toFixed(2)}%`;
};

export const formatNumber = (value, { decimals = 2 } = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)}k`;
  return value.toFixed(2);
};

// Alias used by legacy code (VolumeChart, etc.)
export const formatVolume = (value) => formatCompactNumber(value);

// Legacy aliases (used by StockDetail.jsx and other older pages)
export const formatMarketCap = (value) => formatCurrency(value, { compact: true, decimals: 2 });
export const formatDate = (value, { withTime = false } = {}) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

// Symbol → company logo (clearbit-style) fallback
export const companyLogo = (symbol) => {
  if (!symbol) return null;
  const s = String(symbol).toLowerCase().split('.')[0];
  return `https://logo.clearbit.com/${s}.com`;
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
