import type { Request, Response } from "express";
import { sendError } from "../services/http.js";
import { store } from "../services/store.js";

export function listExercises(_req: Request, res: Response) {
  const sorted = [...store.exercises].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
  res.json(sorted);
}

export function getExerciseById(req: Request, res: Response) {
  const { id } = req.params;
  const exercise = store.exercises.find((e) => e.id === id);
  if (!exercise) {
    sendError(res, 404, "EXERCISE_NOT_FOUND", "exercise not found");
    return;
  }
  res.json(exercise);
}
