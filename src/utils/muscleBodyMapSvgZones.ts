import type { MuscleOctagonAxis } from "./muscleOctagonStats";
import { MUSCLE_OCTAGON_AXES } from "./muscleOctagonStats";

/** Mapeo eje octagonal → `id` de `<path>` en `vectorized.svg`. */
export const MUSCLE_MAP_AXIS_TO_SVG_IDS: Record<MuscleOctagonAxis, string[]> = {
  pecho: ["Pecho"],
  espalda: ["Espalda-alta", "Dorsales"],
  brazos: [
    "Biceps-izq",
    "Biceps-derecho",
    "Triceps-izq",
    "Triceps-der",
    "Triceps-izqfrontal",
    "Triceps-derechofrontal",
    "antebrazo-derfrontal",
    "Antebrazo-dertrasero",
    "Antebrazo-izqtrasero",
    "Antebrazo-izqfrontal",
  ],
  hombros: [
    "Trapecio-frontal",
    "Trapecio-trasero",
    "Hombro-derechofrontal",
    "Hombro-izquierdofrontal",
    "Hombro-derechoposterior",
    "Hombro-izquierdoposterior",
  ],
  core: ["Abdomen", "Lumbar"],
  cuadriceps: ["Quad-Derecho", "Quad-Izquierdo"],
  posterior: ["Gluteos", "Isquios-izquierdos", "Isquio-derecho"],
  gemelos: [
    "Gemelo-derechofrontal",
    "Gemelo-izquierdofrontal",
    "Gemelo-derechotrasero",
    "Gemelo-izquierdotrasero",
  ],
};

/** Todos los `<path id="…">` del cuerpo en `vectorized.svg` (silueta + relleno neutro). */
export const MUSCLE_BODY_SILHOUETTE_PATH_IDS = new Set<string>([
  "Pierna-izquierdafrontal",
  "Pierna-derechafrontal",
  "Gluteos",
  "PIerna-derechatrasera",
  "PIerna-izquierdatrasera",
  "Gemelo-derechofrontal",
  "Gemelo-izquierdofrontal",
  "Gemelo-derechotrasero",
  "Gemelo-izquierdotrasero",
  "Pie-izquierdotrasero",
  "Pie-derechotrasero",
  "Quad-Derecho",
  "Quad-Izquierdo",
  "Isquios-izquierdos",
  "Isquio-derecho",
  "Abdomen",
  "cabeza-frontal",
  "Espalda-completa",
  "Espalda-alta",
  "Dorsales",
  "Lumbar",
  "Hombro-derechofrontal",
  "Hombro-derechoposterior",
  "Hombro-izquierdoposterior",
  "Hombro-izquierdofrontal",
  "Trapecio-trasero",
  "Trapecio-frontal",
  "Pecho",
  "antebrazo-derfrontal",
  "Antebrazo-dertrasero",
  "Antebrazo-izqtrasero",
  "Antebrazo-izqfrontal",
  "Biceps-izq",
  "Biceps-derecho",
  "Triceps-izq",
  "Triceps-der",
  "Triceps-derechofrontal",
  "Triceps-izqfrontal",
]);

/** `id` de path → etiqueta amable si no hay eje octagonal. */
export const MUSCLE_MAP_PATH_FALLBACK_LABEL: Record<string, string> = {
  "cabeza-frontal": "Cabeza (no forma parte del octágono)",
  "Espalda-completa": "Espalda completa (no coloreada en el mapa)",
  "Pierna-izquierdafrontal": "Pierna (contorno)",
  "Pierna-derechafrontal": "Pierna (contorno)",
  "PIerna-derechatrasera": "Pierna trasera (contorno)",
  "PIerna-izquierdatrasera": "Pierna trasera (contorno)",
  "Pie-izquierdotrasero": "Pie (contorno)",
  "Pie-derechotrasero": "Pie (contorno)",
};

export const PATH_ID_TO_OCT_AXIS: ReadonlyMap<string, MuscleOctagonAxis> = (() => {
  const m = new Map<string, MuscleOctagonAxis>();
  for (const ax of MUSCLE_OCTAGON_AXES) {
    for (const id of MUSCLE_MAP_AXIS_TO_SVG_IDS[ax]) m.set(id, ax);
  }
  return m;
})();
