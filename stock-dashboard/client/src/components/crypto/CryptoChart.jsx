import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, TrendingUp, BarChart3, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

const TIME_FILTERS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 'max' },
];

const CryptoChart = ({ coinId = 'bitcoin', coinName = 'Bitcoin', coinSymbol = 'BTC' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('7D');
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const days = TIME_FILTERS.find(f => f.label === selectedRange)?.days || 7;

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crypto/history/${coinId}?days=${days}`);
      const json = await res.json();
      if (json.success && json.data?.prices) {
        setChartData(json.data.prices);
      }
    } catch (err) {
      console.error('Chart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Draw the chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = rect.width;
    const height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate ranges
    const prices = chartData.map(p => p[1]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const isPositive = prices[prices.length - 1] >= prices[0];

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Price labels on Y-axis
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = max - (range / gridLines) * i;
      const label = val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val.toFixed(2)}`;
      ctx.fillText(label, padding.left - 8, y + 3);
    }

    // Price line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.01)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
    }

    ctx.beginPath();
    chartData.forEach((point, i) => {
      const x = padding.left + (i / (chartData.length - 1)) * chartW;
      const y = padding.top + chartH - ((point[1] - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill area
    ctx.lineTo(padding.left + chartW, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw hover line
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < chartData.length) {
      const x = padding.left + (hoveredIndex / (chartData.length - 1)) * chartW;
      const y = padding.top + chartH - ((chartData[hoveredIndex][1] - min) / range) * chartH;

      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      ctx.fill();
    }

    // Date labels on X-axis
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'center';
    const labelCount = Math.min(6, chartData.length);
    const step = Math.floor(chartData.length / labelCount);
    for (let i = 0; i < chartData.length; i += step) {
      const x = padding.left + (i / (chartData.length - 1)) * chartW;
      const date = new Date(chartData[i][0]);
      const label = selectedRange === '1D'
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillText(label, x, height - 5);
    }
  }, [chartData, selectedRange, hoveredIndex]);

  // Mouse move handler for hover
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 50, right: 20 };
    const chartW = rect.width - padding.left - padding.right;
    const relativeX = mouseX - padding.left;
    if (relativeX < 0 || relativeX > chartW) {
      setHoveredIndex(null);
      setHoveredPoint(null);
      return;
    }
    const idx = Math.round((relativeX / chartW) * (chartData.length - 1));
    const clampedIdx = Math.max(0, Math.min(chartData.length - 1, idx));
    setHoveredIndex(clampedIdx);
    setHoveredPoint(chartData[clampedIdx]);
  }, [chartData]);

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoveredPoint(null);
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1][1] : 0;
  const startPrice = chartData.length > 0 ? chartData[0][1] : 0;
  const priceChange = currentPrice - startPrice;
  const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChangePercent >= 0;

  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4'
    : '';

  const chartCardClass = fullscreen
    ? 'w-full max-w-5xl h-[80vh] bg-ink-800 rounded-2xl border border-white/10 p-6'
    : 'bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-4';

  return (
    <div className={containerClass}>
      <div ref={containerRef} className={chartCardClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {coinName} <span className="text-slate-400 font-normal">({coinSymbol}/USD)</span>
                </h3>
                {chartData.length > 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className={`flex items-center gap-0.5 text-sm font-medium ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${!isPositive ? 'rotate-180' : ''}`} />
                      {Math.abs(priceChangePercent).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchChartData}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 mb-4">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setSelectedRange(f.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRange === f.label
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div
          className="relative w-full h-[300px] md:h-[350px] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Loading chart data...</span>
              </div>
            </div>
          ) : chartData.length < 2 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-slate-400">Insufficient data for chart</span>
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full h-full" />
          )}

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute top-3 right-3 bg-white dark:bg-ink-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg z-10"
            >
              <div className="text-[10px] text-slate-400">
                {new Date(hoveredPoint[0]).toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {formatPrice(hoveredPoint[1])}
              </div>
            </div>
          )}
        </div>

        {/* Current price stats */}
        {chartData.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Real-time</span>
            </div>
            <div className="text-xs text-slate-400">
              O: {formatPrice(chartData[0]?.[1])}
            </div>
            <div className="text-xs text-slate-400">
              H: {formatPrice(Math.max(...chartData.map(p => p[1])))}
            </div>
            <div className="text-xs text-slate-400">
              L: {formatPrice(Math.min(...chartData.map(p => p[1])))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoChart;