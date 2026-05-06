import { useCallback, useEffect, useMemo, useState } from "react";
import { getExercises } from "../api/exercisesApi";
import { createWorkout, deleteWorkout, getWorkouts } from "../api/workoutsApi";
import { getWorkoutSessions } from "../api/workoutSessionsApi";
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
      setError("No se pudo generar un titulo valido para la copia");
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
    <section className="layout grid w-full min-w-0 gap-4">
      <header className="feed-page-header px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">FitSocial</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900 sm:text-2xl">Rutinas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
          Crea rutinas reutilizables, organizalas por etiquetas y evolucionalas con el tiempo.
          {user?.username ? <span className="text-neutral-400 light:text-zinc-700"> Conectado como @{user.username}.</span> : null}
        </p>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="w-full min-w-0 sm:max-w-4xl sm:flex-1">
          <div className="flex flex-col gap-3">
            <p className="text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-goi-gold-dim sm:text-xs">Resumen</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <div className="fs-workout-stat">
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-xs">Plantillas</p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">{pageStats.templateCount}</p>
                <p className="text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Rutinas guardadas</p>
              </div>
              <div className="fs-workout-stat">
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-xs">Entrenamientos totales</p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">{pageStats.totalSessions}</p>
                <p className="text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Entradas en el historial</p>
              </div>
              <div className="fs-workout-stat">
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-goi-gold-dim sm:text-xs">Últimos 7 días</p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-100 light:text-zinc-900 sm:text-3xl">{pageStats.last7Days}</p>
                <p className="text-[11px] leading-snug text-neutral-500 light:text-zinc-600">Ventana móvil desde ahora</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full min-w-0 max-w-sm shrink-0 sm:ml-auto sm:self-start">
          <WorkoutSessionCalendar sessions={sessions} />
        </div>
      </div>

      <StatusMessage tone="dark" loading={loading} error={error} success={message} />

      <Card tone="dark">
        <h2>Crear rutina</h2>
        <p className="text-sm text-neutral-500">
          Desde el editor podras abrir el catalogo de ejercicios y, desde ahi, la ficha de cada uno (nombre, musculos,
          etc.).
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" onClick={onCreateWorkout}>
            Ir al editor de rutinas
          </Button>
        </div>
      </Card>

      <Card tone="dark">
        <h2>Mis rutinas</h2>
        {!loading && workouts.length === 0 && <EmptyState message="Aun no tienes rutinas." />}
        {!loading && workouts.length > 0 && displayedWorkouts.length === 0 && (
          <EmptyState className="mt-2" message="Ninguna rutina coincide con la busqueda o la etiqueta." />
        )}

        {!loading && workouts.length > 0 ? (
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1.5 font-semibold">
              Buscar por titulo
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
                  <option value="recent_session">Ultimo entrenamiento (mas reciente primero)</option>
                  <option value="sessions_desc">Mas entrenamientos registrados</option>
                  <option value="created_desc">Rutina creada mas reciente</option>
                  <option value="title_asc">Titulo A-Z</option>
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
