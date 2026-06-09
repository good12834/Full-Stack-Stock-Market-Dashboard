import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, X, TrendingUp, TrendingDown, BarChart3, RefreshCw,
  AlertCircle, Loader2, Star, ChevronRight, Calendar,
  BrainCircuit, ArrowUpRight, ArrowDownRight, Minus,
  Clock, DollarSign, LineChart, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import useStore from '../store/useStore';
import { stocksAPI } from '../utils/api';

// ─── Mock data fallback ────────────────────────────────
const FALLBACK_MOCK_DATA = {
  AAPL: { companyName: 'Apple Inc.', price: 178.72, change: 2.34, changePercent: 1.33, marketCap: 2750000000000, peRatio: 28.5, volume: 52345678, dayHigh: 179.50, dayLow: 176.80, dividend: 0.0056, weekHigh52: 199.62, weekLow52: 124.17, beta: 1.21, eps: 6.45, profitMargin: 0.254, revenueGrowth: 0.12, debtToEquity: 1.96, avgVolume: 48765234 },
  MSFT: { companyName: 'Microsoft Corp.', price: 378.91, change: -1.23, changePercent: -0.32, marketCap: 2810000000000, peRatio: 35.2, volume: 23456789, dayHigh: 382.10, dayLow: 376.40, dividend: 0.0071, weekHigh52: 420.82, weekLow52: 309.45, beta: 0.89, eps: 10.78, profitMargin: 0.351, revenueGrowth: 0.18, debtToEquity: 0.49, avgVolume: 22345678 },
  GOOGL: { companyName: 'Alphabet Inc.', price: 141.56, change: 0.89, changePercent: 0.63, marketCap: 1780000000000, peRatio: 24.8, volume: 18923456, dayHigh: 142.30, dayLow: 140.10, dividend: 0, weekHigh52: 153.78, weekLow52: 100.28, beta: 1.02, eps: 5.71, profitMargin: 0.219, revenueGrowth: 0.15, debtToEquity: 0.12, avgVolume: 19234567 },
  AMZN: { companyName: 'Amazon.com Inc.', price: 178.22, change: 3.12, changePercent: 1.78, marketCap: 1850000000000, peRatio: 51.3, volume: 31245678, dayHigh: 179.80, dayLow: 176.50, dividend: 0, weekHigh52: 201.20, weekLow52: 118.35, beta: 1.16, eps: 3.47, profitMargin: 0.051, revenueGrowth: 0.22, debtToEquity: 0.64, avgVolume: 33567890 },
  TSLA: { companyName: 'Tesla Inc.', price: 245.34, change: -5.67, changePercent: -2.26, marketCap: 780000000000, peRatio: 65.4, volume: 45678901, dayHigh: 252.00, dayLow: 243.20, dividend: 0, weekHigh52: 299.29, weekLow52: 138.80, beta: 1.85, eps: 3.75, profitMargin: 0.152, revenueGrowth: 0.25, debtToEquity: 0.35, avgVolume: 52345678 },
  META: { companyName: 'Meta Platforms Inc.', price: 474.11, change: 1.56, changePercent: 0.33, marketCap: 1210000000000, peRatio: 26.7, volume: 15678901, dayHigh: 476.50, dayLow: 471.80, dividend: 0, weekHigh52: 531.49, weekLow52: 274.38, beta: 1.13, eps: 17.75, profitMargin: 0.291, revenueGrowth: 0.27, debtToEquity: 0.20, avgVolume: 18234567 },
  NVDA: { companyName: 'NVIDIA Corp.', price: 682.23, change: 15.67, changePercent: 2.35, marketCap: 1680000000000, peRatio: 67.8, volume: 52345678, dayHigh: 690.00, dayLow: 675.50, dividend: 0.0004, weekHigh52: 700.00, weekLow52: 280.80, beta: 1.45, eps: 10.06, profitMargin: 0.425, revenueGrowth: 0.42, debtToEquity: 0.28, avgVolume: 48901234 },
  JPM: { companyName: 'JPMorgan Chase & Co.', price: 183.45, change: 0.78, changePercent: 0.43, marketCap: 530000000000, peRatio: 11.5, volume: 8934567, dayHigh: 184.50, dayLow: 182.20, dividend: 0.0245, weekHigh52: 195.30, weekLow52: 135.25, beta: 0.98, eps: 15.97, profitMargin: 0.281, revenueGrowth: 0.08, debtToEquity: 1.12, avgVolume: 9234567 },
};

