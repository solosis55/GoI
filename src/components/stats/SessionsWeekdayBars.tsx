import { sessionsCountsByWeekday, WEEKDAY_LABELS_ES } from "../../utils/sessionTimelineStats";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";

type Props = {
  sessions: WorkoutSessionWithTitle[];
  className?: string;
};

/** Mini barras: distribución de sesiones por día de la semana. */
export function SessionsWeekdayBars({ sessions, className = "" }: Props) {
  const counts = sessionsCountsByWeekday(sessions);
  const max = Math.max(1, ...counts);

  return (
    <div className={["flex items-end justify-between gap-1 sm:gap-2", className].filter(Boolean).join(" ")}>
      {counts.map((c, i) => (
        <div key={WEEKDAY_LABELS_ES[i]} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-semibold tabular-nums text-neutral-400 light:text-zinc-700">{c}</span>
          <div className="flex h-16 w-full flex-col justify-end">
            <div
              className="w-full rounded-sm bg-goi-gold/40 ring-1 ring-goi-gold/30 light:bg-goi-gold/[0.22] light:ring-goi-gold/35 healthy:bg-goi-gold/[0.14] healthy:ring-goi-gold/22"
              style={{ height: `${(c / max) * 100}%`, minHeight: c > 0 ? 6 : 0 }}
            />
          </div>
          <span className="text-[10px] font-medium text-neutral-500 light:text-zinc-600">{WEEKDAY_LABELS_ES[i]}</span>
        </div>
      ))}
    </div>
  );
}
