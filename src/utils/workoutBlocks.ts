import type { WorkoutExerciseBlock, WorkoutSetRow } from "../types/workout";
import type { WorkoutSetTypeSlug } from "../data/workoutSetTypes";

const DEFAULT_SET_TYPE: WorkoutSetTypeSlug = "normal";

export function createEmptySet(): WorkoutSetRow {
  return { reps: "", weight: "", setType: DEFAULT_SET_TYPE };
}

export function createBlockForExercise(exerciseId: string): WorkoutExerciseBlock {
  return {
    exerciseId,
    equipmentSlug: "",
    laterality: "bilateral",
    sets: [createEmptySet()],
  };
}

export function blocksFromExerciseIds(ids: string[]): WorkoutExerciseBlock[] {
  return ids.map((exerciseId) => createBlockForExercise(exerciseId));
}

export function exerciseIdsFromBlocks(blocks: WorkoutExerciseBlock[]): string[] {
  return blocks.map((b) => b.exerciseId);
}

/** Migra borrador o rutinas antiguas que solo tenían `exerciseIds`. */
export function blocksFromLegacy(
  exerciseIds: string[] | undefined,
  blocks: WorkoutExerciseBlock[] | undefined,
): WorkoutExerciseBlock[] {
  if (blocks && blocks.length > 0) return normalizeBlocksShape(blocks);
  return blocksFromExerciseIds(exerciseIds ?? []);
}

function normalizeBlocksShape(blocks: WorkoutExerciseBlock[]): WorkoutExerciseBlock[] {
  return blocks.map((b) => ({
    exerciseId: b.exerciseId,
    equipmentSlug: b.equipmentSlug ?? "",
    laterality: b.laterality === "unilateral" ? "unilateral" : "bilateral",
    sets:
      b.sets && b.sets.length > 0
        ? b.sets.map((s) => ({
            reps: s.reps ?? "",
            weight: s.weight ?? "",
            setType: (s.setType as WorkoutSetRow["setType"]) || DEFAULT_SET_TYPE,
          }))
        : [createEmptySet()],
  }));
}

export function cloneBlocks(blocks: WorkoutExerciseBlock[]): WorkoutExerciseBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as WorkoutExerciseBlock[];
}
