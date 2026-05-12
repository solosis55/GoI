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

function StatsSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-linear-to-b from-goi-gold via-goi-gold-dim to-goi-gold/50 light:from-goi-gold healthy:from-goi-gold light:via-goi-gold-dim healthy:via-goi-gold-dim light:to-goi-gold healthy:to-goi-gold-dim/72"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-100 light:text-zinc-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs leading-relaxed text-neutral-500 light:text-zinc-600">{subtitle}</p> : null}
      </div>
    </div>
  );
}

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
    <section className="mx-auto w-full max-w-5xl space-y-5 pb-16 md:space-y-6">
      <header className="feed-page-header relative overflow-hidden rounded-2xl border border-neutral-800/75 bg-linear-to-b from-neutral-950 via-neutral-950 to-neutral-950/90 px-4 py-5 shadow-[0_14px_44px_-20px_rgba(0,0,0,0.65)] sm:px-6 sm:py-7 light:border-zinc-200/90 light:from-white light:via-white light:to-zinc-50 light:shadow-[0_14px_40px_-18px_rgba(24,24,27,0.12)]">
        <div
          className="pointer-events-none absolute -right-12 -top-28 size-[22rem] rounded-full bg-goi-gold/[0.085] blur-3xl encendido:bg-orange-400/[0.14] healthy:bg-goi-gold/[0.11]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-zinc-500/[0.07] blur-2xl light:bg-zinc-400/[0.12]"
          aria-hidden
        />
        <div className="relative z-[1]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-goi-gold-dim">Análisis</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-50 sm:text-3xl sm:tracking-tight light:text-zinc-900">
            Estadísticas
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400 light:text-zinc-600">
            {mainTab === "analytics"
              ? "Actividad de entreno, tendencias y distribución por grupos musculares."
              : "Datos corporales solo en este dispositivo y mapa según tus sesiones registradas."}
          </p>
        </div>
      </header>

      <Card tone="dark" className="border-neutral-800/70 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.55)] light:border-zinc-200 light:shadow-[0_12px_36px_-20px_rgba(24,24,27,0.1)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mt-0 text-lg font-semibold tracking-tight text-neutral-100 light:text-zinc-900">Vista</h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
              Gráficas globales o área personal: medidas, peso y silueta.
            </p>
          </div>
        </div>

        <div
          className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-neutral-800/90 bg-black/35 p-1 shadow-inner light:border-zinc-200 light:bg-zinc-100/90"
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
              "flex flex-col items-center justify-center gap-1.5 rounded-lg px-3 py-3 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
              mainTab === "analytics"
                ? "bg-zinc-800/95 text-goi-gold shadow-md ring-1 ring-goi-gold/30 light:bg-white healthy:text-goi-gold-dim light:shadow-sm light:ring-goi-gold/35 healthy:ring-goi-gold/22"
                : "text-neutral-500 hover:bg-neutral-800/45 hover:text-neutral-300 light:text-zinc-500 light:hover:bg-zinc-200/70 light:hover:text-zinc-800",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6 shrink-0" aria-hidden>
              <path
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5 M10 19v-8 M16 19V9 M22 19v-5"
              />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide">Estadísticas</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "personal"}
            aria-label="Personal"
            title="Personal"
            onClick={() => setMainTab("personal")}
            className={[
              "flex flex-col items-center justify-center gap-1.5 rounded-lg px-3 py-3 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
              mainTab === "personal"
                ? "bg-zinc-800/95 text-goi-gold shadow-md ring-1 ring-goi-gold/30 light:bg-white healthy:text-goi-gold-dim light:shadow-sm light:ring-goi-gold/35 healthy:ring-goi-gold/22"
                : "text-neutral-500 hover:bg-neutral-800/45 hover:text-neutral-300 light:text-zinc-500 light:hover:bg-zinc-200/70 light:hover:text-zinc-800",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6 shrink-0" aria-hidden>
              <path
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.5 20.5V19a5.5 5.5 0 0 1 5.5-5.5h0a5.5 5.5 0 0 1 5.5 5.5v1.5"
              />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide">Personal</span>
          </button>
        </div>
      </Card>

      {error ? <StatusMessage tone="dark" error={error} /> : null}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Cargando estadísticas">
          <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-zinc-950/50 p-4 light:border-zinc-200 light:bg-zinc-50">
            <div className="h-4 w-28 animate-pulse rounded-md bg-neutral-700/50 light:bg-zinc-300/80" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-lg bg-neutral-800/40 light:bg-zinc-200/90" />
              <div className="h-20 animate-pulse rounded-lg bg-neutral-800/40 light:bg-zinc-200/90" />
              <div className="h-20 animate-pulse rounded-lg bg-neutral-800/40 light:bg-zinc-200/90" />
            </div>
          </div>
          <div className="h-72 animate-pulse rounded-xl border border-neutral-800/40 bg-neutral-900/30 light:border-zinc-200 light:bg-zinc-100/80" />
        </div>
      ) : mainTab === "personal" ? (
        <StatisticsPersonalTab
          userId={userId}
          sessions={sessions}
          workoutById={workoutById}
          exerciseById={exerciseById}
          onNavigateToAnalyticsRadar={() => {
            setMainTab("analytics");
            window.setTimeout(() => {
              document.getElementById("stats-octagon-radar")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 80);
          }}
        />
      ) : (
        <div className="space-y-5 md:space-y-6">
          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <StatsSectionHeader title="Resumen" subtitle="Totales calculados con las sesiones y rutinas cargadas." />
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="group relative overflow-hidden rounded-xl border border-neutral-800/65 bg-linear-to-br from-black/40 to-black/10 px-3 py-3.5 transition hover:border-goi-gold/35 light:border-zinc-200 light:from-zinc-50 light:to-white light:hover:border-goi-gold/40 healthy:hover:border-goi-gold/35">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Entrenamientos totales
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-goi-gold healthy:text-goi-gold-dim">
                  {summary.totalSessions}
                </dd>
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-neutral-800/65 bg-linear-to-br from-black/40 to-black/10 px-3 py-3.5 transition hover:border-goi-gold/25 light:border-zinc-200 light:from-zinc-50 light:to-white light:hover:border-goi-gold/35 healthy:hover:border-goi-gold/35">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Rutinas creadas
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900">
                  {summary.routines}
                </dd>
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-neutral-800/65 bg-linear-to-br from-black/40 to-black/10 px-3 py-3.5 transition hover:border-goi-gold/25 light:border-zinc-200 light:from-zinc-50 light:to-white light:hover:border-goi-gold/35 healthy:hover:border-goi-gold/35">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 light:text-zinc-600">
                  Esta semana (lun–dom)
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900">
                  {summary.thisWeek}
                </dd>
              </div>
            </dl>
          </Card>

          <Card tone="dark" id="stats-octagon-radar" className="border-neutral-800/70 light:border-zinc-200">
            <StatsSectionHeader
              title="Radar octagonal (grupos musculares)"
              subtitle="Ocho ejes a partir de tus sesiones y el catálogo de ejercicios."
            />
            <div className="mt-5 w-full min-w-0 rounded-lg border border-neutral-800/40 bg-black/20 px-1 py-3 light:border-zinc-200/90 light:bg-zinc-50/80 sm:px-2">
              <OctagonRadarChart hits={octHits} />
            </div>
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <StatsSectionHeader title="Sesiones por mes" subtitle="Últimos seis meses." />
            <SessionsMonthlyBars data={monthly} className="mt-5" />
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <StatsSectionHeader title="Tendencia semanal" subtitle="Últimas ocho semanas completas." />
            <SessionsWeeklyTrend data={weekly} className="mt-5" />
          </Card>

          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <StatsSectionHeader title="Día de la semana" subtitle="Todas tus sesiones registradas (L–D)." />
            <SessionsWeekdayBars sessions={sessions} className="mt-5 px-1" />
          </Card>
        </div>
      )}
    </section>
  );
}
