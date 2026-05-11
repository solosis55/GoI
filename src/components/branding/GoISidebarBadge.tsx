import type { ReactNode, Ref } from "react";

type GoISidebarBadgeProps = {
  /** Texto debajo del logotipo (ej. @{user}, o texto de onboarding). */
  subtitle: ReactNode;
  /** Párrafo opcional (solo escritorio típico en login). */
  description?: ReactNode;
  /** Si hay `description`, mostrarla también en móvil (p. ej. pantalla auth sin sidebar). */
  showDescriptionOnMobile?: boolean;
  /**
   * `hero`: pantalla de login/registro más grande y luminosa (`compact`: marco tipo sidebar clásico).
   */
  presentation?: "compact" | "hero";
  /** Solo con `presentation="hero"`: halo dorado animado detrás del círculo (`LoginHeroBrand`). */
  heroHalo?: boolean;
  /** Ref al nodo `.goi-hero-halo` (p. ej. sincronizar periodo de rotación en hover). */
  heroHaloRef?: Ref<HTMLDivElement>;
};

const LOGO_SRC = "/branding/goi-logo.png";

export function GoISidebarBadge({
  subtitle,
  description,
  showDescriptionOnMobile,
  presentation = "compact",
  heroHalo = false,
  heroHaloRef,
}: GoISidebarBadgeProps) {
  const isHero = presentation === "hero";
  const showHalo = isHero && heroHalo;

  const ringClass = isHero
    ? [
        "h-[148px] w-[148px] sm:h-[180px] sm:w-[180px]",
        "rounded-full bg-neutral-950 ring-2 ring-goi-gold/40",
        "shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(212,175,55,0.18)]",
        "light:bg-white light:shadow-[0_14px_40px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(212,175,55,0.22)] light:ring-goi-gold-dim/45",
      ].join(" ")
    : [
        "h-[112px] w-[112px] max-md:h-[88px] max-md:w-[88px]",
        "rounded-full bg-neutral-950 ring-2 ring-goi-gold-dim/30 shadow-[0_8px_28px_rgba(0,0,0,0.55)]",
        "light:bg-white light:shadow-[0_8px_28px_rgba(0,0,0,0.12)]",
      ].join(" ");

  const imgClass = isHero
    ? "h-[76%] w-[76%] object-contain opacity-[0.98] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:h-[80%] sm:w-[80%] light:drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
    : "h-[72%] w-[72%] object-contain opacity-95 max-md:h-[68%] max-md:w-[68%]";

  const imgPx = isHero ? 180 : 112;

  return (
    <div
      className={[
        "sidebar-brand-goi grid justify-items-center",
        isHero ? "mx-auto w-fit max-w-full gap-4 sm:gap-5" : "w-full gap-2",
      ].join(" ")}
    >
      {showHalo ? (
        <div className="relative mx-auto mb-4 flex w-fit shrink-0 justify-center motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.045] motion-safe:group-active:scale-[0.965] sm:mb-5">
          <div
            ref={heroHaloRef}
            className="goi-hero-halo pointer-events-none absolute left-1/2 top-1/2 h-[188px] w-[188px] rounded-full sm:h-[236px] sm:w-[236px]"
            aria-hidden
          />
          <div className={`relative flex shrink-0 items-center justify-center overflow-hidden ${ringClass}`}>
            <img src={LOGO_SRC} alt="" className={imgClass} width={imgPx} height={imgPx} aria-hidden />
          </div>
        </div>
      ) : (
        <div className={`flex shrink-0 items-center justify-center overflow-hidden ${ringClass}`}>
          <img src={LOGO_SRC} alt="GoI · Group of Iron" className={imgClass} width={imgPx} height={imgPx} />
        </div>
      )}
      <p
        className={[
          "w-full text-center font-semibold uppercase tracking-[0.18em] text-goi-steel",
          isHero ? "pt-0 text-sm tracking-[0.22em] sm:text-[0.8rem]" : "pt-1 text-xs",
        ].join(" ")}
      >
        FitSocial
      </p>
      <div
        className={
          isHero
            ? "sidebar-user w-full text-center text-base font-medium text-neutral-300 light:text-zinc-700"
            : "sidebar-user w-full text-center text-sm text-neutral-400 light:text-zinc-600"
        }
      >
        {subtitle}
      </div>
      {description && (
        <p
          className={[
            "text-center leading-relaxed text-neutral-500 light:text-zinc-600",
            isHero ? "mt-4 max-w-[26rem] text-[15px] sm:max-w-[28rem] sm:text-base" : "mt-3 max-w-[20rem] text-sm",
            showDescriptionOnMobile ? "" : "hidden md:block",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {description}
        </p>
      )}
    </div>
  );
}
