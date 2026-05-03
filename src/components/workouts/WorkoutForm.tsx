import type { FormEvent } from "react";
import { Button } from "../ui/Button";

type WorkoutFormProps = {
  title: string;
  description: string;
  exercisesInput: string;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeExercisesInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  onCancel?: () => void;
};

export function WorkoutForm({
  title,
  description,
  exercisesInput,
  onChangeTitle,
  onChangeDescription,
  onChangeExercisesInput,
  onSubmit,
  submitLabel,
  onCancel,
}: WorkoutFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(event);
  }

  return (
    <form className="stack grid gap-3" onSubmit={handleSubmit}>
      <label className="grid gap-1.5 font-semibold">
        Titulo
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          required
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        Descripcion
        <textarea
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={description}
          onChange={(event) => onChangeDescription(event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        Ejercicios (separados por coma)
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={exercisesInput}
          onChange={(event) => onChangeExercisesInput(event.target.value)}
          placeholder="Press banca, Sentadilla, Remo"
        />
      </label>
      <div className="actions flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
