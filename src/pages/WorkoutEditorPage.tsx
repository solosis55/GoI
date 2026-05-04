import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getExercises } from "../api/exercisesApi";
import { createWorkout, updateWorkout } from "../api/workoutsApi";
import { WorkoutForm } from "../components/workouts/WorkoutForm";
import {
  WORKOUT_DESCRIPTION_MAX,
  WORKOUT_EXERCISES_MAX,
  WORKOUT_TITLE_MIN,
} from "../components/workouts/workoutFormLimits";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusMessage } from "../components/ui/StatusMessage";
import type { Exercise } from "../types/exercise";
import type { Workout } from "../types/workout";
import { getErrorMessage } from "../utils/errorMessages";
import {
  clearWorkoutCreateDraft,
  readWorkoutCreateDraft,
  writeWorkoutCreateDraft,
} from "../utils/workoutCreateDraft";

export type WorkoutEditorMode =
  | { mode: "create"; initialExerciseIds?: string[] }
  | { mode: "edit"; workout: Workout };

type WorkoutEditorPageProps = {
  mode: WorkoutEditorMode;
  onBack: () => void;
  onSaved: () => void;
  /** Navegacion a la pagina de catalogo (p. ej. para ampliar busqueda). */
  onBrowseCatalog?: () => void;
};

function normalizeNonEmptyLines(lines: string[]) {
  return lines.map((item) => item.trim()).filter(Boolean);
}

