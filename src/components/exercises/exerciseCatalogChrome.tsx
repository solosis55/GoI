import { CATALOG_EQUIPMENT_OPTIONS } from "../../data/exerciseEquipmentFilters";
import { CATALOG_MUSCLE_OPTIONS } from "../../data/exerciseMuscleFilters";
import type { Exercise } from "../../types/exercise";

export const MUSCLE_LABEL = Object.fromEntries(
  CATALOG_MUSCLE_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

export const EQUIPMENT_LABEL = Object.fromEntries(
  CATALOG_EQUIPMENT_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

export function catalogExerciseMetaLine(ex: { equipmentTags?: string[]; muscles?: string[] }): string | null {
  const bits: string[] = [];
  if (ex.equipmentTags?.length) {
    bits.push(ex.equipmentTags.map((s) => EQUIPMENT_LABEL[s] ?? s).join(" · "));
  }
  if (ex.muscles?.length) {
    bits.push(ex.muscles.map((s) => MUSCLE_LABEL[s] ?? s).join(" · "));
  }
  return bits.length ? bits.join(" · ") : null;
}

/** Nombre en lista: nombre · grupos musculares (explícito aunque también salgan como etiquetas). */
export function catalogExerciseDisplayTitle(ex: Exercise): string {
  const base = ex.name.trim();
  const muscles = ex.muscles?.filter(Boolean) ?? [];
  if (muscles.length === 0) return base;
  const labels = muscles.map((s) => MUSCLE_LABEL[s] ?? s);
  return `${base} · ${labels.join(" · ")}`;
}

type ExerciseCatalogThumbPlaceholderProps = {
  /** Catálogo lista vs selector del editor (un poco más compacto en picker). */
  variant?: "catalog" | "picker";
};

export function ExerciseCatalogThumbPlaceholder({ variant = "catalog" }: ExerciseCatalogThumbPlaceholderProps) {
  const size =
    variant === "picker"
      ? "aspect-[5/4] w-full sm:aspect-auto sm:h-[6.25rem] sm:w-[6.75rem]"
      : "aspect-[5/4] w-full sm:aspect-auto sm:h-[7rem] sm:w-[7.5rem]";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-800/45 bg-linear-to-br from-neutral-900/90 via-neutral-950 to-neutral-950 light:border-zinc-200/90 light:from-zinc-100 light:via-white light:to-zinc-100",
        size,
      ].join(" ")}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] light:opacity-[0.18]"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(212,175,55,0.35), transparent 55%)" }}
      />
      <svg className="relative z-[1] h-10 w-10 text-neutral-600 sm:h-11 sm:w-11 light:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="absolute bottom-2 left-0 right-0 z-[1] text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-600 light:text-zinc-500">
        Imagen
      </span>
    </div>
  );
}
