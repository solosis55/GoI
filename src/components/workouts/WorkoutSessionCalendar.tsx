import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

function dateKeyLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mondayWeekday(d: Date) {
  const w = d.getDay();
  return w === 0 ? 6 : w - 1;
}

type WorkoutSessionCalendarProps = {
  sessions: WorkoutSessionWithTitle[];
};

export function WorkoutSessionCalendar({ sessions }: WorkoutSessionCalendarProps) {
  const now = new Date();
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const viewYear = view.y;
  const viewMonth = view.m;

  const trainedDays = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      const t = Date.parse(s.performedAt);
      if (!Number.isFinite(t)) continue;
      set.add(dateKeyLocal(new Date(t)));
    }
    return set;
  }, [sessions]);

  const monthTitle = useMemo(() => {
    const raw = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
      new Date(viewYear, viewMonth, 1),
    );
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [viewYear, viewMonth]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const padStart = mondayWeekday(first);
    const list: (number | null)[] = [];
    for (let i = 0; i < padStart; i++) list.push(null);
    for (let d = 1; d <= lastDay; d++) list.push(d);
    while (list.length % 7 !== 0) list.push(null);
    while (list.length >= 7 && list.slice(-7).every((x) => x === null)) {
      list.splice(list.length - 7, 7);
    }
    return list;
  }, [viewYear, viewMonth]);

  const todayKey = dateKeyLocal(now);

  function goPrevMonth() {
    setView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  }

  function goNextMonth() {
    setView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  }

  function goThisMonth() {
    const n = new Date();
    setView({ y: n.getFullYear(), m: n.getMonth() });
  }

  return (
    <div className="fs-card-surface flex h-fit w-full min-w-0 flex-col p-3 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Calendario</p>
      <div className="mt-2 flex items-center justify-between gap-2 max-[379px]:flex-col max-[379px]:items-stretch">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-200 light:text-zinc-900 max-[379px]:text-center">{monthTitle}</p>
        <div className="flex shrink-0 items-center gap-1 max-[379px]:justify-center">
          <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs" onClick={goPrevMonth} aria-label="Mes anterior">
            ‹
          </Button>
          <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs" onClick={goThisMonth} aria-label="Ir a hoy">
            Hoy
          </Button>
          <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs" onClick={goNextMonth} aria-label="Mes siguiente">
            ›
          </Button>
        </div>
      </div>
      <p className="mt-1 text-xs leading-snug text-neutral-500">Dias con entrenamiento registrado.</p>

      <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-neutral-500 sm:gap-1 sm:text-xs" role="grid" aria-label="Calendario de entrenamientos">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-0.5 py-0.5 sm:py-1" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="min-h-[1.5rem] sm:min-h-[1.75rem]" />;
          const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const hasSession = trainedDays.has(key);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              role="gridcell"
              className={[
                "flex min-h-[1.5rem] items-center justify-center rounded-md text-xs tabular-nums sm:min-h-[1.75rem] sm:text-sm",
                hasSession ? "bg-goi-gold/20 font-medium text-goi-gold" : "text-neutral-400 light:text-zinc-600",
                isToday && !hasSession ? "ring-1 ring-goi-gold/40 ring-inset" : "",
                isToday && hasSession ? "ring-1 ring-goi-gold/50 ring-inset" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
