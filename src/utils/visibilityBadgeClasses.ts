/** Pastillas de visibilidad en tarjetas de publicación (feed + vista previa del compositor). */
export function visibilityBadgeClasses(visibility: "public" | "followers" | "private"): string {
  switch (visibility) {
    case "public":
      return "border-emerald-800/55 bg-emerald-950/45 text-emerald-100/95 light:border-emerald-600/35 light:bg-emerald-50 light:text-emerald-950";
    case "followers":
      return "border-goi-gold/45 bg-goi-gold/[0.11] text-goi-gold light:border-amber-600/35 light:bg-amber-50 light:text-amber-950";
    case "private":
      return "border-neutral-600 bg-neutral-900/75 text-neutral-400 light:border-zinc-300 light:bg-zinc-200/90 light:text-zinc-700";
    default:
      return "";
  }
}
