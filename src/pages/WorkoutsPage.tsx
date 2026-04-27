import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createWorkout, deleteWorkout, getWorkouts, updateWorkout } from "../api/workoutsApi";
import { useAuth } from "../context/AuthContext";
import type { Workout } from "../types/workout";

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
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar entrenamientos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkouts();
  }, []);

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
        userId: user.id,
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
      setError(createError instanceof Error ? createError.message : "No se pudo crear el entrenamiento");
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
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar");
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
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar");
    }
  }

  return (
    <section className="layout">
      <section className="card">
        <h2>Crear entrenamiento</h2>
        <form className="stack" onSubmit={handleCreateWorkout}>
          <label>
            Titulo
            <input required value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Descripcion
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Ejercicios (separados por coma)
            <input
              value={exercisesInput}
              onChange={(event) => setExercisesInput(event.target.value)}
              placeholder="Press banca, Sentadilla, Remo"
            />
          </label>
          <button type="submit">Guardar entrenamiento</button>
        </form>
      </section>

      <section className="card">
        <h2>Mis entrenamientos</h2>
        {loading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {!loading && workouts.length === 0 && <p>Aun no tienes entrenamientos.</p>}

        <ul className="workouts-list">
          {workouts.map((workout) => (
            <li key={workout.id} className="workout-item">
              {editingWorkoutId === workout.id ? (
                <form className="stack" onSubmit={handleUpdateWorkout}>
                  <label>
                    Titulo
                    <input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                  </label>
                  <label>
                    Descripcion
                    <textarea
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                    />
                  </label>
                  <label>
                    Ejercicios (separados por coma)
                    <input
                      value={editExercisesInput}
                      onChange={(event) => setEditExercisesInput(event.target.value)}
                    />
                  </label>
                  <div className="actions">
                    <button type="submit">Guardar cambios</button>
                    <button type="button" className="secondary" onClick={cancelEditingWorkout}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <strong>{workout.title}</strong>
                    <p>{workout.description || "Sin descripcion"}</p>
                    <small>Ejercicios: {workout.exercises.join(", ") || "No definidos"}</small>
                  </div>
                  <div className="actions">
                    <button type="button" onClick={() => startEditingWorkout(workout)}>
                      Editar
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeleteWorkout(workout.id)}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
