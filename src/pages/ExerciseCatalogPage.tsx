import { useCallback, useEffect, useMemo, useState } from "react";
import { getExercises } from "../api/exercisesApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusMessage } from "../components/ui/StatusMessage";
import { CATALOG_EQUIPMENT_OPTIONS } from "../data/exerciseEquipmentFilters";
import { CATALOG_MUSCLE_OPTIONS } from "../data/exerciseMuscleFilters";
import type { Exercise } from "../types/exercise";
import { getErrorMessage } from "../utils/errorMessages";
import { WORKOUT_EXERCISES_MAX } from "../components/workouts/workoutFormLimits";

type ExerciseCatalogPageProps = {
  /** Desde el formulario "Nueva rutina" se ajustan textos (vuelta al editor, no al listado). */
  creationFlowLabel?: "standalone" | "editor";
  onBack: () => void;
  /** Miga de pan: ir al listado de rutinas. */
  onNavigateToRutinas: () => void;
  /** Miga de pan: paso del formulario (Nueva rutina / Editar rutina), solo flujo editor → catalogo. */
  routineFormCrumb?: string;
  /** Miga de pan: volver al formulario en el editor (segmentos "Editor de rutinas" y paso de rutina). */
  onNavigateToEditorForm?: () => void;
  onOpenExerciseDetail: (exerciseId: string) => void;
  onNewRoutineWithExerciseIds: (exerciseIds: string[]) => void;
};

