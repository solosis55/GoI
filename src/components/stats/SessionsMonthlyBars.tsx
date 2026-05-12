import type { MonthBucket } from "../../utils/sessionTimelineStats";

type Props = {
  data: MonthBucket[];
  className?: string;
};

/** Barras: sesiones registradas por mes (últimos meses). */
export function SessionsMonthlyBars({ data, className = "" }: Props) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className={["flex max-w-full items-end justify-between gap-1.5 sm:gap-2", className].filter(Boolean).join(" ")}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold tabular-nums text-neutral-300 light:text-zinc-800">{d.count}</span>
            <div className="relative h-24 w-full overflow-hidden rounded-md bg-neutral-800/25 light:bg-zinc-200/90">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md bg-linear-to-t from-goi-gold/45 to-goi-gold/20 ring-1 ring-goi-gold/35 light:from-goi-gold/55 light:to-goi-gold/[0.18] light:ring-goi-gold/40"
                style={{ height: `${Math.max(pct, d.count > 0 ? 10 : 0)}%` }}
              />
            </div>
            <span className="max-w-full truncate text-center text-[10px] leading-tight text-neutral-500 light:text-zinc-600">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
