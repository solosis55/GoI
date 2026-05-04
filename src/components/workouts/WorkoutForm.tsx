import type { FormEvent } from "react";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock } from "../../types/workout";
import { Button } from "../ui/Button";
import { ExercisePicker } from "./ExercisePicker";
import {
  WORKOUT_DESCRIPTION_MAX,
  WORKOUT_TAG_MAX_LEN,
  WORKOUT_TAGS_MAX_COUNT,
  WORKOUT_TITLE_MAX,
  WORKOUT_TITLE_MIN,
} from "./workoutFormLimits";

type WorkoutFormProps = {
  title: string;
  description: string;
  exerciseBlocks: WorkoutExerciseBlock[];
  tags: string[];
  exerciseCatalog: Exercise[];
  exerciseCatalogError?: string | null;
  exerciseCatalogLoading?: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeExerciseBlocks: (value: WorkoutExerciseBlock[]) => void;
  onChangeTags: (value: string[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  onCancel?: () => void;
  /** Si existe, añadir ejercicios abre el catalogo en lugar del buscador embebido. */
  onOpenCatalog?: () => void;
  disabled?: boolean;
};

export function WorkoutForm({
  title,
  description,
  exerciseBlocks,
  tags,
  exerciseCatalog,
  exerciseCatalogError,
  exerciseCatalogLoading,
  onChangeTitle,
  onChangeDescription,
  onChangeExerciseBlocks,
  onChangeTags,
  onSubmit,
  submitLabel,
  onCancel,
  onOpenCatalog,
  disabled = false,
}: WorkoutFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(event);
  }

  function setTagLine(index: number, value: string) {
    const next = [...tags];
    next[index] = value;
    onChangeTags(next);
  }

  function addTagLine() {
    if (tags.length >= WORKOUT_TAGS_MAX_COUNT) return;
    onChangeTags([...tags, ""]);
  }

  function removeTagLine(index: number) {
    if (tags.length <= 1) {
      onChangeTags([""]);
      return;
    }
    onChangeTags(tags.filter((_, i) => i !== index));
  }

  const tagLines = tags.length ? tags : [""];
  const titleTrim = title.trim();
  const titleShort = titleTrim.length > 0 && titleTrim.length < WORKOUT_TITLE_MIN;
  const descLen = description.length;

  return (
    <form className="stack grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1.5 font-semibold">
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          Titulo
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
          Descripcion
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
          placeholder="Objetivo del dia, descansos, RPE…"
        />
      </label>

      <div className="grid gap-2">
        <span className="font-semibold">Ejercicios</span>
        <p className="text-sm text-neutral-500">
          {onOpenCatalog
            ? "Abre el catalogo para elegir ejercicios. Puedes repetir el mismo en distintos puntos de la rutina. El orden importa."
            : "Elige del catalogo. Puedes repetir el mismo ejercicio en distintos puntos de la rutina añadiendolo otra vez. El orden importa."}
        </p>
        <ExercisePicker
          exerciseBlocks={exerciseBlocks}
          catalog={exerciseCatalog}
          onChange={onChangeExerciseBlocks}
          disabled={disabled}
          catalogError={exerciseCatalogError}
          catalogLoading={exerciseCatalogLoading}
          onOpenCatalog={onOpenCatalog}
        />
      </div>

      <div className="grid gap-2">
        <span className="flex flex-wrap items-baseline justify-between gap-2 font-semibold">
          Etiquetas
          <span className="text-xs font-normal tabular-nums text-neutral-500">
            Hasta {WORKOUT_TAGS_MAX_COUNT} · max. {WORKOUT_TAG_MAX_LEN} caracteres
          </span>
        </span>
        <p className="text-sm text-neutral-500">
          Opcional. Una linea por etiqueta. Sirven para filtrar en &quot;Mis rutinas&quot;.
        </p>
        <ul className="grid list-none gap-2 p-0">
          {tagLines.map((line, index) => (
            <li key={`tag-${index}`} className="flex flex-wrap gap-2 max-sm:flex-col sm:items-center">
              <input
                className="goi-field min-w-0 flex-1"
                maxLength={WORKOUT_TAG_MAX_LEN}
                aria-label={`Etiqueta ${index + 1}`}
                value={line}
                disabled={disabled}
                onChange={(event) => setTagLine(index, event.target.value)}
                placeholder="pecho, tiron, full-body..."
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={disabled}
                onClick={() => removeTagLine(index)}
              >
                Quitar
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          disabled={disabled || tagLines.length >= WORKOUT_TAGS_MAX_COUNT}
          onClick={addTagLine}
        >
          Añadir etiqueta
        </Button>
      </div>

      <div className="actions flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={disabled}>
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
