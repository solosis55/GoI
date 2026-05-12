import type { FormEvent } from "react";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock } from "../../types/workout";
import { Button } from "../ui/Button";
import { ExercisePicker } from "./ExercisePicker";
import { WORKOUT_DESCRIPTION_MAX, WORKOUT_TITLE_MAX, WORKOUT_TITLE_MIN } from "./workoutFormLimits";

type WorkoutFormProps = {
  title: string;
  description: string;
  exerciseBlocks: WorkoutExerciseBlock[];
  exerciseCatalog: Exercise[];
  exerciseCatalogError?: string | null;
  exerciseCatalogLoading?: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeExerciseBlocks: (value: WorkoutExerciseBlock[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  onCancel?: () => void;
  /** Si existe, añadir ejercicios abre el catalogo en lugar del buscador embebido. */
  onOpenCatalog?: () => void;
  /** Oculta buscador y botón de catálogo en el formulario (catálogo en panel aparte). */
  omitEmbeddedCatalogUi?: boolean;
  /** Placeholder de foto en cada ejercicio del selector (solo vista «Formulario» del editor). */
  showExerciseBlockPhotos?: boolean;
  disabled?: boolean;
};

export function WorkoutForm({
  title,
  description,
  exerciseBlocks,
  exerciseCatalog,
  exerciseCatalogError,
  exerciseCatalogLoading,
  onChangeTitle,
  onChangeDescription,
  onChangeExerciseBlocks,
  onSubmit,
  submitLabel,
  onCancel,
  onOpenCatalog,
  omitEmbeddedCatalogUi = false,
  showExerciseBlockPhotos = false,
  disabled = false,
}: WorkoutFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(event);
  }

  const titleTrim = title.trim();
  const titleShort = titleTrim.length > 0 && titleTrim.length < WORKOUT_TITLE_MIN;
  const descLen = description.length;

  const sectionLabel = "text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 light:text-zinc-600";

  return (
    <form className="grid gap-10" onSubmit={handleSubmit}>
      <section className="grid gap-4">
        <p className={sectionLabel}>Datos básicos</p>
        <div className="grid gap-4">
          <label className="grid gap-1.5 font-semibold">
            <span className="flex flex-wrap items-baseline justify-between gap-2">
              Título
              <span
                className={
                  titleShort
                    ? "text-xs font-normal tabular-nums text-amber-400/90"
                    : "text-xs font-normal tabular-nums text-neutral-500"
                }
              >
                {title.length}/{WORKOUT_TITLE_MAX} · min. {WORKOUT_TITLE_MIN}
              </span>
            </span>
            <input
              className="goi-field"
              required
              minLength={WORKOUT_TITLE_MIN}
              maxLength={WORKOUT_TITLE_MAX}
              value={title}
              disabled={disabled}
              onChange={(event) => onChangeTitle(event.target.value)}
              placeholder="Ej. Empuje — upper"
            />
          </label>

          <label className="grid gap-1.5 font-semibold">
            <span className="flex flex-wrap items-baseline justify-between gap-2">
              Descripción
              <span
                className={
                  descLen > WORKOUT_DESCRIPTION_MAX
                    ? "text-xs font-normal tabular-nums text-red-400/90"
                    : "text-xs font-normal tabular-nums text-neutral-500"
                }
              >
                {descLen}/{WORKOUT_DESCRIPTION_MAX}
              </span>
            </span>
            <textarea
              className="goi-field min-h-[96px] resize-y"
              maxLength={WORKOUT_DESCRIPTION_MAX}
              value={description}
              disabled={disabled}
              onChange={(event) => onChangeDescription(event.target.value)}
              placeholder="Objetivo del día, descansos, RPE…"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <p className={sectionLabel}>Ejercicios</p>
        <ExercisePicker
          exerciseBlocks={exerciseBlocks}
          catalog={exerciseCatalog}
          onChange={onChangeExerciseBlocks}
          disabled={disabled}
          catalogError={exerciseCatalogError}
          catalogLoading={exerciseCatalogLoading}
          onOpenCatalog={onOpenCatalog}
          omitEmbeddedCatalogUi={omitEmbeddedCatalogUi}
          showExerciseThumbnails={showExerciseBlockPhotos}
        />
      </section>

      <div className="flex flex-wrap gap-3 border-t border-neutral-800/40 pt-6 light:border-zinc-200/85">
        <Button type="submit" disabled={disabled} className="min-w-[9rem]">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" disabled={disabled} onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