export function WorkoutEditorPage({ mode, onBack, onSaved, onBrowseCatalog }: WorkoutEditorPageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exerciseIds, setExerciseIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([""]);
  const [exerciseCatalog, setExerciseCatalog] = useState<Exercise[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Evita sobrescribir el borrador en sessionStorage antes de hidratar desde el mismo borrador. */
  const [createDraftReady, setCreateDraftReady] = useState(false);

  useEffect(() => {
    void getExercises()
      .then((list) => {
        setExerciseCatalog(list);
        setCatalogError(null);
      })
      .catch((err) => {
        setCatalogError(getErrorMessage(err, "No se pudo cargar el catalogo de ejercicios"));
      })
      .finally(() => {
        setCatalogLoading(false);
      });
  }, []);

  const editWorkoutId = mode.mode === "edit" ? mode.workout.id : "";
  const appendExerciseIdsKey =
    mode.mode === "create" && mode.initialExerciseIds?.length
      ? mode.initialExerciseIds.join("\u0001")
      : "";

  useEffect(() => {
    setError("");
    if (mode.mode === "edit") {
      const w = mode.workout;
      setTitle(w.title);
      setDescription(w.description);
      setExerciseIds([...(w.exerciseIds ?? [])]);
      setTags((w.tags ?? []).length > 0 ? [...(w.tags ?? [])] : [""]);
      setCreateDraftReady(false);
      return;
    }

    setCreateDraftReady(false);
    const d = readWorkoutCreateDraft();
    let nextTitle = d?.title ?? "";
    let nextDesc = d?.description ?? "";
    let nextIds = [...(d?.exerciseIds ?? [])].slice(0, WORKOUT_EXERCISES_MAX);
    const rawTags = d?.tags?.length ? [...d.tags] : [""];

    if (mode.initialExerciseIds?.length) {
      for (const id of mode.initialExerciseIds) {
        if (nextIds.length >= WORKOUT_EXERCISES_MAX) break;
        if (!nextIds.includes(id)) nextIds.push(id);
      }
    }

    setTitle(nextTitle);
    setDescription(nextDesc);
    setExerciseIds(nextIds);
    setTags(rawTags.length ? rawTags : [""]);
    setCreateDraftReady(true);
  }, [mode.mode, editWorkoutId, appendExerciseIdsKey]);

  useEffect(() => {
    if (mode.mode !== "create" || !createDraftReady) return;
    writeWorkoutCreateDraft({
      title,
      description,
      exerciseIds,
      tags,
    });
  }, [mode.mode, createDraftReady, title, description, exerciseIds, tags]);

  const exerciseById = useMemo(() => new Map(exerciseCatalog.map((e) => [e.id, e])), [exerciseCatalog]);

  const previewTags = useMemo(
    () => normalizeNonEmptyLines(tags),
    [tags],
  );
  const previewExerciseNames = useMemo(
    () => exerciseIds.map((id) => exerciseById.get(id)?.name ?? "…"),
    [exerciseIds, exerciseById],
  );

  const isEdit = mode.mode === "edit";
  const breadcrumbLeaf = isEdit ? "Editar rutina" : "Nueva rutina";
  const pageTitle = isEdit ? "Editar rutina" : "Nueva rutina";
  const headerLine = isEdit ? (
    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
      Cambios en{" "}
      <span className="font-medium text-neutral-400">
        {mode.workout.title.length > 48 ? `${mode.workout.title.slice(0, 45)}…` : mode.workout.title}
      </span>
      . Al guardar volveras al listado.
    </p>
  ) : (
    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
      Define tu rutina eligiendo ejercicios del catalogo. Luego volveras al panel de rutinas.
    </p>
  );

  function handleBack() {
    onBack();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (title.trim().length < WORKOUT_TITLE_MIN) {
      setLoading(false);
      setError("El titulo debe tener al menos 3 caracteres");
      return;
    }
    if (description.length > WORKOUT_DESCRIPTION_MAX) {
      setLoading(false);
      setError("La descripcion no puede superar 280 caracteres");
      return;
    }

    const tagList = normalizeNonEmptyLines(tags);

    if (exerciseIds.length > WORKOUT_EXERCISES_MAX) {
      setLoading(false);
      setError(`Como maximo ${WORKOUT_EXERCISES_MAX} ejercicios`);
      return;
    }

    try {
      if (mode.mode === "edit") {
        await updateWorkout(mode.workout.id, {
          title,
          description,
          exerciseIds,
          tags: tagList,
        });
      } else {
        await createWorkout({ title, description, exerciseIds, tags: tagList });
        clearWorkoutCreateDraft();
      }
      onSaved();
    } catch (submitError) {
      setError(getErrorMessage(submitError, isEdit ? "No se pudo actualizar la rutina" : "No se pudo crear la rutina"));
      setLoading(false);
    }
  }

  return (
    <section className="layout grid w-full min-w-0 gap-4">
      <header className="rounded-lg border border-neutral-800 bg-zinc-950/90 px-4 py-4 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.07)] sm:px-5 sm:py-5">
        <nav className="mb-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500" aria-label="Miga de pan">
          <button
            type="button"
            className="rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
            onClick={handleBack}
          >
            Rutinas
          </button>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-500">Editor de rutinas</span>
          <span className="text-neutral-600">/</span>
          <span className="max-w-[min(100%,14rem)] truncate rounded-full border border-goi-gold/30 bg-goi-gold/15 px-2 py-0.5 font-medium text-goi-gold">
            {breadcrumbLeaf}
          </span>
        </nav>
        <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Editor de rutinas</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl">{pageTitle}</h1>
        {headerLine}
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <Card tone="dark">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2>{isEdit ? "Detalle de la rutina" : "Formulario"}</h2>
            <div className="flex flex-wrap gap-2">
              {onBrowseCatalog ? (
                <Button type="button" variant="secondary" onClick={onBrowseCatalog} disabled={loading}>
                  Ver catalogo
                </Button>
              ) : null}
              <Button type="button" variant="secondary" onClick={handleBack} disabled={loading}>
                Volver
              </Button>
            </div>
          </div>
          <StatusMessage tone="dark" loading={loading} error={error} />
          <WorkoutForm
            title={title}
            description={description}
            exerciseIds={exerciseIds}
            tags={tags}
            exerciseCatalog={exerciseCatalog}
            exerciseCatalogError={catalogError}
            exerciseCatalogLoading={catalogLoading}
            onChangeTitle={setTitle}
            onChangeDescription={setDescription}
            onChangeExerciseIds={setExerciseIds}
            onChangeTags={setTags}
            onSubmit={handleSubmit}
            submitLabel={loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar rutina"}
            onCancel={handleBack}
            onOpenCatalog={onBrowseCatalog}
            disabled={loading}
          />
        </Card>

        <aside
          className="hidden min-w-0 lg:block lg:sticky lg:top-4"
          aria-label="Vista previa de la rutina"
        >
          <div className="flex h-fit flex-col gap-3 rounded-lg border border-neutral-800 bg-zinc-950/80 p-4 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.05)]">
            <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Vista previa</p>
            <div className="rounded-lg border border-neutral-800/90 bg-black/35 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <strong className="block text-neutral-100">
                {title.trim() || "Sin titulo"}
              </strong>
              <p className="mt-1 text-sm text-goi-steel">
                {description.trim() || "Sin descripcion"}
              </p>
              {previewTags.length > 0 ? (
                <>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">Etiquetas</p>
                  <ul className="mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
                    {previewTags.map((tag, tIdx) => (
                      <li key={`${tag}-${tIdx}`}>
                        <span className="inline-block rounded-full border border-goi-gold-dim/35 bg-neutral-950 px-2 py-0.5 text-xs text-goi-steel">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">Ejercicios</p>
              {previewExerciseNames.length > 0 ? (
                <ol className="mt-1.5 max-w-xl list-inside list-decimal space-y-1 pl-0.5 text-sm text-goi-steel">
                  {previewExerciseNames.map((name, idx) => (
                    <li key={`pv-${idx}`} className="break-words pl-1">
                      {catalogLoading && !exerciseById.size ? "…" : name}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-1 text-sm text-neutral-500">Elige ejercicios a la izquierda.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
