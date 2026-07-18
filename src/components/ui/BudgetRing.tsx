export default function BudgetRing({
  pct,
  size = 88,
  stroke = 8,
  trackColor = "rgba(255,255,255,0.15)",
  progressColor = "#34d399",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
  progressColor?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(pct, 0), 100) / 100) * c;

  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={progressColor}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}
