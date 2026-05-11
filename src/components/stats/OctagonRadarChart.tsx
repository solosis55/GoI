import type { MuscleOctagonAxis } from "../../utils/muscleOctagonStats";
import { MUSCLE_OCTAGON_AXES, MUSCLE_OCTAGON_LABELS } from "../../utils/muscleOctagonStats";

type OctagonRadarChartProps = {
  hits: Record<MuscleOctagonAxis, number>;
  className?: string;
};

function labelTextAnchor(i: number, n: number): "start" | "middle" | "end" {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const c = Math.cos(angle);
  if (c > 0.35) return "start";
  if (c < -0.35) return "end";
  return "middle";
}

/** Radar octogonal (8 ejes) para distribución muscular relativa. */
export function OctagonRadarChart({ hits, className = "" }: OctagonRadarChartProps) {
  /** viewBox amplio + márgenes para anclas start/end y nombres largos sin recorte. */
  const W = 360;
  const H = 340;
  const cx = W / 2;
  const cy = H / 2;
  const rMax = 64;
  const rLabel = rMax + 32;
  const n = MUSCLE_OCTAGON_AXES.length;

  const values = MUSCLE_OCTAGON_AXES.map((k) => hits[k] ?? 0);
  const maxHit = Math.max(1, ...values);

  function vertexAt(i: number, radius: number): [number, number] {
    const angle = (-Math.PI / 2 + (i * 2 * Math.PI) / n) as number;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  const outerRing = MUSCLE_OCTAGON_AXES.map((_, i) => vertexAt(i, rMax));
  const dataPoly = MUSCLE_OCTAGON_AXES.map((_, i) => {
    const t = values[i]! / maxHit;
    return vertexAt(i, rMax * (0.1 + t * 0.9));
  });

  const pathD =
    dataPoly.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + " Z";

  return (
    <div className={["flex w-full flex-col items-center gap-3", className].filter(Boolean).join(" ")}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-[min(100%,470px)] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Distribución por grupos musculares según tus sesiones registradas."
      >
        {outerRing.map((_, i) => {
          const p = outerRing[i]!;
          return (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={p[0]}
              y2={p[1]}
              className="stroke-neutral-700/80 light:stroke-zinc-300"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={outerRing.map((p) => `${p[0]},${p[1]}`).join(" ")}
          fill="none"
          className="stroke-neutral-700/75 light:stroke-zinc-300"
          strokeWidth={1}
        />
        <path
          d={pathD}
          className="fill-goi-gold/22 stroke-goi-gold/75 light:fill-amber-200/45 light:stroke-amber-800/75"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {MUSCLE_OCTAGON_AXES.map((axis, i) => {
          const [lx, ly] = vertexAt(i, rLabel);
          return (
            <text
              key={axis}
              x={lx}
              y={ly}
              textAnchor={labelTextAnchor(i, n)}
              dominantBaseline="middle"
              className="fill-neutral-400 text-[10px] font-semibold uppercase tracking-wide light:fill-zinc-600 sm:text-[11px]"
            >
              {MUSCLE_OCTAGON_LABELS[axis]}
            </text>
          );
        })}
      </svg>
      <p className="w-full max-w-none text-center text-[11px] leading-snug text-neutral-500 light:text-zinc-600 sm:text-xs">
        Forma normalizada al máximo entre ejes. Los datos mejorarán cuando el catálogo etiquete más grupos musculares.
      </p>
    </div>
  );
}