// ─── Generate mock chart data ──────────────────────────
const generateMockChartData = (basePrice, volatility, points = 100) => {
  const data = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility;
    price = price + change;
    data.push({
      time: new Date(Date.now() - (points - i) * 86400000).toISOString(),
      close: Math.max(price, basePrice * 0.5),
    });
  }
  return data;
};

// ─── Helper: Mini sparkline SVG ────────────────────────
const MiniSparkline = ({ points, positive, width = 120, height = 40 }) => {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points.map(p => p.close));
  const max = Math.max(...points.map(p => p.close));
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const vals = points.map(p => p.close);

  const coords = vals.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y];
  });

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const stroke = positive ? '#22c55e' : '#ef4444';
  const fillColor = positive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
  const fillColorStop = positive ? 'rgba(34,197,94,0)' : 'rgba(239,68,68,0)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id={`spark-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor={fillColorStop} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${positive ? 'up' : 'down'})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Format helpers ─────────────────────────────────────
const formatCompact = (value) => {
  if (!value && value !== 0) return '—';
  const v = Number(value);
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
};

const formatVolume = (value) => {
  if (!value && value !== 0) return '—';
  const v = Number(value);
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
};

const formatPercent = (value, showSign = true) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = showSign && value > 0 ? '+' : '';
  if (typeof value === 'number' && value < 0.01 && value > -0.01 && value !== 0) return `${sign}${(value * 100).toFixed(4)}%`;
  return `${sign}${(value * 100).toFixed(2)}%`;
};

// ─── Time Range Options ────────────────────────────────
const TIME_RANGES = [
  { key: '1D', label: '1D', days: 1 },
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '6M', label: '6M', days: 180 },
  { key: '1Y', label: '1Y', days: 365 },
  { key: '5Y', label: '5Y', days: 1825 },
];

// ─── Metrics for comparison table ──────────────────────
const COMPARISON_METRICS = [
  { key: 'price', label: 'Price', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: true },
  { key: 'change', label: 'Change ($)', format: (v) => (v != null ? `${v >= 0 ? '+' : ''}$${Number(v).toFixed(2)}` : '—'), higherBetter: true, colorByValue: true },
  { key: 'changePercent', label: 'Change (%)', format: (v) => (v != null ? `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%` : '—'), higherBetter: true, colorByValue: true },
  { key: 'marketCap', label: 'Market Cap', format: (v) => formatCompact(v), higherBetter: true },
  { key: 'peRatio', label: 'P/E Ratio', format: (v) => (v != null ? Number(v).toFixed(2) : '—'), higherBetter: false },
  { key: 'eps', label: 'EPS (TTM)', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: true },
  { key: 'volume', label: 'Volume', format: (v) => formatVolume(v), higherBetter: false },
  { key: 'avgVolume', label: 'Avg Volume', format: (v) => formatVolume(v), higherBetter: false },
  { key: 'dayHigh', label: 'Day High', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: true },
  { key: 'dayLow', label: 'Day Low', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: false },
  { key: 'beta', label: 'Beta', format: (v) => (v != null ? Number(v).toFixed(2) : '—'), higherBetter: false },
  { key: 'profitMargin', label: 'Profit Margin', format: (v) => (v != null ? formatPercent(v) : '—'), higherBetter: true },
  { key: 'revenueGrowth', label: 'Revenue Growth', format: (v) => (v != null ? formatPercent(v) : '—'), higherBetter: true },
  { key: 'dividendYield', label: 'Dividend Yield', format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : '—'), higherBetter: true },
  { key: 'debtToEquity', label: 'Debt/Equity', format: (v) => (v != null ? Number(v).toFixed(2) : '—'), higherBetter: false },
  { key: 'weekHigh52', label: '52W High', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: true },
  { key: 'weekLow52', label: '52W Low', format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—'), higherBetter: false },
];

