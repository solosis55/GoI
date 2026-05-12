import type { MusclePentagonAxis } from "../../utils/musclePentagonStats";
import { MUSCLE_PENTAGON_AXES, MUSCLE_PENTAGON_LABELS } from "../../utils/musclePentagonStats";

type MusclePentagonRadarProps = {
  /** Recuentos brutos por eje (se normalizan al máximo del conjunto para la forma). */
  hits: Record<MusclePentagonAxis, number>;
  className?: string;
};

function labelTextAnchor(i: number, n: number): "start" | "middle" | "end" {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const c = Math.cos(angle);
  if (c > 0.35) return "start";
  if (c < -0.35) return "end";
  return "middle";
}

/**
 * Diagrama radial pentagonal (radar) para cinco grupos musculares.
 */
export function MusclePentagonRadar({ hits, className = "" }: MusclePentagonRadarProps) {
  const W = 300;
  const H = 280;
  const cx = W / 2;
  const cy = H / 2;
  const rMax = 66;
  const rLabel = rMax + 28;
  const n = MUSCLE_PENTAGON_AXES.length;

  const values = MUSCLE_PENTAGON_AXES.map((k) => hits[k] ?? 0);
  const maxHit = Math.max(1, ...values);

  function vertexAt(i: number, radius: number): [number, number] {
    const angle = (-Math.PI / 2 + (i * 2 * Math.PI) / n) as number;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  const outerPoints = Array.from({ length: n }, (_, i) => vertexAt(i, rMax));
  const dataPoints = Array.from({ length: n }, (_, i) => {
    const t = values[i]! / maxHit;
    return vertexAt(i, rMax * (0.12 + t * 0.88));
  });

  const pathD =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + " Z";

  const gridLines = outerPoints.map((p, i) => (
    <line
      key={`grid-${i}`}
      x1={cx}
      y1={cy}
      x2={p[0]}
      y2={p[1]}
      className="stroke-neutral-700/85 light:stroke-zinc-300"
      strokeWidth={1}
    />
  ));

  const labels = MUSCLE_PENTAGON_AXES.map((axis, i) => {
    const [lx, ly] = vertexAt(i, rLabel);
    return (
      <text
        key={axis}
        x={lx}
        y={ly}
        textAnchor={labelTextAnchor(i, n)}
        dominantBaseline="middle"
        className="fill-neutral-400 text-[11px] font-semibold uppercase tracking-wide light:fill-zinc-600 sm:text-[12px]"
      >
        {MUSCLE_PENTAGON_LABELS[axis]}
      </text>
    );
  });

  return (
    <div className={["flex w-full flex-col items-center gap-3", className].filter(Boolean).join(" ")}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-[min(100%,340px)] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Distribución aproximada por grupo muscular según tus sesiones registradas."
      >
        <polygon
          points={outerPoints.map((p) => `${p[0]},${p[1]}`).join(" ")}
          fill="none"
          className="stroke-neutral-700/75 light:stroke-zinc-300"
          strokeWidth={1}
        />
        {gridLines}
        <path
          d={pathD}
          className="fill-goi-gold/25 stroke-goi-gold/70 light:fill-amber-200/50 healthy:fill-goi-gold/18 light:stroke-amber-700 healthy:stroke-goi-gold/80"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {labels}
      </svg>
      <p className="w-full max-w-none text-center text-[11px] leading-snug text-neutral-500 light:text-zinc-600 sm:text-xs">
        Forma relativa al máximo en tus datos (no es volumen absoluto). Basado en el catálogo de ejercicios y tus sesiones.
      </p>
    </div>
  );
}
