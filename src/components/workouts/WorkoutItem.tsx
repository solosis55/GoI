import { Button } from "../ui/Button";
import { WorkoutForm } from "./WorkoutForm";
import type { Workout } from "../../types/workout";
import type { FormEvent } from "react";

type WorkoutItemProps = {
  workout: Workout;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editExercisesInput: string;
  onChangeEditTitle: (value: string) => void;
  onChangeEditDescription: (value: string) => void;
  onChangeEditExercisesInput: (value: string) => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
};

export function WorkoutItem({
  workout,
  isEditing,
  editTitle,
  editDescription,
  editExercisesInput,
  onChangeEditTitle,
  onChangeEditDescription,
  onChangeEditExercisesInput,
  onSubmitEdit,
  onStartEdit,
  onCancelEdit,
  onDelete,
}: WorkoutItemProps) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 max-md:flex-col">
      {isEditing ? (
        <WorkoutForm
          title={editTitle}
          description={editDescription}
          exercisesInput={editExercisesInput}
          onChangeTitle={onChangeEditTitle}
          onChangeDescription={onChangeEditDescription}
          onChangeExercisesInput={onChangeEditExercisesInput}
          onSubmit={onSubmitEdit}
          submitLabel="Guardar cambios"
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <div>
            <strong className="text-slate-900">{workout.title}</strong>
            <p className="text-slate-700">{workout.description || "Sin descripcion"}</p>
            <small className="text-slate-600">Ejercicios: {workout.exercises.join(", ") || "No definidos"}</small>
          </div>
          <div className="actions flex gap-2 max-md:w-full">
            <Button type="button" className="max-md:flex-1" onClick={onStartEdit}>
              Editar
            </Button>
            <Button type="button" variant="danger" className="max-md:flex-1" onClick={onDelete}>
              Eliminar
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