// ─── AI Analysis Generator ─────────────────────────────
const generateAIAnalysis = (stocksData) => {
  const stocks = Object.values(stocksData).filter(Boolean);
  if (stocks.length < 2) return [];

  const insights = [];

  // Best growth
  const byGrowth = [...stocks].sort((a, b) => (b.revenueGrowth || 0) - (a.revenueGrowth || 0));
  insights.push({
    type: 'growth',
    title: 'Highest Growth',
    stock: byGrowth[0],
    description: `${byGrowth[0].companyName} leads with ${(byGrowth[0].revenueGrowth * 100).toFixed(1)}% revenue growth`,
    icon: '🚀',
  });

  // Most stable (lowest beta)
  const byStability = [...stocks].sort((a, b) => Math.abs(a.beta - 1) - Math.abs(b.beta - 1));
  insights.push({
    type: 'stable',
    title: 'Most Stable',
    stock: byStability[0],
    description: `${byStability[0].companyName} has the closest beta to 1 (${byStability[0].beta?.toFixed(2)}), indicating market-like stability`,
    icon: '🛡️',
  });

  // Highest risk (highest beta)
  const byRisk = [...stocks].sort((a, b) => (b.beta || 0) - (a.beta || 0));
  insights.push({
    type: 'risk',
    title: 'Highest Volatility',
    stock: byRisk[0],
    description: `${byRisk[0].companyName} has the highest beta of ${byRisk[0].beta?.toFixed(2)}, suggesting higher price volatility`,
    icon: '⚡',
  });

  // Best value (lowest PE ratio)
  const byValue = [...stocks].filter(s => s.peRatio > 0).sort((a, b) => a.peRatio - b.peRatio);
  if (byValue.length > 0) {
    insights.push({
      type: 'value',
      title: 'Best Value',
      stock: byValue[0],
      description: `${byValue[0].companyName} has the lowest P/E ratio of ${byValue[0].peRatio?.toFixed(1)}, potentially the most undervalued`,
      icon: '💰',
    });
  }

  // Most profitable (highest profit margin)
  const byMargin = [...stocks].sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0));
  insights.push({
    type: 'profitable',
    title: 'Most Profitable',
    stock: byMargin[0],
    description: `${byMargin[0].companyName} boasts a ${(byMargin[0].profitMargin * 100).toFixed(1)}% profit margin, the highest among selected stocks`,
    icon: '🏆',
  });

  return insights;
};

