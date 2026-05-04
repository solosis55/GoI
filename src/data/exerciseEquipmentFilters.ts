/**
 * Slugs alineados con `equipmentTags` en el catálogo (API + semilla).
 * Varios filtros activos: se muestran ejercicios que usan **cualquiera** de esos materiales.
 */
export const CATALOG_EQUIPMENT_OPTIONS = [
  { slug: "maquina", label: "Maquina" },
  { slug: "maquina_palanca", label: "Maquina de palanca" },
  { slug: "cable", label: "Cable" },
  { slug: "peso_libre", label: "Mancuernas" },
  { slug: "bandas", label: "Bandas elasticas" },
  { slug: "barra", label: "Barra" },
] as const;

export type CatalogEquipmentSlug = (typeof CATALOG_EQUIPMENT_OPTIONS)[number]["slug"];
