import { apiFetch } from "./client";
import type { CreateWorkoutInput, UpdateWorkoutInput, Workout } from "../types/workout";

export function getWorkouts() {
  return apiFetch<Workout[]>("/workouts");
}

export function createWorkout(input: CreateWorkoutInput) {
  return apiFetch<Workout>("/workouts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWorkout(id: string, input: UpdateWorkoutInput) {
  return apiFetch<Workout>(`/workouts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteWorkout(id: string) {
  return apiFetch<{ message: string }>(`/workouts/${id}`, {
    method: "DELETE",
  });
}
