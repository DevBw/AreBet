"use client";

// Pure SVG sparkline — no external dependencies.
// For betting odds: a DROP in value = odds shortened = positive signal (green).
// A RISE in value = odds drifted = negative signal (red).

type SparklineProps = {
  /** Array of numeric values to plot (e.g. odds over time). */
  data: number[];
  width?: number;
  height?: number;
  /** Override auto-detected trend color. */
  color?: string;
  className?: string;
  /** Show a filled area under the line. */
  filled?: boolean;
};

export function Sparkline({
  data,
  width = 64,
  height = 24,
  color,
  className = "",
  filled = false,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.001;

  // Build SVG point coordinates
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1;
    // y: invert so lower value (shorter odds) = lower y = visually UP on chart.
    // For odds, shorter = better, so we want shorter odds to go DOWN on the chart
    // to match typical "price going down" visual — keep natural inversion.
    const y = ((v - min) / range) * (height - 4) + 2;
    return { x, y };
  });

  const polylinePoints = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Closed path for filled area
  const areaPath =
    `M${pts[0].x.toFixed(1)},${height} ` +
    pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1].x.toFixed(1)},${height} Z`;

  // Trend: compare first vs last
  const first = data[0];
  const last = data[data.length - 1];
  const trendColor =
    color ??
    (last < first - 0.02
      ? "var(--color-positive)"  // odds shortened = good
      : last > first + 0.02
      ? "var(--color-negative)"  // odds drifted = bad
      : "var(--color-text-muted)");

  const fillColor = color ?? trendColor;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`sparkline ${className}`}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {filled && (
        <path
          d={areaPath}
          fill={fillColor}
          opacity="0.12"
        />
      )}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={trendColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={pts[pts.length - 1].x.toFixed(1)}
        cy={pts[pts.length - 1].y.toFixed(1)}
        r="2"
        fill={trendColor}
      />
    </svg>
  );
}
