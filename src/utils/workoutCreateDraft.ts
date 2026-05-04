export const WORKOUT_CREATE_DRAFT_KEY = "fitsocial:workoutCreateDraft";

export type WorkoutCreateDraft = {
  title: string;
  description: string;
  exerciseIds: string[];
  tags: string[];
};

export function readWorkoutCreateDraft(): WorkoutCreateDraft | null {
  try {
    const raw = sessionStorage.getItem(WORKOUT_CREATE_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<WorkoutCreateDraft>;
    if (typeof o.title !== "string" || typeof o.description !== "string") return null;
    if (!Array.isArray(o.exerciseIds) || !Array.isArray(o.tags)) return null;
    return {
      title: o.title,
      description: o.description,
      exerciseIds: o.exerciseIds.filter((x) => typeof x === "string"),
      tags: o.tags.filter((x) => typeof x === "string"),
    };
  } catch {
    return null;
  }
}

export function writeWorkoutCreateDraft(d: WorkoutCreateDraft): void {
  try {
    sessionStorage.setItem(WORKOUT_CREATE_DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function clearWorkoutCreateDraft(): void {
  try {
    sessionStorage.removeItem(WORKOUT_CREATE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