const MUSCLE_LABEL = Object.fromEntries(
  CATALOG_MUSCLE_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

const EQUIPMENT_LABEL = Object.fromEntries(
  CATALOG_EQUIPMENT_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

export function ExerciseCatalogPage({
  creationFlowLabel = "standalone",
  onBack,
  onNavigateToRutinas,
  routineFormCrumb,
  onNavigateToEditorForm,
  onOpenExerciseDetail,
  onNewRoutineWithExerciseIds,
}: ExerciseCatalogPageProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeMuscleSlugs, setActiveMuscleSlugs] = useState<string[]>([]);
  const [activeEquipmentSlugs, setActiveEquipmentSlugs] = useState<string[]>([]);
  const [pickedOrder, setPickedOrder] = useState<string[]>([]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getExercises();
      setExercises(list);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el catalogo"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const filtered = useMemo(() => {
    let list = exercises;
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
    if (activeMuscleSlugs.length > 0) {
      const sel = new Set(activeMuscleSlugs);
      list = list.filter((e) => {
        const m = e.muscles ?? [];
        return m.some((muscle) => sel.has(muscle));
      });
    }
    if (activeEquipmentSlugs.length > 0) {
      const sel = new Set(activeEquipmentSlugs);
      list = list.filter((e) => {
        const t = e.equipmentTags ?? [];
        return t.some((slug) => sel.has(slug));
      });
    }
    return list;
  }, [exercises, query, activeMuscleSlugs, activeEquipmentSlugs]);

  function toggleMuscleFilter(slug: string) {
    setActiveMuscleSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function clearMuscleFilters() {
    setActiveMuscleSlugs([]);
  }

  function toggleEquipmentFilter(slug: string) {
    setActiveEquipmentSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function clearEquipmentFilters() {
    setActiveEquipmentSlugs([]);
  }

  function togglePick(id: string) {
    setPickedOrder((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= WORKOUT_EXERCISES_MAX) return prev;
      return [...prev, id];
    });
  }

  function handleSingleExercise(id: string) {
    onNewRoutineWithExerciseIds([id]);
  }

  function handleBulkCreate() {
    if (pickedOrder.length === 0) return;
    onNewRoutineWithExerciseIds([...pickedOrder]);
  }

  return (
    <section className="layout grid w-full min-w-0 gap-4">
      <header className="feed-page-header px-4 py-4 sm:px-5 sm:py-5">
        <nav className="mb-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500" aria-label="Miga de pan">
          <button
            type="button"
            className="rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
            onClick={onNavigateToRutinas}
          >
            Rutinas
          </button>
          <span className="text-neutral-600">/</span>
          {routineFormCrumb && onNavigateToEditorForm ? (
            <>
              <button
                type="button"
                className="rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
                onClick={onNavigateToEditorForm}
              >
                Editor de rutinas
              </button>
              <span className="text-neutral-600">/</span>
              <button
                type="button"
                className="max-w-[min(100%,12rem)] truncate rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
                onClick={onNavigateToEditorForm}
              >
                {routineFormCrumb}
              </button>
              <span className="text-neutral-600">/</span>
            </>
          ) : null}
          <span className="rounded-full border border-goi-gold/30 bg-goi-gold/15 px-2 py-0.5 font-medium text-goi-gold">
            Catalogo
          </span>
        </nav>
        <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Catalogo</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900 sm:text-2xl">Catalogo de ejercicios</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
          Filtra por nombre, musculos y tipo de material. Puedes combinar filtros: entre categorias deben cumplirse todos los
          grupos activos; dentro de musculos o de material, basta con coincidir con una etiqueta. Marca filas para la rutina o
          abre la ficha.
        </p>
      </header>

      <Card tone="dark">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid min-w-0 flex-1 gap-1.5 font-semibold">
            Buscar por nombre
            <input
              className="goi-field"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre del ejercicio…"
              autoComplete="off"
              aria-label="Filtrar ejercicios por nombre"
            />
          </label>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={onBack}>
              {creationFlowLabel === "editor" ? "Volver al formulario" : "Volver al panel"}
            </Button>
            <Button type="button" disabled={pickedOrder.length === 0} onClick={handleBulkCreate}>
              {creationFlowLabel === "editor"
                ? `Llevar seleccion al editor (${pickedOrder.length > 0 ? pickedOrder.length : "…"})`
                : `Nueva rutina (${pickedOrder.length > 0 ? pickedOrder.length : "…"})`}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Musculos</span>
            {activeMuscleSlugs.length > 0 ? (
              <button
                type="button"
                className="text-xs text-goi-gold underline-offset-2 hover:text-goi-gold/90 hover:underline"
                onClick={clearMuscleFilters}
              >
                Quitar filtros musculares
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por grupo muscular">
            {CATALOG_MUSCLE_OPTIONS.map(({ slug, label }) => {
              const active = activeMuscleSlugs.includes(slug);
              return (
                <Button
                  key={slug}
                  type="button"
                  variant={active ? "navActive" : "secondary"}
                  className="!px-2.5 !py-1.5 text-xs"
                  onClick={() => toggleMuscleFilter(slug)}
                  aria-pressed={active}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Material</span>
            {activeEquipmentSlugs.length > 0 ? (
              <button
                type="button"
                className="text-xs text-goi-gold underline-offset-2 hover:text-goi-gold/90 hover:underline"
                onClick={clearEquipmentFilters}
              >
                Quitar filtros de material
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de material">
            {CATALOG_EQUIPMENT_OPTIONS.map(({ slug, label }) => {
              const active = activeEquipmentSlugs.includes(slug);
              return (
                <Button
                  key={slug}
                  type="button"
                  variant={active ? "navActive" : "secondary"}
                  className="!px-2.5 !py-1.5 text-xs"
                  onClick={() => toggleEquipmentFilter(slug)}
                  aria-pressed={active}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        <StatusMessage tone="dark" loading={loading} error={error} />

        {!loading && !error && (
          <p className="text-sm text-neutral-500">
            {filtered.length === exercises.length &&
            query.trim() === "" &&
            activeMuscleSlugs.length === 0 &&
            activeEquipmentSlugs.length === 0
              ? `${exercises.length} ejercicios en el catalogo.`
              : `${filtered.length} resultado${filtered.length === 1 ? "" : "s"} (${exercises.length} en total).`}
            {pickedOrder.length > 0 ? (
              <span className="text-neutral-400">
                {" "}
                Seleccionados: {pickedOrder.length}/{WORKOUT_EXERCISES_MAX} (orden de seleccion).
              </span>
            ) : null}
          </p>
        )}

        {!loading && !error && filtered.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Ningun resultado. Prueba otro termino.</p>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <ul className="mt-3 grid list-none gap-2 p-0" aria-label="Lista de ejercicios">
            {filtered.map((ex) => {
              const checked = pickedOrder.includes(ex.id);
              return (
                <li
                  key={ex.id}
                  className="fs-muted-well flex flex-wrap items-center gap-3 px-3 py-2.5 max-sm:flex-col max-sm:items-stretch"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-neutral-600 bg-neutral-950 text-goi-gold focus:ring-goi-gold/40 light:bg-white light:border-zinc-400"
                      checked={checked}
                      onChange={() => togglePick(ex.id)}
                      aria-label={`Seleccionar ${ex.name}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-200">{ex.name}</span>
                      {ex.description ? (
                        <span className="mt-1 block text-xs leading-snug text-neutral-500 line-clamp-2">{ex.description}</span>
                      ) : null}
                      {ex.equipmentTags && ex.equipmentTags.length > 0 ? (
                        <span className="mt-1 block text-xs text-neutral-400">
                          {ex.equipmentTags.map((s) => EQUIPMENT_LABEL[s] ?? s).join(" · ")}
                        </span>
                      ) : null}
                      {ex.muscles && ex.muscles.length > 0 ? (
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {ex.muscles.map((s) => MUSCLE_LABEL[s] ?? s).join(" · ")}
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <div className="flex shrink-0 flex-wrap gap-2 max-sm:w-full max-sm:justify-stretch">
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-xs sm:text-sm"
                      onClick={() => onOpenExerciseDetail(ex.id)}
                    >
                      Ver ficha
                    </Button>
                    <Button type="button" variant="secondary" className="text-xs sm:text-sm" onClick={() => handleSingleExercise(ex.id)}>
                      {creationFlowLabel === "editor" ? "Añadir este al formulario" : "Solo este — nueva rutina"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Card>
    </section>
  );
}
