export type WorkoutSetRow = {
  reps: string;
  weight: string;
  setType: string;
};

export type WorkoutExerciseBlock = {
  exerciseId: string;
  equipmentSlug?: string;
  /** bilateral (ambos lados a la vez) o unilateral (un lado por vez). */
  laterality?: "bilateral" | "unilateral";
  sets: WorkoutSetRow[];
};