// ─── Stock Comparison Page ─────────────────────────────
const StockComparison = () => {
  const { t } = useTranslation();
  const { fetchFinnhubData } = useStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [stockData, setStockData] = useState({});
  const [chartData, setChartData] = useState({});
  const [dataLoading, setDataLoading] = useState({});
  const [dataErrors, setDataErrors] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');
  const [activeChartSymbol, setActiveChartSymbol] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' | 'area'
  const [error, setError] = useState(null);

  const searchRef = useRef(null);

  // Close search dropdown outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-set active chart symbol when stocks are selected
  useEffect(() => {
    if (selectedSymbols.length > 0 && !activeChartSymbol) {
      setActiveChartSymbol(selectedSymbols[0]);
    }
  }, [selectedSymbols, activeChartSymbol]);

  // ─── Search ──────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/finnhub/search?q=${encodeURIComponent(searchQuery)}&exchange=US`);
        const json = await res.json();
        if (json.data?.result) {
          setSearchResults(json.data.result.slice(0, 8));
        } else {
          const results = Array.isArray(json.data) ? json.data : [];
          setSearchResults(results.slice(0, 8));
        }
      } catch {
        const query = searchQuery.toLowerCase();
        const common = [
          { symbol: 'AAPL', description: 'Apple Inc.' },
          { symbol: 'MSFT', description: 'Microsoft Corp.' },
          { symbol: 'GOOGL', description: 'Alphabet Inc.' },
          { symbol: 'AMZN', description: 'Amazon.com Inc.' },
          { symbol: 'TSLA', description: 'Tesla Inc.' },
          { symbol: 'META', description: 'Meta Platforms Inc.' },
          { symbol: 'NVDA', description: 'NVIDIA Corp.' },
          { symbol: 'JPM', description: 'JPMorgan Chase & Co.' },
        ].filter(s =>
          s.symbol.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        );
        setSearchResults(common);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // ─── Fetch stock data ────────────────────────────────
  const fetchStockData = useCallback(async (symbol) => {
    setDataLoading((prev) => ({ ...prev, [symbol]: true }));
    setDataErrors((prev) => ({ ...prev, [symbol]: null }));

    try {
      const [quote, profile, financials] = await Promise.all([
        fetchFinnhubData('getQuote', [symbol]).catch(() => null),
        fetchFinnhubData('getProfile2', [symbol]).catch(() => null),
        fetchFinnhubData('getBasicFinancials', [symbol, 'all']).catch(() => ({ metric: {} })),
      ]);

      const data = {
        symbol,
        companyName: profile?.name || FALLBACK_MOCK_DATA[symbol]?.companyName || symbol,
        logo: profile?.logo || '',
        price: quote?.c ?? FALLBACK_MOCK_DATA[symbol]?.price ?? 0,
        change: quote?.d ?? FALLBACK_MOCK_DATA[symbol]?.change ?? 0,
        changePercent: quote?.dp ?? FALLBACK_MOCK_DATA[symbol]?.changePercent ?? 0,
        marketCap: financials?.metric?.marketCapitalization ?? FALLBACK_MOCK_DATA[symbol]?.marketCap ?? 0,
        peRatio: financials?.metric?.peTTM ?? FALLBACK_MOCK_DATA[symbol]?.peRatio ?? 0,
        volume: quote?.v ?? FALLBACK_MOCK_DATA[symbol]?.volume ?? 0,
        dayHigh: quote?.h ?? FALLBACK_MOCK_DATA[symbol]?.dayHigh ?? 0,
        dayLow: quote?.l ?? FALLBACK_MOCK_DATA[symbol]?.dayLow ?? 0,
        open: quote?.o ?? 0,
        previousClose: quote?.pc ?? 0,
        beta: financials?.metric?.beta ?? FALLBACK_MOCK_DATA[symbol]?.beta ?? 0,
        eps: financials?.metric?.epsTTM ?? FALLBACK_MOCK_DATA[symbol]?.eps ?? 0,
        profitMargin: financials?.metric?.profitMargin ?? FALLBACK_MOCK_DATA[symbol]?.profitMargin ?? 0,
        revenueGrowth: financials?.metric?.revenueGrowth ?? FALLBACK_MOCK_DATA[symbol]?.revenueGrowth ?? 0,
        dividendYield: financials?.metric?.dividendYieldIndicatedAnnual ?? FALLBACK_MOCK_DATA[symbol]?.dividend ?? 0,
        debtToEquity: financials?.metric?.debtToEquity ?? FALLBACK_MOCK_DATA[symbol]?.debtToEquity ?? 0,
        avgVolume: financials?.metric?.avgVolume ?? FALLBACK_MOCK_DATA[symbol]?.avgVolume ?? 0,
        weekHigh52: financials?.metric?.['52WeekHigh'] ?? FALLBACK_MOCK_DATA[symbol]?.weekHigh52 ?? 0,
        weekLow52: financials?.metric?.['52WeekLow'] ?? FALLBACK_MOCK_DATA[symbol]?.weekLow52 ?? 0,
        sector: financials?.metric?.sector ?? '',
        industry: financials?.metric?.industry ?? '',
      };

      setStockData((prev) => ({ ...prev, [symbol]: data }));

      // Generate mock chart data for the card sparkline
      const volatility = (data.changePercent || 0) > 0 ? data.price * 0.015 : data.price * 0.02;
      const mockChart = generateMockChartData(data.price, volatility, 60);
      setChartData((prev) => ({ ...prev, [symbol]: { daily: mockChart } }));

    } catch (err) {
      setDataErrors((prev) => ({ ...prev, [symbol]: t('compare.fetchError') }));
      // Set fallback data
      const mock = FALLBACK_MOCK_DATA[symbol] || {
        companyName: symbol, price: Math.random() * 500 + 10, change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5, marketCap: Math.floor(Math.random() * 3e12),
        peRatio: Math.random() * 40 + 5, volume: Math.floor(Math.random() * 5e7),
        dayHigh: 0, dayLow: 0, beta: Math.random() + 0.5, eps: Math.random() * 10,
        profitMargin: Math.random() * 0.3, revenueGrowth: Math.random() * 0.3,
        dividendYield: Math.random() * 0.02, debtToEquity: Math.random() * 2,
        avgVolume: Math.floor(Math.random() * 5e7), weekHigh52: 0, weekLow52: 0,
      };
      setStockData((prev) => ({ ...prev, [symbol]: { symbol, ...mock } }));
      const mockChart = generateMockChartData(mock.price || 100, (mock.price || 100) * 0.015, 60);
      setChartData((prev) => ({ ...prev, [symbol]: { daily: mockChart } }));
    } finally {
      setDataLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  }, [fetchFinnhubData, t]);

  // ─── Add stock ───────────────────────────────────────
  const addStock = useCallback(async (symbol) => {
    if (selectedSymbols.length >= 6) return;
    if (selectedSymbols.includes(symbol)) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    setSelectedSymbols((prev) => [...prev, symbol]);
    setSearchQuery('');
    setSearchResults([]);
    await fetchStockData(symbol);
    if (!activeChartSymbol) setActiveChartSymbol(symbol);
  }, [selectedSymbols, fetchStockData, activeChartSymbol]);

  // ─── Remove stock ────────────────────────────────────
  const removeStock = useCallback((symbol) => {
    setSelectedSymbols((prev) => prev.filter((s) => s !== symbol));
    setStockData((prev) => { const n = { ...prev }; delete n[symbol]; return n; });
    setChartData((prev) => { const n = { ...prev }; delete n[symbol]; return n; });
    setDataLoading((prev) => { const n = { ...prev }; delete n[symbol]; return n; });
    setDataErrors((prev) => { const n = { ...prev }; delete n[symbol]; return n; });
    if (activeChartSymbol === symbol) {
      const remaining = selectedSymbols.filter((s) => s !== symbol);
      setActiveChartSymbol(remaining.length > 0 ? remaining[0] : null);
    }
  }, [selectedSymbols, activeChartSymbol]);

  // ─── AI Insights ─────────────────────────────────────
  const aiInsights = useMemo(() => generateAIAnalysis(stockData), [stockData]);

  // ─── Chart data for selected symbol ──────────────────
  const chartTimeData = useMemo(() => {
    if (!activeChartSymbol || !chartData[activeChartSymbol]) return [];
    const days = TIME_RANGES.find(r => r.key === selectedTimeRange)?.days || 365;
    const allData = chartData[activeChartSymbol]?.daily || [];
    if (allData.length === 0) return [];
    const cutoff = allData.length - Math.min(allData.length, Math.floor(days / 365 * allData.length));
    return allData.slice(Math.max(0, cutoff));
  }, [activeChartSymbol, chartData, selectedTimeRange]);

  // ─── Get best value for a metric ─────────────────────
  const getBestValue = useCallback((metricKey) => {
    const metric = COMPARISON_METRICS.find(m => m.key === metricKey);
    if (!metric) return null;
    const values = selectedSymbols
      .map((s) => ({ symbol: s, value: stockData[s]?.[metricKey] }))
      .filter((v) => v.value != null && v.value !== 0 && !Number.isNaN(Number(v.value)));
    if (values.length === 0) return null;
    const parsed = values.map(v => ({ symbol: v.symbol, value: Number(v.value) }));
    return metric.higherBetter
      ? parsed.reduce((best, curr) => (curr.value > best.value ? curr : best), parsed[0]).symbol
      : parsed.reduce((best, curr) => (curr.value < best.value ? curr : best), parsed[0]).symbol;
  }, [selectedSymbols, stockData]);

  // ─── Refresh ─────────────────────────────────────────
  const refreshStock = useCallback((symbol) => {
    fetchStockData(symbol);
  }, [fetchStockData]);

  // ─── Render ──────────────────────────────────────────
  const hasStocks = selectedSymbols.length > 0;

  return (
    <div className="min-h-screen bg-[#05070d] starfield">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#05070d]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white gradient-text">
                {t('compare.title')}
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {t('compare.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/30 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ─── Search ────────────────────────────────── */}
        <div ref={searchRef} className="relative">
          {/* Selected tags */}
          {hasStocks && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSymbols.map((symbol) => (
                <span
                  key={symbol}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/80"
                >
                  <span className={`w-2 h-2 rounded-full ${dataLoading[symbol] ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                  {symbol}
                  <button
                    onClick={() => removeStock(symbol)}
                    className="ml-1 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder={hasStocks ? 'Search and add more stocks...' : t('compare.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedSymbols.length >= 6}
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute z-50 mt-2 left-0 right-0 bg-[#0c1020] border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto backdrop-blur-2xl">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => addStock(stock.symbol)}
                  disabled={selectedSymbols.includes(stock.symbol)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-white">{stock.symbol}</span>
                      <span className="text-xs text-white/40 block">{stock.description || stock.name || '—'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>
              ))}
            </div>
          )}

          {/* Max stocks hint */}
          {selectedSymbols.length >= 6 && (
            <p className="text-xs text-yellow-400/70 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Maximum of 6 stocks can be compared at once
            </p>
          )}
        </div>

        {/* ─── Error ──────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {hasStocks ? (
          <>
            {/* ─── Stock Cards ──────────────────────────── */}
            <div className={`grid gap-4 ${
              selectedSymbols.length === 1 ? 'grid-cols-1' :
              selectedSymbols.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
              selectedSymbols.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              selectedSymbols.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {selectedSymbols.map((symbol) => {
                const data = stockData[symbol];
                const loading = dataLoading[symbol];
                const isPositive = (data?.change || 0) >= 0;
                const logoUrl = data?.logo || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;

                return (
                  <div
                    key={symbol}
                    className={`group relative glass rounded-2xl p-5 transition-all duration-300 hover:border-white/20 ${
                      loading ? 'animate-pulse' : ''
                    }`}
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeStock(symbol)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {loading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-4 bg-white/10 rounded w-20" />
                            <div className="h-3 bg-white/5 rounded w-14" />
                          </div>
                        </div>
                        <div className="h-8 bg-white/10 rounded w-24" />
                        <div className="h-10 bg-white/5 rounded" />
                      </div>
                    ) : data ? (
                      <>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={symbol}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src = '';
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-400">
                              {symbol.slice(0, 2)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{data.companyName}</h3>
                            <span className="text-xs text-white/40 font-mono">{symbol}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-white font-mono">
                            ${Number(data.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 text-sm font-medium ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isPositive ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            <span>{data.change >= 0 ? '+' : ''}${Number(data.change).toFixed(2)}</span>
                            <span>({data.changePercent >= 0 ? '+' : ''}{Number(data.changePercent).toFixed(2)}%)</span>
                          </div>
                        </div>

                        {/* Mini sparkline */}
                        <div className="mt-2 -mx-2">
                          <MiniSparkline
                            points={chartData[symbol]?.daily?.slice(-40) || []}
                            positive={isPositive}
                            width={200}
                            height={36}
                          />
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                          <div className="text-center">
                            <div className="text-[10px] text-white/30 uppercase tracking-wider">Mkt Cap</div>
                            <div className="text-xs text-white/70 font-mono mt-0.5">{formatCompact(data.marketCap)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-white/30 uppercase tracking-wider">P/E</div>
                            <div className="text-xs text-white/70 font-mono mt-0.5">{data.peRatio?.toFixed(1) || '—'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-white/30 uppercase tracking-wider">Vol</div>
                            <div className="text-xs text-white/70 font-mono mt-0.5">{formatVolume(data.volume)}</div>
                          </div>
                        </div>

                        {/* Refresh button */}
                        <button
                          onClick={() => refreshStock(symbol)}
                          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
                          title="Refresh"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-white/40 text-sm text-center py-4">
                        {dataErrors[symbol] || 'No data'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─── Interactive Chart ────────────────────── */}
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <LineChart className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white/90">Interactive Chart</h2>
                </div>
                <div className="flex items-center gap-3">
                  {/* Symbol selector */}
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1">
                    {selectedSymbols.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setActiveChartSymbol(symbol)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          activeChartSymbol === symbol
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-white/50 hover:text-white/80'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  {/* Chart type toggle */}
                  <button
                    onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-white/50 hover:text-white/80 transition-all"
                  >
                    {chartType === 'line' ? 'Area' : 'Line'}
                  </button>
                </div>
              </div>

              {/* Time range */}
              <div className="flex items-center gap-1.5 mb-4">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setSelectedTimeRange(range.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedTimeRange === range.key
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-white/40 hover:text-white/70 border border-transparent'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* The chart */}
              {chartTimeData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={chartTimeData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                          tickFormatter={(v) => {
                            const d = new Date(v);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis
                          domain={['dataMin - 5', 'dataMax + 5']}
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                          tickFormatter={(v) => `$${v.toFixed(0)}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-[#0c1020] border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                <p className="text-xs text-white/40 mb-1">
                                  {new Date(label).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                  })}
                                </p>
                                <p className="text-sm font-bold text-white">
                                  ${Number(payload[0].value).toFixed(2)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="close"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#chartGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0c1020' }}
                        />
                      </AreaChart>
                    ) : (
                      <AreaChart data={chartTimeData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <defs>
                          <linearGradient id="chartGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                          tickFormatter={(v) => {
                            const d = new Date(v);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis
                          domain={['dataMin - 5', 'dataMax + 5']}
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                          tickFormatter={(v) => `$${v.toFixed(0)}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-[#0c1020] border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                <p className="text-xs text-white/40 mb-1">
                                  {new Date(label).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                  })}
                                </p>
                                <p className="text-sm font-bold text-white">
                                  ${Number(payload[0].value).toFixed(2)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="close"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#chartGradient2)"
                          dot={false}
                          activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0c1020' }}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart data loading...</p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Comparison Table ─────────────────────── */}
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white/80">Financial Metrics Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-wider w-44">
                        Metric
                      </th>
                      {selectedSymbols.map((symbol) => (
                        <th key={symbol} className="px-5 py-3.5 text-center min-w-[150px]">
                          <div className="flex items-center justify-center gap-2">
                            {stockData[symbol]?.logo ? (
                              <img src={stockData[symbol].logo} alt="" className="w-5 h-5 rounded" />
                            ) : (
                              <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">
                                {symbol[0]}
                              </div>
                            )}
                            <span className="font-bold text-sm text-white">{symbol}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_METRICS.map((metric, idx) => {
                      const bestSymbol = getBestValue(metric.key);
                      return (
                        <tr
                          key={metric.key}
                          className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                            idx % 2 === 0 ? 'bg-white/[0.015]' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5 text-sm font-medium text-white/50">
                            {metric.label}
                          </td>
                          {selectedSymbols.map((symbol) => {
                            const data = stockData[symbol];
                            const loading = dataLoading[symbol];
                            const error = dataErrors[symbol];
                            const isBest = bestSymbol === symbol;
                            const value = data?.[metric.key];

                            // Color for change metrics
                            let colorClass = 'text-white/80';
                            if (metric.colorByValue && value != null) {
                              colorClass = value >= 0 ? 'text-green-400' : 'text-red-400';
                            }

                            return (
                              <td
                                key={symbol}
                                className={`px-5 py-3.5 text-center text-sm ${colorClass} ${
                                  isBest ? 'bg-green-500/5' : ''
                                }`}
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-white/20" />
                                ) : error ? (
                                  <span className="text-xs text-amber-400/60">{error}</span>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className={`font-mono ${isBest ? 'font-bold text-white' : ''}`}>
                                      {metric.format(value)}
                                    </span>
                                    {isBest && (
                                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── AI Insights ──────────────────────────── */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-5">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white/90">AI Analysis & Insights</h2>
                <Sparkles className="w-4 h-4 text-purple-400/60" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white/80">{insight.title}</h3>
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            {insight.stock?.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{insight.description}</p>
                        {insight.stock?.price && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-white/30">Price:</span>
                            <span className="text-white/70 font-mono">
                              ${Number(insight.stock.price).toFixed(2)}
                            </span>
                            <span className={`font-mono ${
                              (insight.stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(insight.stock.change || 0) >= 0 ? '+' : ''}
                              {Number(insight.stock.changePercent || 0).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {aiInsights.length === 0 && (
                <div className="text-center py-8 text-white/30">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Add at least 2 stocks to see AI-powered insights</p>
                </div>
              )}

              {/* Summary */}
              {aiInsights.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white/80 mb-1">Portfolio Summary</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Based on the selected stocks, the best growth opportunity appears to be {' '}
                        <span className="text-green-400 font-semibold">
                          {aiInsights.find(i => i.type === 'growth')?.stock?.companyName}
                        </span>
                        , while {' '}
                        <span className="text-blue-400 font-semibold">
                          {aiInsights.find(i => i.type === 'stable')?.stock?.companyName}
                        </span>
                        {' '}offers the most stability. For value investors, {' '}
                        <span className="text-yellow-400 font-semibold">
                          {aiInsights.find(i => i.type === 'value')?.stock?.companyName}
                        </span>
                        {' '}stands out with the lowest valuation multiples.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Legend ──────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Best value
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh data
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Live data
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Loading
              </span>
            </div>
          </>
        ) : (
          /* ─── Empty state ──────────────────────────────── */
          <div className="text-center py-24 glass rounded-2xl">
            <div className="relative inline-block">
              <BarChart3 className="w-20 h-20 text-white/10 mx-auto mb-4" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-3">
              Start Comparing Stocks
            </h3>
            <p className="text-sm text-white/30 max-w-md mx-auto mb-8">
              Search and add up to 6 stocks to compare their performance, financial metrics, and get AI-powered insights side by side.
            </p>

            {/* Quick add buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => addStock(symbol)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  + {symbol}
                </button>
              ))}
            </div>

            <p className="text-xs text-white/20">
              Data powered by Finnhub · Prices delayed by 15 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockComparison;