export type Workout = {
  id: string;
  userId: string;
  title: string;
  description: string;
  exercises: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutInput = {
  title: string;
  description: string;
  exercises: string[];
};

export type UpdateWorkoutInput = Partial<CreateWorkoutInput>;
