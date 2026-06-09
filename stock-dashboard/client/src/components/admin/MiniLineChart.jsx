import React from 'react';

/**
 * Lightweight inline-SVG line chart. Avoids pulling in a chart library
 * for the Admin Analytics dashboard. Designed for tiny time-series
 * visualisations such as request volume.
 */
const MiniLineChart = ({
  data = [],
  width = 560,
  height = 200,
  stroke = '#6366f1',
  fill = 'url(#miniLineGradient)',
  showAxes = true,
  yLabel = '',
  smooth = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700"
        style={{ width: '100%', height }}
      >
        No data
      </div>
    );
  }

  const padding = { top: 16, right: 16, bottom: showAxes ? 28 : 12, left: showAxes ? 40 : 12 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padding.top + (1 - (d.value - min) / range) * innerH;
    return { x, y, raw: d };
  });

  // Build a smooth path using cubic Bezier between points.
  const buildPath = () => {
    if (points.length === 0) return '';
    if (!smooth || points.length < 3) {
      return points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');
    }
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }
    return d;
  };

  const linePath = buildPath();
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`;

  // Y-axis ticks (4 evenly spaced).
  const yTicks = showAxes
    ? [0, 0.25, 0.5, 0.75, 1].map((p) => ({
        y: padding.top + (1 - p) * innerH,
        label: Math.round(min + p * range).toLocaleString(),
      }))
    : [];

  // X-axis labels — show 4 evenly spaced labels.
  const xLabels = showAxes
    ? data
        .map((d, i) => ({ d, i }))
        .filter((_, i) => i % Math.max(1, Math.floor(data.length / 4)) === 0)
    : [];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="miniLineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {showAxes &&
        yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={t.y}
              y2={t.y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="2 4"
            />
            <text
              x={padding.left - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              opacity="0.5"
            >
              {t.label}
            </text>
          </g>
        ))}

      {/* Area fill */}
      <path d={areaPath} fill={fill} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill={stroke}
          stroke="white"
          strokeWidth="1"
        />
      ))}

      {/* X labels */}
      {showAxes &&
        xLabels.map(({ d, i }, idx) => {
          const x = padding.left + (i / Math.max(1, data.length - 1)) * innerW;
          return (
            <text
              key={idx}
              x={x}
              y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.5"
            >
              {d.label}
            </text>
          );
        })}

      {yLabel && (
        <text
          x={8}
          y={14}
          fontSize="10"
          fill="currentColor"
          opacity="0.6"
        >
          {yLabel}
        </text>
      )}
    </svg>
  );
};

export default MiniLineChart;
