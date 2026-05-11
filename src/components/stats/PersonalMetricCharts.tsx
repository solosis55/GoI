import { useId, useMemo } from "react";
import type { BodySnapshot } from "../../utils/personalBodyPrefs";

type Point = { t: number; v: number };

function extractSeries(
  history: BodySnapshot[],
  pick: (m: BodySnapshot["metrics"]) => number | null,
): Point[] {
  const pts: Point[] = [];
  for (const h of history) {
    const v = pick(h.metrics);
    if (v == null) continue;
    pts.push({ t: new Date(h.at).getTime(), v });
  }
  pts.sort((a, b) => a.t - b.t);
  return pts;
}

type MiniChartProps = {
  title: string;
  points: Point[];
  unit: string;
  accentClass?: string;
};

function MiniLineChart({ title, points, unit, accentClass = "stroke-goi-gold" }: MiniChartProps) {
  const gradId = useId().replace(/:/g, "");

  const chart = useMemo(() => {
    if (points.length === 0) return null;
    const vals = points.map((p) => p.v);
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.12 || 0.5;
    min -= pad;
    max += pad;
    const W = 320;
    const H = 120;
    const pl = 36;
    const pr = 12;
    const pt = 14;
    const pb = 24;
    const iw = W - pl - pr;
    const ih = H - pt - pb;
    const t0 = points[0]!.t;
    const t1 = points[points.length - 1]!.t;
    const tr = Math.max(1, t1 - t0);
    const mapX = (t: number) => pl + ((t - t0) / tr) * iw;
    const mapY = (v: number) => pt + ih - ((v - min) / (max - min)) * ih;
    const pathD = points
      .map((p, i) => {
        const x = mapX(p.t);
        const y = mapY(p.v);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const areaD = `${pathD} L ${mapX(last.t).toFixed(1)} ${(pt + ih).toFixed(1)} L ${mapX(first.t).toFixed(1)} ${(pt + ih).toFixed(1)} Z`;
    return { pathD, areaD, mapX, mapY, W, H, pl, pr, pt, ih, min, max };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800/60 bg-black/20 px-3 py-4 light:border-zinc-200 light:bg-zinc-50">
        <p className="text-xs font-semibold text-neutral-200 light:text-zinc-900">{title}</p>
        <p className="mt-2 text-xs text-neutral-500 light:text-zinc-600">Sin datos en el historial todavía.</p>
      </div>
    );
  }

  if (!chart) return null;
  const { pathD, areaD, mapX, mapY, W, H, pl, pr, pt, ih, min, max } = chart;

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-black/20 px-3 py-3 light:border-zinc-200 light:bg-zinc-50">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-neutral-200 light:text-zinc-900">{title}</p>
        <span className="text-[10px] text-neutral-500 light:text-zinc-600">{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" preserveAspectRatio="xMidYMid meet" role="img">
        <title>{title}</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(212 175 55)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(212 175 55)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line
          x1={pl}
          y1={pt + ih}
          x2={W - pr}
          y2={pt + ih}
          stroke="currentColor"
          className="text-neutral-700 light:text-zinc-300"
          strokeWidth={1}
        />
        <path d={areaD} fill={`url(#${gradId})`} className="light:opacity-90" />
        <path
          d={pathD}
          fill="none"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={accentClass}
        />
        {points.map((p) => (
          <circle
            key={`${p.t}-${p.v}`}
            cx={mapX(p.t)}
            cy={mapY(p.v)}
            r={3.5}
            className="fill-goi-gold light:fill-amber-800"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={0.5}
          />
        ))}
        <text x={pl - 4} y={pt + 4} className="fill-neutral-500 text-[9px] light:fill-zinc-600" textAnchor="end">
          {max.toFixed(1)}
        </text>
        <text x={pl - 4} y={pt + ih} className="fill-neutral-500 text-[9px] light:fill-zinc-600" textAnchor="end">
          {min.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}

type PersonalMetricChartsProps = {
  history: BodySnapshot[];
  className?: string;
};

export function PersonalMetricCharts({ history, className = "" }: PersonalMetricChartsProps) {
  const weightPts = useMemo(
    () => extractSeries(history, (m) => (m.weightKg != null ? m.weightKg : null)),
    [history],
  );
  const waistPts = useMemo(
    () => extractSeries(history, (m) => (m.waistCm != null ? m.waistCm : null)),
    [history],
  );
  const fatPts = useMemo(
    () => extractSeries(history, (m) => (m.bodyFatPercent != null ? m.bodyFatPercent : null)),
    [history],
  );

  return (
    <div className={["grid gap-4 md:grid-cols-2 xl:grid-cols-3", className].filter(Boolean).join(" ")}>
      <MiniLineChart title="Peso" points={weightPts} unit="kg" />
      <MiniLineChart title="Cintura" points={waistPts} unit="cm" />
      <MiniLineChart title="% grasa" points={fatPts} unit="%" />
    </div>
  );
}
