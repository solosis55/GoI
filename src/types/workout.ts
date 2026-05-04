/** Una fila de planificacion (reps, carga, tipo de serie). */
export type WorkoutSetRow = {
  reps: string;
  weight: string;
  setType: string;
};

/** Un ejercicio en la rutina con material y series. */
export type WorkoutExerciseBlock = {
  exerciseId: string;
  /** Slug de material (`exerciseEquipmentFilters`), vacio = sin especificar. */
  equipmentSlug?: string;
  /** Bilateral o unilateral. Por defecto en API: bilateral. */
  laterality?: "bilateral" | "unilateral";
  sets: WorkoutSetRow[];
};

export type Workout = {
  id: string;
  userId: string;
  title: string;
  description: string;
  /** IDs del catalogo /api/exercises, orden = orden en la rutina (derivado de `exerciseBlocks` si existe). */
  exerciseIds: string[];
  /** Detalle por ejercicio: material y series. Opcional por rutinas antiguas solo con `exerciseIds`. */
  exerciseBlocks?: WorkoutExerciseBlock[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutInput = {
  title: string;
  description: string;
  exerciseIds?: string[];
  exerciseBlocks?: WorkoutExerciseBlock[];
  tags?: string[];
};

export type UpdateWorkoutInput = Partial<CreateWorkoutInput>;
