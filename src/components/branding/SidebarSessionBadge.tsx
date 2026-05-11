import { Avatar } from "../ui/Avatar";

type SidebarSessionBadgeProps = {
  username: string;
  avatarUrl: string;
  /** Objetivo o bio muy corta (opcional). */
  tagline?: string;
  /** Abre la vista Perfil (misma acción que el ítem del menú). */
  onNavigateToProfile?: () => void;
};

/**
 * Marca en el lateral con la foto de perfil del usuario conectado (sustituye al logo GoI en sesión).
 */
export function SidebarSessionBadge({
  username,
  avatarUrl,
  tagline,
  onNavigateToProfile,
}: SidebarSessionBadgeProps) {
  const label = username.trim() || "Usuario";
  const trimmedTag = tagline?.trim();

  const avatarWrapperClass =
    "relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-950 ring-2 ring-goi-gold-dim/30 shadow-[0_8px_28px_rgba(0,0,0,0.55)] md:h-[112px] md:w-[112px] light:bg-white light:shadow-[0_8px_28px_rgba(0,0,0,0.12)]";

  const body = (
    <>
      <div className={avatarWrapperClass}>
        <Avatar src={avatarUrl.trim() || undefined} alt={label} fill className="ring-0" />
      </div>
      <div className="min-w-0 flex-1 md:w-full md:text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goi-steel md:pt-1">FitSocial</p>
        <div className="sidebar-user mt-0.5 text-sm font-medium text-neutral-200 light:text-zinc-800 md:text-neutral-400 md:font-normal md:light:text-zinc-600">
          @{label}
        </div>
        {trimmedTag ? (
          <p className="mt-1 line-clamp-2 text-left text-[11px] leading-snug text-neutral-500 md:text-center light:text-zinc-600">
            {trimmedTag}
          </p>
        ) : null}
      </div>
    </>
  );

  if (onNavigateToProfile) {
    return (
      <button
        type="button"
        onClick={onNavigateToProfile}
        aria-label={`Ir al perfil de @${label}`}
        className={[
          "sidebar-session-badge w-full rounded-2xl border border-transparent p-2 text-left outline-none transition-colors",
          "max-md:flex max-md:flex-row max-md:items-center max-md:gap-3 max-md:py-1",
          "hover:border-neutral-800/70 hover:bg-neutral-900/40 focus-visible:border-goi-gold/45 focus-visible:ring-2 focus-visible:ring-goi-gold/35",
          "md:grid md:justify-items-center md:p-3 md:text-center",
          "light:hover:border-zinc-200 light:hover:bg-zinc-100/90 light:focus-visible:ring-goi-gold/45",
        ].join(" ")}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className={[
        "sidebar-session-badge grid w-full justify-items-center gap-2",
        "max-md:flex max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-3 max-md:py-1",
      ].join(" ")}
    >
      {body}
    </div>
  );
}
