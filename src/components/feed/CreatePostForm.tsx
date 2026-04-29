import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import type { Workout } from "../../types/workout";

type CreatePostFormProps = {
  content: string;
  selectedWorkoutId: string;
  workouts: Workout[];
  onChangeContent: (value: string) => void;
  onChangeWorkoutId: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreatePostForm({
  content,
  selectedWorkoutId,
  workouts,
  onChangeContent,
  onChangeWorkoutId,
  onSubmit,
}: CreatePostFormProps) {
  return (
    <form className="stack grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1.5 font-semibold">
        Contenido
        <textarea
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          required
          value={content}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Hoy rompi PR en sentadilla..."
        />
      </label>

      <label className="grid gap-1.5 font-semibold">
        Entrenamiento vinculado (opcional)
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={selectedWorkoutId}
          onChange={(event) => onChangeWorkoutId(event.target.value)}
        >
          <option value="">Sin entrenamiento</option>
          {workouts.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.title}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit">Publicar</Button>
    </form>
  );
}
