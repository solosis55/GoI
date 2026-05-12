import type { WeekBucket } from "../../utils/sessionTimelineStats";

type Props = {
  data: WeekBucket[];
  className?: string;
};

/** Tendencia semanal (línea sobre últimas semanas). */
export function SessionsWeeklyTrend({ data, className = "" }: Props) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 320;
  const h = 100;
  const pad = 12;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + innerH - (d.count / max) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h + 36}`} className="w-full max-w-lg" role="img" aria-label="Sesiones por semana">
        <polyline
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.join(" ")}
          className="stroke-goi-gold healthy:stroke-goi-gold"
        />
        {data.map((d, i) => {
          const x = pad + i * step;
          const y = pad + innerH - (d.count / max) * innerH;
          return <circle key={`pt-${i}`} cx={x} cy={y} r={3.5} className="fill-goi-gold healthy:fill-goi-gold" />;
        })}
        {data.map((d, i) => {
          const x = pad + i * step;
          return (
            <text
              key={`lab-${i}`}
              x={x}
              y={h + 18}
              textAnchor="middle"
              className="fill-neutral-500 light:fill-zinc-600"
              style={{ fontSize: "9px" }}
            >
              {i % 2 === 0 ? d.label.split("–")[0]?.trim().slice(0, 6) ?? "" : ""}
            </text>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[10px] text-neutral-500 light:text-zinc-600">
        Últimas semanas (lun–dom). Etiquetas alternas por espacio.
      </p>
    </div>
  );
}
