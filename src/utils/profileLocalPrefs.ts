const key = (userId: string) => `goi:favoriteWorkouts:${userId}`;
const MAX = 12;

function readIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(userId: string, ids: string[]) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(ids.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function loadFavoriteWorkoutIds(userId: string): string[] {
  return readIds(userId);
}

export function toggleFavoriteWorkoutId(userId: string, workoutId: string): string[] {
  const ids = readIds(userId);
  const i = ids.indexOf(workoutId);
  if (i >= 0) ids.splice(i, 1);
  else ids.unshift(workoutId);
  const next = ids.slice(0, MAX);
  writeIds(userId, next);
  return next;
}

export function isFavoriteWorkout(userId: string, workoutId: string): boolean {
  return readIds(userId).includes(workoutId);
}
