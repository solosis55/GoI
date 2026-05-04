export type Workout = {
  id: string;
  userId: string;
  title: string;
  description: string;
  /** IDs del catalogo /api/exercises, orden = orden en la rutina. */
  exerciseIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutInput = {
  title: string;
  description: string;
  exerciseIds: string[];
  tags?: string[];
};

export type UpdateWorkoutInput = Partial<CreateWorkoutInput>;
