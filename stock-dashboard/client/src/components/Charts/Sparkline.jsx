import React from 'react';

// Lightweight SVG sparkline used in the "Top assets" list.
// Props:
//   points: number[]   -> values to plot
//   positive: boolean  -> color direction
//   width / height: number
//   strokeWidth: number
//   fill: boolean      -> render the area gradient under the line
const Sparkline = ({
  points = [],
  positive = true,
  width = 80,
  height = 26,
  strokeWidth = 1.6,
  fill = true,
}) => {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y];
  });

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const stroke = positive ? '#16c784' : '#ea3943';
  const fillStops = positive
    ? ['rgba(22,199,132,0.35)', 'rgba(22,199,132,0)']
    : ['rgba(234,57,67,0.35)', 'rgba(234,57,67,0)'];

  const id = React.useId();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillStops[0]} />
          <stop offset="100%" stopColor={fillStops[1]} />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#spark-fill-${id})`} />}
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Sparkline;
