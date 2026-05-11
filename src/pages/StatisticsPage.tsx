import { useEffect, useMemo, useState } from "react";
import { getExercises } from "../api/exercisesApi";
import { getWorkoutSessions } from "../api/workoutSessionsApi";
import { getWorkouts } from "../api/workoutsApi";
import { OctagonRadarChart } from "../components/stats/OctagonRadarChart";
import { SessionsMonthlyBars } from "../components/stats/SessionsMonthlyBars";
import { SessionsWeekdayBars } from "../components/stats/SessionsWeekdayBars";
import { SessionsWeeklyTrend } from "../components/stats/SessionsWeeklyTrend";
import { StatisticsPersonalTab } from "../components/stats/StatisticsPersonalTab";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../context/AuthContext";
import type { Exercise } from "../types/exercise";
import type { Workout } from "../types/workout";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { getErrorMessage } from "../utils/errorMessages";
import { aggregateMuscleHitsOctagon } from "../utils/muscleOctagonStats";
import { countSessionsThisWeek } from "../utils/musclePentagonStats";
import { sessionsCountsByMonth, sessionsCountsByWeek } from "../utils/sessionTimelineStats";

type StatsMainTab = "analytics" | "personal";

export function StatisticsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [mainTab, setMainTab] = useState<StatsMainTab>("analytics");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSessionWithTitle[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [wRaw, sess, ex] = await Promise.all([
          getWorkouts(),
          getWorkoutSessions(),
          getExercises(),
        ]);
        if (cancelled) return;
        const mine = wRaw.filter((x) => x.userId === userId);
        setWorkouts(mine);
        setSessions(sess);
        setExercises(ex);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "No se pudieron cargar las estadísticas"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const workoutById = useMemo(() => new Map(workouts.map((w) => [w.id, w])), [workouts]);
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const octHits = useMemo(
    () => aggregateMuscleHitsOctagon(sessions, workoutById, exerciseById),
    [sessions, workoutById, exerciseById],
  );

  const monthly = useMemo(() => sessionsCountsByMonth(sessions, 6), [sessions]);
  const weekly = useMemo(() => sessionsCountsByWeek(sessions, 8), [sessions]);

  const summary = useMemo(
    () => ({
      totalSessions: sessions.length,
      routines: workouts.length,
      thisWeek: countSessionsThisWeek(sessions),
    }),
    [sessions, workouts.length],
  );

  if (!userId) {
    return (
      <EmptyState showIcon message="Inicia sesión para ver tus estadísticas." className="mt-8" />
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 pb-16">
      <header className="feed-page-header relative overflow-hidden rounded-2xl border border-neutral-800/75 bg-linear-to-b from-neutral-950 via-neutral-950 to-neutral-950/90 px-4 py-5 shadow-[0_14px_44px_-20px_rgba(0,0,0,0.65)] sm:px-6 sm:py-6 light:border-zinc-200/90 light:from-white light:via-white light:to-zinc-50">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-goi-gold-dim">Análisis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-50 light:text-zinc-900">Estadísticas</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400 light:text-zinc-600">
          {mainTab === "analytics"
            ? "Actividad de entreno, tendencias y distribución por grupos musculares."
            : "Datos corporales solo en este dispositivo y mapa según tus sesiones registradas."}
        </p>
      </header>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="mt-0 text-lg font-semibold text-neutral-100 light:text-zinc-900">Vista</h2>
        <p className="mt-1 text-sm text-neutral-500 light:text-zinc-600">
          Cambia entre las gráficas globales y tu área personal (medidas, peso y silueta).
        </p>

        <div
          className="mt-4 flex items-end justify-center gap-12 border-b border-neutral-800 pb-2 sm:gap-16 light:border-zinc-200"
          role="tablist"
          aria-label="Secciones de estadísticas"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "analytics"}
            aria-label="Estadísticas"
            title="Estadísticas"
            onClick={() => setMainTab("analytics")}
            className={[
              "inline-flex flex-col items-center rounded-lg px-3 pt-2 outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
              mainTab === "analytics"
                ? "border-t-2 border-goi-gold text-goi-gold light:border-amber-600 light:text-amber-800"
                : "border-t-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-500 light:hover:text-zinc-800",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
              <path
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5 M10 19v-8 M16 19V9 M22 19v-5"
              />
            </svg>
            <span
              className={[
                "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                mainTab === "analytics"
                  ? "text-goi-gold light:text-amber-900"
                  : "text-neutral-500 light:text-zinc-500",
              ].join(" ")}
            >
              Estadísticas
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "personal"}
            aria-label="Personal"
            title="Personal"
            onClick={() => setMainTab("personal")}
            className={[
              "inline-flex flex-col items-center rounded-lg px-3 pt-2 outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
              mainTab === "personal"
                ? "border-t-2 border-goi-gold text-goi-gold light:border-amber-600 light:text-amber-800"
                : "border-t-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-500 light:hover:text-zinc-800",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
              <path
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.5 20.5V19a5.5 5.5 0 0 1 5.5-5.5h0a5.5 5.5 0 0 1 5.5 5.5v1.5"
              />
            </svg>
            <span
              className={[
                "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                mainTab === "personal"
                  ? "text-goi-gold light:text-amber-900"
                  : "text-neutral-500 light:text-zinc-500",
              ].join(" ")}
            >
              Personal
            </span>
          </button>
        </div>
      </Card>

      {error ? <StatusMessage tone="dark" error={error} /> : null}

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          <div className="h-24 animate-pulse rounded-xl bg-neutral-800/40 light:bg-zinc-200/80" />
          <div className="h-64 animate-pulse rounded-xl bg-neutral-800/40 light:bg-zinc-200/80" />
        </div>
      ) : mainTab === "personal" ? (
        <StatisticsPersonalTab userId={userId} octHits={octHits} />
      ) : (
        <>
          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Resumen</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-800/60 bg-black/25 px-3 py-3 light:border-zinc-200 light:bg-zinc-50">
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Entrenamientos totales
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-goi-gold light:text-amber-900">
                  {summary.totalSessions}
                </dd>
              </div>
              <div className="rounded-xl border border-neutral-800/60 bg-black/25 px-3 py-3 light:border-zinc-200 light:bg-zinc-50">
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Rutinas creadas
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-neutral-100 light:text-zinc-900">
                  {summary.routines}
                </dd>
              </div>
              <div className="rounded-xl border border-neutral-800/60 bg-black/25 px-3 py-3 light:border-zinc-200 light:bg-zinc-50">
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Esta semana (lun–dom)
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-neutral-100 light:text-zinc-900">
                  {summary.thisWeek}
                </dd>
              </div>
            </dl>
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Radar octogonal (grupos musculares)</h2>
            <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
              Ocho ejes a partir de tus sesiones y el catálogo de ejercicios.
            </p>
            <div className="mt-4 w-full min-w-0">
              <OctagonRadarChart hits={octHits} />
            </div>
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Sesiones por mes</h2>
            <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">Últimos seis meses.</p>
            <SessionsMonthlyBars data={monthly} className="mt-4" />
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Tendencia semanal</h2>
            <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">Últimas ocho semanas completas.</p>
            <SessionsWeeklyTrend data={weekly} className="mt-4" />
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Día de la semana</h2>
            <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
              Todas tus sesiones registradas (L–D).
            </p>
            <SessionsWeekdayBars sessions={sessions} className="mt-4 px-1" />
          </Card>
        </>
      )}
    </section>
  );
}
