import { Request, Response } from "express";
import { createId, saveStore, store, Workout } from "../services/store.js";

type WorkoutPayload = {
  userId?: string;
  title?: string;
  description?: string;
  exercises?: string[];
};

export function listWorkouts(_req: Request, res: Response) {
  res.json(store.workouts);
}

export function createWorkout(req: Request, res: Response) {
  const { userId, title, description = "", exercises = [] } = req.body as WorkoutPayload;

  if (!userId || !title) {
    res.status(400).json({ message: "userId and title are required" });
    return;
  }

  const workout: Workout = {
    id: createId(),
    userId,
    title,
    description,
    exercises,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.workouts.push(workout);
  saveStore();
  res.status(201).json(workout);
}

export function updateWorkout(req: Request, res: Response) {
  const { id } = req.params;
  const payload = req.body as WorkoutPayload;
  const workout = store.workouts.find((item) => item.id === id);

  if (!workout) {
    res.status(404).json({ message: "workout not found" });
    return;
  }

  if (payload.title !== undefined) workout.title = payload.title;
  if (payload.description !== undefined) workout.description = payload.description;
  if (payload.exercises !== undefined) workout.exercises = payload.exercises;
  workout.updatedAt = new Date().toISOString();

  saveStore();
  res.json(workout);
}

export function deleteWorkout(req: Request, res: Response) {
  const { id } = req.params;
  const index = store.workouts.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ message: "workout not found" });
    return;
  }

  const [removed] = store.workouts.splice(index, 1);
  saveStore();
  res.json({ message: "workout deleted", workout: removed });
}
