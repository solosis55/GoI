import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createWorkout, deleteWorkout, getWorkouts, updateWorkout } from "../api/workoutsApi";
import { WorkoutForm } from "../components/workouts/WorkoutForm";
import { WorkoutItem } from "../components/workouts/WorkoutItem";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../context/AuthContext";
import type { Workout } from "../types/workout";
import { getErrorMessage } from "../utils/errorMessages";

export function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exercisesInput, setExercisesInput] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editExercisesInput, setEditExercisesInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWorkouts() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await getWorkouts();
      const ownWorkouts = user ? response.filter((workout) => workout.userId === user.id) : [];
      setWorkouts(ownWorkouts);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar entrenamientos"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkouts();
  }, [user?.id]);

  async function handleCreateWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");

    if (title.trim().length < 3) {
      setError("El titulo debe tener al menos 3 caracteres");
      return;
    }
    if (description.length > 280) {
      setError("La descripcion no puede superar 280 caracteres");
      return;
    }

    const exercises = exercisesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createWorkout({
        title,
        description,
        exercises,
      });
      setTitle("");
      setDescription("");
      setExercisesInput("");
      await loadWorkouts();
      setMessage("Entrenamiento creado");
    } catch (createError) {
      setError(getErrorMessage(createError, "No se pudo crear el entrenamiento"));
    }
  }

  async function handleDeleteWorkout(id: string) {
    if (!window.confirm("Seguro que quieres eliminar este entrenamiento?")) return;
    setError("");
    setMessage("");
    try {
      await deleteWorkout(id);
      await loadWorkouts();
      setMessage("Entrenamiento eliminado");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "No se pudo eliminar"));
    }
  }

  function startEditingWorkout(workout: Workout) {
    setEditingWorkoutId(workout.id);
    setEditTitle(workout.title);
    setEditDescription(workout.description);
    setEditExercisesInput(workout.exercises.join(", "));
    setError("");
  }

  function cancelEditingWorkout() {
    setEditingWorkoutId(null);
    setEditTitle("");
    setEditDescription("");
    setEditExercisesInput("");
  }

  async function handleUpdateWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingWorkoutId) return;
    setError("");
    setMessage("");

    if (editTitle.trim().length < 3) {
      setError("El titulo debe tener al menos 3 caracteres");
      return;
    }
    if (editDescription.length > 280) {
      setError("La descripcion no puede superar 280 caracteres");
      return;
    }

    const exercises = editExercisesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await updateWorkout(editingWorkoutId, {
        title: editTitle,
        description: editDescription,
        exercises,
      });
      cancelEditingWorkout();
      await loadWorkouts();
      setMessage("Entrenamiento actualizado");
    } catch (updateError) {
      setError(getErrorMessage(updateError, "No se pudo actualizar"));
    }
  }

  return (
    <section className="layout grid gap-4">
      <Card>
        <h2>Crear entrenamiento</h2>
        <WorkoutForm
          title={title}
          description={description}
          exercisesInput={exercisesInput}
          onChangeTitle={setTitle}
          onChangeDescription={setDescription}
          onChangeExercisesInput={setExercisesInput}
          onSubmit={handleCreateWorkout}
          submitLabel="Guardar entrenamiento"
        />
      </Card>

      <Card>
        <h2>Mis entrenamientos</h2>
        <StatusMessage loading={loading} error={error} success={message} />
        {!loading && workouts.length === 0 && <EmptyState message="Aun no tienes entrenamientos." />}

        <ul className="workouts-list mt-3 grid list-none gap-2.5 p-0">
          {workouts.map((workout) => (
            <WorkoutItem
              key={workout.id}
              workout={workout}
              isEditing={editingWorkoutId === workout.id}
              editTitle={editTitle}
              editDescription={editDescription}
              editExercisesInput={editExercisesInput}
              onChangeEditTitle={setEditTitle}
              onChangeEditDescription={setEditDescription}
              onChangeEditExercisesInput={setEditExercisesInput}
              onSubmitEdit={handleUpdateWorkout}
              onStartEdit={() => startEditingWorkout(workout)}
              onCancelEdit={cancelEditingWorkout}
              onDelete={() => handleDeleteWorkout(workout.id)}
            />
          ))}
        </ul>
      </Card>
    </section>
  );
}
