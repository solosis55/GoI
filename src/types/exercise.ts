export type Exercise = {
  id: string;
  name: string;
  /** Slugs de grupo muscular (coinciden con semilla / API). */
  muscles?: string[];
  /** Slugs de material (barra, cable, maquina, peso_libre, …). */
  equipmentTags?: string[];
  /** Equipamiento habitual (texto del catalogo). */
  equipment?: string;
  /** Resumen: que es y que trabaja. */
  description?: string;
  /** Ejecucion y claves tecnicas (puede ser multilinea). */
  instructions?: string;
};
