type TrendIndicatorProps = {
  value: number;
  suffix?: string;
  showArrow?: boolean;
};

export function TrendIndicator({ value, suffix = "%", showArrow = true }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const trendClass = isPositive ? "trend-up" : isNegative ? "trend-down" : "trend-neutral";
  const valueClass = isPositive ? "value-positive" : isNegative ? "value-negative" : "value-neutral";
  const arrow = isPositive ? "↑" : isNegative ? "↓" : "→";

  return (
    <span className={`trend-indicator ${trendClass}`}>
      {showArrow && <span>{arrow}</span>}
      <span className={valueClass}>
        {isPositive && "+"}
        {value.toFixed(1)}
        {suffix}
      </span>
    </span>
  );
}
