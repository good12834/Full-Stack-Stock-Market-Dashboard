import React, { useEffect, useMemo, useRef, useState } from 'react';

// Hand-rolled SVG candlestick chart with hover crosshair + tooltip.
// Props:
//   candles: Array<{ time, open, high, low, close, volume }>
//   height: number
//   positiveColor / negativeColor: hex

const CandlestickChart = ({
  candles = [],
  height = 320,
  positiveColor = '#16c784',
  negativeColor = '#ea3943',
}) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(280, Math.floor(entry.contentRect.width));
        setWidth(w);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const stats = useMemo(() => {
    if (!candles.length) return null;
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const range = max - min || 1;
    const stepX = width / candles.length;
    const candleW = Math.max(2, Math.min(10, stepX * 0.65));
    return { max, min, range, stepX, candleW };
  }, [candles, width]);

  const gridLines = useMemo(() => {
    if (!stats) return [];
    const lines = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * height;
      const v = stats.max - (i / steps) * stats.range;
      lines.push({ y, value: v });
    }
    return lines;
  }, [stats, height]);

  const xLabels = useMemo(() => {
    if (!candles.length) return [];
    const out = [];
    const step = Math.max(1, Math.floor(candles.length / 8));
    for (let i = 0; i < candles.length; i += step) {
      out.push({ x: i * (stats?.stepX || 0) + (stats?.stepX || 0) / 2, candle: candles[i] });
    }
    return out;
  }, [candles, stats]);

  const handleMove = (e) => {
    if (!containerRef.current || !stats) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const idx = Math.max(0, Math.min(candles.length - 1, Math.floor(x / stats.stepX)));
    setHoverIdx(idx);
  };

  const handleLeave = () => setHoverIdx(null);

  const hovered = hoverIdx !== null ? candles[hoverIdx] : null;
  const hoverX = hoverIdx !== null && stats ? hoverIdx * stats.stepX + stats.stepX / 2 : null;

  const formatTime = (t) => {
    if (!t) return '';
    const d = new Date(typeof t === 'number' ? t * 1000 : t);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  if (!candles.length) {
    return (
      <div className="flex items-center justify-center text-white/40 text-sm" style={{ height }}>
        No chart data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Horizontal grid */}
        {gridLines.map((g, i) => (
          <g key={`g-${i}`}>
            <line
              x1="0"
              x2={width}
              y1={g.y}
              y2={g.y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 4"
            />
            <text
              x={width - 6}
              y={g.y - 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(230,232,239,0.45)"
              fontFamily="Inter, sans-serif"
            >
              {g.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </text>
          </g>
        ))}

        {/* Candles */}
        {stats &&
          candles.map((c, i) => {
            const cx = i * stats.stepX + stats.stepX / 2;
            const isUp = c.close >= c.open;
            const color = isUp ? positiveColor : negativeColor;
            const yHigh = ((stats.max - c.high) / stats.range) * height;
            const yLow = ((stats.max - c.low) / stats.range) * height;
            const yOpen = ((stats.max - c.open) / stats.range) * height;
            const yClose = ((stats.max - c.close) / stats.range) * height;
            const yTop = Math.min(yOpen, yClose);
            const bodyH = Math.max(1, Math.abs(yClose - yOpen));
            return (
              <g key={`c-${i}`} opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.55}>
                <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth="1" />
                <rect
                  x={cx - stats.candleW / 2}
                  y={yTop}
                  width={stats.candleW}
                  height={bodyH}
                  fill={color}
                  stroke={color}
                  rx="0.5"
                />
              </g>
            );
          })}

        {/* Crosshair */}
        {hoverX !== null && hovered && stats && (
          <g>
            <line x1={hoverX} x2={hoverX} y1="0" y2={height} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
            <line x1="0" x2={width} y1={(stats.max - hovered.close) / stats.range * height} y2={(stats.max - hovered.close) / stats.range * height} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
          </g>
        )}
      </svg>

      {/* X-axis labels */}
      <div className="absolute left-0 right-0 -bottom-1 flex justify-between text-[10px] text-white/40 px-1">
        {xLabels.map((l, i) => (
          <span key={i}>{formatTime(l.candle.time)}</span>
        ))}
      </div>

      {/* Hover tooltip */}
      {hovered && stats && (
        <div
          className="absolute pointer-events-none glass-strong rounded-lg px-3 py-2 text-xs shadow-glass"
          style={{
            left: Math.min(width - 140, Math.max(0, (hoverX || 0) + 8)),
            top: 8,
          }}
        >
          <div className="text-white/55 text-[10px] mb-1">
            {new Date(hovered.time * 1000).toLocaleString(undefined, {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-white/85 tabular-nums">
            <span className="text-white/45">O</span>
            <span>{hovered.open.toFixed(2)}</span>
            <span className="text-white/45">H</span>
            <span>{hovered.high.toFixed(2)}</span>
            <span className="text-white/45">L</span>
            <span>{hovered.low.toFixed(2)}</span>
            <span className="text-white/45">C</span>
            <span className={hovered.close >= hovered.open ? 'text-bull-500' : 'text-bear-500'}>
              {hovered.close.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
