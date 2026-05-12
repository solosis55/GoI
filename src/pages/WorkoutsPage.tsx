import { useCallback, useEffect, useMemo, useState } from "react";
import { getExercises } from "../api/exercisesApi";
import { createWorkout, deleteWorkout, getWorkouts } from "../api/workoutsApi";
import { getWorkoutSessions } from "../api/workoutSessionsApi";
import { WorkoutsDumbbellIcon } from "../components/icons/WorkoutsDumbbellIcon";
import { WorkoutItem } from "../components/workouts/WorkoutItem";
import { WorkoutSessionCalendar } from "../components/workouts/WorkoutSessionCalendar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../context/AuthContext";
import type { Exercise } from "../types/exercise";
import type { Workout } from "../types/workout";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { getErrorMessage } from "../utils/errorMessages";
import { blocksFromLegacy, cloneBlocks } from "../utils/workoutBlocks";

function StatIconLayers({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-8.6-3.91Z" />
      <path d="M2 12a1 1 0 0 0 .6.92l8.57 3.91a2 2 0 0 0 1.66 0l8.58-3.91A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .6.92l8.57 3.91a2 2 0 0 0 1.66 0l8.58-3.91A1 1 0 0 0 22 17" />
    </svg>
  );
}

function StatIconActivity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function StatIconFlame({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1-2-1-3.5a4 4 0 1 1 8 0c0 3-4 4.5-4 8a4 4 0 1 1-8 0c0-2.5 2-3.5 2-5.5a3 3 0 0 1 3-3c1 0 2 .5 2 2.5Z" />
    </svg>
  );
}

const TITLE_MAX = 80;
const DUPLICATE_SUFFIX = " (copia)";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type SessionStats = { sessionCount: number; lastSessionPerformedAt: string | null };
type WorkoutSortKey = "recent_session" | "sessions_desc" | "created_desc" | "title_asc";
type WorkoutsPageProps = {
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
};

/** Titulo derivado para `POST /workouts`, respeta el limite del backend. */
function titleForDuplicate(sourceTitle: string): string {
  const base = sourceTitle.trimEnd();
  if (base.length + DUPLICATE_SUFFIX.length <= TITLE_MAX) return `${base}${DUPLICATE_SUFFIX}`;
  const room = TITLE_MAX - DUPLICATE_SUFFIX.length;
  const prefix = base.slice(0, Math.max(3, room)).trimEnd();
  return `${prefix}${DUPLICATE_SUFFIX}`.slice(0, TITLE_MAX);
}

function computeSessionStatsByWorkoutId(sessions: WorkoutSessionWithTitle[]): Map<string, SessionStats> {
  const map = new Map<string, SessionStats>();
  for (const s of sessions) {
    const cur = map.get(s.workoutId) ?? { sessionCount: 0, lastSessionPerformedAt: null as string | null };
    cur.sessionCount += 1;
    if (!cur.lastSessionPerformedAt || Date.parse(s.performedAt) > Date.parse(cur.lastSessionPerformedAt)) {
      cur.lastSessionPerformedAt = s.performedAt;
    }
    map.set(s.workoutId, cur);
  }
  return map;
}

function countSessionsInRollingWeek(sessionList: WorkoutSessionWithTitle[]) {
  const now = Date.now();
  const start = now - WEEK_MS;
  return sessionList.filter((s) => {
    const t = Date.parse(s.performedAt);
    return Number.isFinite(t) && t >= start && t <= now;
  }).length;
}

