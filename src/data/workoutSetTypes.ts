/** Slugs persistidos en cada fila de serie del editor de rutinas. */
export const WORKOUT_SET_TYPE_OPTIONS = [
  { slug: "normal", label: "Normal" },
  { slug: "calentamiento", label: "Calentamiento" },
  { slug: "fallo", label: "Al fallo" },
  { slug: "dropset", label: "Dropset" },
  { slug: "amrap", label: "AMRAP" },
  { slug: "tempo", label: "Tempo" },
  { slug: "rest_pause", label: "Rest-pause" },
] as const;

export type WorkoutSetTypeSlug = (typeof WORKOUT_SET_TYPE_OPTIONS)[number]["slug"];
