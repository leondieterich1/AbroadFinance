export type DonutSlice = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  size = 160,
  stroke = 22,
}: {
  data: DonutSlice[];
  size?: number;
  stroke?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      {total === 0 ? (
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      ) : (
        data.map((d) => {
          const frac = d.value / total;
          const dash = frac * c;
          const offset = offsetAcc;
          offsetAcc += dash;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={d.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
            />
          );
        })
      )}
    </svg>
  );
}