export function WorkoutsPage({ onCreateWorkout, onEditWorkout }: WorkoutsPageProps) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exerciseCatalog, setExerciseCatalog] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<WorkoutSessionWithTitle[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [sortKey, setSortKey] = useState<WorkoutSortKey>("recent_session");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const exerciseById = useMemo(
    () => new Map(exerciseCatalog.map((e) => [e.id, e.name])),
    [exerciseCatalog],
  );

  const sessionStatsByWorkoutId = useMemo(() => computeSessionStatsByWorkoutId(sessions), [sessions]);
  const pageStats = useMemo(
    () => ({
      templateCount: workouts.length,
      totalSessions: sessions.length,
      last7Days: countSessionsInRollingWeek(sessions),
    }),
    [workouts.length, sessions],
  );

  const tagFilterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const w of workouts) for (const t of w.tags ?? []) if (t) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [workouts]);

  const displayedWorkouts = useMemo(() => {
    let list = workouts;
    if (tagFilter) {
      const tagNeedle = tagFilter.toLowerCase();
      list = list.filter((w) => (w.tags ?? []).some((t) => t.toLowerCase() === tagNeedle));
    }
    const q = titleQuery.trim().toLowerCase();
    if (q) list = list.filter((w) => w.title.toLowerCase().includes(q));
    const stats = sessionStatsByWorkoutId;
    return [...list].sort((a, b) => {
      if (sortKey === "title_asc") return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      if (sortKey === "created_desc") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (sortKey === "sessions_desc") {
        const ca = stats.get(a.id)?.sessionCount ?? 0;
        const cb = stats.get(b.id)?.sessionCount ?? 0;
        if (cb !== ca) return cb - ca;
        return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      }
      const ta = stats.get(a.id)?.lastSessionPerformedAt;
      const tb = stats.get(b.id)?.lastSessionPerformedAt;
      if (!ta && !tb) return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (!ta) return 1;
      if (!tb) return -1;
      const diff = Date.parse(tb) - Date.parse(ta);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
    });
  }, [workouts, tagFilter, titleQuery, sortKey, sessionStatsByWorkoutId]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [allWorkouts, sessionList] = await Promise.all([getWorkouts(), getWorkoutSessions()]);
      setWorkouts(allWorkouts.filter((workout) => workout.userId === user.id));
      setSessions(sessionList);
      try {
        setExerciseCatalog(await getExercises());
      } catch {
        setExerciseCatalog([]);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar datos de rutinas"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleDuplicateWorkout(workout: Workout) {
    if (!user) return;
    setError("");
    setMessage("");
    const newTitle = titleForDuplicate(workout.title);
    if (newTitle.trim().length < 3) {
      setError("No se pudo generar un título válido para la copia");
      return;
    }
    try {
      await createWorkout({
        title: newTitle,
        description: workout.description,
        exerciseBlocks: cloneBlocks(blocksFromLegacy(workout.exerciseIds, workout.exerciseBlocks)),
        tags: [...(workout.tags ?? [])],
      });
      await loadData();
      setMessage("Rutina duplicada");
    } catch (dupError) {
      setError(getErrorMessage(dupError, "No se pudo duplicar la rutina"));
    }
  }

  async function handleDeleteWorkout(id: string) {
    if (!window.confirm("Seguro que quieres eliminar esta rutina?")) return;
    setError("");
    setMessage("");
    try {
      await deleteWorkout(id);
      await loadData();
      setMessage("Rutina eliminada");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "No se pudo eliminar"));
    }
  }

  return (
    <section className="layout grid w-full min-w-0 gap-5 lg:gap-6">
      <header className="feed-page-header relative overflow-hidden rounded-2xl border border-neutral-800/75 bg-linear-to-b from-neutral-950 via-neutral-950 to-neutral-950/90 px-4 py-5 shadow-[0_14px_44px_-20px_rgba(0,0,0,0.65)] sm:px-6 sm:py-6 light:border-zinc-200/90 light:from-white light:via-white light:to-zinc-50 light:shadow-[0_14px_40px_-18px_rgba(24,24,27,0.12)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 z-0 h-52 w-52 rounded-full bg-goi-gold/[0.07] blur-3xl encendido:bg-orange-400/14 healthy:bg-goi-gold/[0.11]"
        />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
            <div className="hidden shrink-0 sm:grid sm:size-14 sm:place-items-center sm:rounded-2xl sm:border sm:border-goi-gold/30 sm:bg-goi-gold/[0.09] sm:shadow-inner sm:shadow-black/20 light:sm:bg-goi-gold/[0.1] healthy:sm:bg-goi-gold/[0.08]">
              <WorkoutsDumbbellIcon className="size-8 text-goi-gold healthy:text-goi-gold-dim" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-goi-gold-dim">GoI</p>
                {user?.username ? (
                  <span className="rounded-full border border-neutral-700/85 bg-neutral-900/55 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-400 light:border-zinc-200 light:bg-zinc-100 light:text-zinc-600">
                    @{user.username}
                  </span>
                ) : null}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-50 sm:text-[1.7rem] light:text-zinc-900">Rutinas</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 light:text-zinc-600">
                Crea rutinas reutilizables, organízalas por etiquetas y evoluciónalas con el tiempo. Las plantillas conectan el
                editor, el historial y tu calendario.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-goi-gold-dim sm:text-xs">Resumen</p>
          <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl border border-neutral-800/80 bg-linear-to-br from-neutral-950/90 via-neutral-950/70 to-neutral-900/40 px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] light:border-zinc-200 light:from-white light:via-zinc-50 light:to-white">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-goi-gold/25 bg-goi-gold/[0.08] text-goi-gold shadow-inner shadow-black/15 light:border-goi-gold/35 healthy:border-goi-gold/28 light:bg-goi-gold/[0.1] healthy:bg-goi-gold/[0.08] light:text-goi-gold-dim healthy:text-goi-gold-dim">
                  <StatIconLayers className="size-5" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-[11px]">Plantillas</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">
                    {pageStats.templateCount}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Rutinas guardadas</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl border border-neutral-800/80 bg-linear-to-br from-neutral-950/90 via-neutral-950/70 to-neutral-900/40 px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] light:border-zinc-200 light:from-white light:via-zinc-50 light:to-white">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-goi-gold/25 bg-goi-gold/[0.08] text-goi-gold shadow-inner shadow-black/15 light:border-goi-gold/35 healthy:border-goi-gold/28 light:bg-goi-gold/[0.1] healthy:bg-goi-gold/[0.08] light:text-goi-gold-dim healthy:text-goi-gold-dim">
                  <StatIconActivity className="size-5" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-[11px]">
                    Entrenamientos totales
                  </p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">
                    {pageStats.totalSessions}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Entradas en el historial</p>
                </div>
              </div>
            </div>
            <div className="group relative min-[460px]:col-span-2 lg:col-span-1 overflow-hidden rounded-xl border border-neutral-800/80 bg-linear-to-br from-neutral-950/90 via-neutral-950/70 to-neutral-900/40 px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] light:border-zinc-200 light:from-white light:via-zinc-50 light:to-white">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-goi-gold/25 bg-goi-gold/[0.08] text-goi-gold shadow-inner shadow-black/15 light:border-goi-gold/35 healthy:border-goi-gold/28 light:bg-goi-gold/[0.1] healthy:bg-goi-gold/[0.08] light:text-goi-gold-dim healthy:text-goi-gold-dim">
                  <StatIconFlame className="size-5" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-[11px]">Últimos 7 días</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">
                    {pageStats.last7Days}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Ventana móvil desde ahora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="min-w-0 lg:sticky lg:top-20">
          <WorkoutSessionCalendar sessions={sessions} />
        </div>
      </div>

      <StatusMessage tone="dark" loading={loading} error={error} success={message} />

      <Card
        tone="dark"
        className="relative overflow-hidden rounded-2xl border-goi-gold/25 bg-linear-to-br from-neutral-950 via-neutral-950 to-neutral-900/85 p-5 shadow-[0_18px_48px_-28px_rgba(212,175,55,0.22)] light:border-goi-gold/35 healthy:border-goi-gold/28 light:from-white light:via-white light:to-zinc-50 light:shadow-[0_18px_44px_-26px_rgba(196,81,30,0.14)] healthy:shadow-[0_18px_44px_-26px_rgba(95,116,107,0.12)]"
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-goi-gold/[0.06] blur-3xl encendido:bg-orange-400/12 healthy:bg-goi-gold/[0.09]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-100 light:text-zinc-900">Crear rutina</h2>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
              El editor reúne el formulario y el catálogo de ejercicios en una sola pantalla. Desde ahí también puedes abrir el
              catálogo completo.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <Button type="button" onClick={onCreateWorkout} className="shadow-md shadow-goi-gold/15">
              Ir al editor de rutinas
            </Button>
          </div>
        </div>
      </Card>

      <Card tone="dark" className="rounded-2xl border-neutral-800/80">
        <h2 className="text-lg font-semibold tracking-tight">Mis rutinas</h2>
        {!loading && workouts.length === 0 && (
          <div className="mt-4 space-y-4">
            <EmptyState
              showIcon
              message="Aún no tienes rutinas. Crea una plantilla y cada sesión quedará enlazada en tu historial y en el calendario."
            />
            <ul className="grid gap-2.5 rounded-xl border border-dashed border-neutral-700/70 bg-neutral-950/30 px-4 py-3 text-sm text-neutral-400 light:border-zinc-300 light:bg-zinc-100/80 light:text-zinc-600">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-goi-gold healthy:text-goi-gold" aria-hidden>
                  •
                </span>
                <span>
                  <span className="font-medium text-neutral-300 light:text-zinc-800">Etiquetas:</span> agrupa por objetivo (empuje, tirón, pierna…) para filtrar rápido.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-goi-gold healthy:text-goi-gold" aria-hidden>
                  •
                </span>
                <span>
                  <span className="font-medium text-neutral-300 light:text-zinc-800">Duplicar:</span> clona una rutina cuando quieras una variante sin empezar de cero.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-goi-gold healthy:text-goi-gold" aria-hidden>
                  •
                </span>
                <span>
                  <span className="font-medium text-neutral-300 light:text-zinc-800">Historial:</span> las sesiones registradas alimentan el resumen y el calendario de esta página.
                </span>
              </li>
            </ul>
          </div>
        )}
        {!loading && workouts.length > 0 && displayedWorkouts.length === 0 && (
          <EmptyState className="mt-4" showIcon message="Ninguna rutina coincide con la búsqueda o la etiqueta." />
        )}

        {!loading && workouts.length > 0 ? (
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1.5 font-semibold">
              Buscar por título
              <input className="goi-field" type="search" value={titleQuery} onChange={(event) => setTitleQuery(event.target.value)} placeholder="Ej. pierna, press..." autoComplete="off" />
            </label>
            <div className={tagFilterOptions.length > 0 ? "grid gap-3 sm:grid-cols-2" : "grid max-w-md gap-3"}>
              {tagFilterOptions.length > 0 ? (
                <label className="grid gap-1.5 font-semibold">
                  Filtrar por etiqueta
                  <select className="goi-field" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                    <option value="">Todas</option>
                    {tagFilterOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="grid gap-1.5 font-semibold">
                Ordenar lista
                <select className="goi-field" value={sortKey} onChange={(event) => setSortKey(event.target.value as WorkoutSortKey)}>
                  <option value="recent_session">Último entrenamiento (más reciente primero)</option>
                  <option value="sessions_desc">Más entrenamientos registrados</option>
                  <option value="created_desc">Rutina creada más reciente</option>
                  <option value="title_asc">Título A-Z</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}

        <ul className="workouts-list mt-3 grid list-none gap-2.5 p-0">
          {displayedWorkouts.map((workout) => {
            const stats = sessionStatsByWorkoutId.get(workout.id);
            const exerciseLabels = (workout.exerciseIds ?? []).map(
              (id) => exerciseById.get(id) ?? `Ejercicio (${id.slice(0, 8)}…)`,
            );
            return (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                exerciseLabels={exerciseLabels}
                sessionCount={stats?.sessionCount ?? 0}
                lastSessionPerformedAt={stats?.lastSessionPerformedAt ?? null}
                onEdit={() => onEditWorkout(workout)}
                onDelete={() => handleDeleteWorkout(workout.id)}
                onDuplicate={() => handleDuplicateWorkout(workout)}
              />
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
