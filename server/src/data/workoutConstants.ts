/** Alineado con `src/data/exerciseEquipmentFilters.ts` (slugs de material). */
export const ALLOWED_EQUIPMENT_SLUGS = new Set([
  "maquina",
  "maquina_palanca",
  "cable",
  "peso_libre",
  "bandas",
  "barra",
]);

/** Alineado con `src/data/workoutSetTypes.ts`. */
export const ALLOWED_SET_TYPE_SLUGS = new Set([
  "normal",
  "calentamiento",
  "fallo",
  "dropset",
  "amrap",
  "tempo",
  "rest_pause",
]);

export const ALLOWED_LATERALITY_SLUGS = new Set(["bilateral", "unilateral"]);
