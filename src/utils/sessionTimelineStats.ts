import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { startOfWeekMonday } from "./musclePentagonStats";

export type MonthBucket = { key: string; label: string; count: number };

/** Últimos `monthsBack` meses calendario (incluye mes actual). */
export function sessionsCountsByMonth(
  sessions: WorkoutSessionWithTitle[],
  monthsBack: number,
  now = new Date(),
): MonthBucket[] {
  const rows: MonthBucket[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label =
      d.toLocaleDateString("es-ES", { month: "short", year: "numeric" }).replace(/\.$/, "") ?? key;
    rows.push({ key, label, count: 0 });
  }
  for (const s of sessions) {
    const dt = new Date(s.performedAt);
    if (Number.isNaN(dt.getTime())) continue;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const row = rows.find((r) => r.key === key);
    if (row) row.count += 1;
  }
  return rows;
}

export type WeekBucket = { label: string; count: number };

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const a = start.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const b = end.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${a} – ${b}`;
}

/** Semanas completas (lun–dom) hacia atrás desde la semana actual. */
export function sessionsCountsByWeek(
  sessions: WorkoutSessionWithTitle[],
  weeksBack: number,
  now = new Date(),
): WeekBucket[] {
  const currentWeekStart = startOfWeekMonday(now);
  const rows: { startMs: number; endMs: number; label: string; count: number }[] = [];

  for (let i = weeksBack - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    ws.setHours(0, 0, 0, 0);
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    const startMs = ws.getTime();
    const endMs = we.getTime();
    rows.push({
      startMs,
      endMs,
      label: formatWeekRange(ws),
      count: 0,
    });
  }

  for (const s of sessions) {
    const t = Date.parse(s.performedAt);
    if (!Number.isFinite(t)) continue;
    for (const row of rows) {
      if (t >= row.startMs && t < row.endMs) {
        row.count += 1;
        break;
      }
    }
  }

  return rows.map(({ label, count }) => ({ label, count }));
}

/** Conteo por día de la semana (Lun=0 … Dom=6) según hora local. */
export function sessionsCountsByWeekday(sessions: WorkoutSessionWithTitle[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const s of sessions) {
    const day = new Date(s.performedAt).getDay();
    const idx = day === 0 ? 6 : day - 1;
    counts[idx] += 1;
  }
  return counts;
}

export const WEEKDAY_LABELS_ES = ["L", "M", "X", "J", "V", "S", "D"];
