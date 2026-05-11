import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GoISidebarBadge } from "./GoISidebarBadge";

/** Han de coincidir con la animación `.goi-hero-halo` en `index.css` (22s / 14s). */
const HALO_ROTATE_MS = { slow: 22_000, fast: 14_000 } as const;

function parseCssTimeToMs(value: string): number | null {
  const token = value.split(",")[0]?.trim();
  if (!token || token === "0s") return null;
  const n = parseFloat(token);
  if (Number.isNaN(n)) return null;
  return token.endsWith("ms") ? n : n * 1000;
}

/** Cambia el periodo del giro conservando el ángulo actual (evita saltos al pasar de lento ↔ rápido). */
function syncGoIHaloRotationPeriod(el: HTMLElement, targetMs: number) {
  const computedDur = parseCssTimeToMs(getComputedStyle(el).animationDuration);
  const oldMs = computedDur && computedDur > 0 ? computedDur : HALO_ROTATE_MS.slow;

  const anims = el.getAnimations();
  const haloAnim =
    anims.find((a) => (a as CSSAnimation).animationName === "goi-halo-rotate") ?? anims[0];

  let progress = 0;
  if (haloAnim?.currentTime != null && typeof haloAnim.currentTime === "number") {
    const ct = haloAnim.currentTime;
    progress = oldMs > 0 ? (ct % oldMs) / oldMs : 0;
    if (!Number.isFinite(progress)) progress = 0;
  }

  const delaySec = (-progress * targetMs) / 1000;
  el.style.animation = `goi-halo-rotate ${targetMs / 1000}s linear ${delaySec}s infinite`;
}

type Phase = "enter" | "idle" | "exit";

type LoginHeroBrandProps = {
  subtitle: ReactNode;
  description?: ReactNode;
  showDescriptionOnMobile?: boolean;
  /** Tras terminar la animación de salida del logo (desmontaje desde el padre). */
  onDismissComplete?: () => void;
};

/**
 * Pantalla inicial solo marca: logo centrado, halo ; clic → desaparece lentamente → el padre muestra el formulario (`onDismissComplete`).
 */
export function LoginHeroBrand({
  subtitle,
  description,
  showDescriptionOnMobile,
  onDismissComplete,
}: LoginHeroBrandProps) {
  const [phase, setPhase] = useState<Phase>("enter");
  const dismissedRef = useRef(false);
  const haloRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    try {
      reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotionRef.current) {
        setPhase("idle");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const onHaloHoverStart = useCallback(() => {
    if (reducedMotionRef.current || phase !== "idle") return;
    const el = haloRef.current;
    if (!el) return;
    syncGoIHaloRotationPeriod(el, HALO_ROTATE_MS.fast);
  }, [phase]);

  const onHaloHoverEnd = useCallback(() => {
    if (reducedMotionRef.current) return;
    const el = haloRef.current;
    if (!el) return;
    syncGoIHaloRotationPeriod(el, HALO_ROTATE_MS.slow);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPhase((p) => (p === "enter" ? "idle" : p));
    }, 1200);
    return () => window.clearTimeout(id);
  }, []);

  const showExitTransition = phase === "exit";

  return (
    <div
      className={[
        "relative z-[1] flex w-full max-w-lg flex-col items-center",
        phase === "enter" ? "auth-hero-enter-motion" : "",
        showExitTransition
          ? "pointer-events-none opacity-0 motion-safe:scale-[0.92] motion-safe:transition-[opacity,transform] motion-safe:duration-1000 motion-safe:ease-in-out"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onAnimationEnd={(e) => {
        if (e.animationName !== "authHeroEnter" || phase !== "enter") return;
        setPhase("idle");
      }}
      onTransitionEnd={(e) => {
        if (!showExitTransition || dismissedRef.current || e.propertyName !== "opacity") return;
        dismissedRef.current = true;
        onDismissComplete?.();
      }}
    >
      <button
        type="button"
        className={[
          "group login-hero-brand-trigger w-fit max-w-full rounded-2xl px-2 pb-1 pt-2 text-center outline-none",
          "focus-visible:ring-2 focus-visible:ring-neutral-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-zinc-400/50 light:focus-visible:ring-offset-zinc-100",
          phase !== "idle" ? "cursor-default" : "cursor-pointer",
        ].join(" ")}
        onMouseEnter={onHaloHoverStart}
        onMouseLeave={onHaloHoverEnd}
        disabled={phase !== "idle"}
        aria-label={
          phase === "idle"
            ? "Ocultar marca y continuar al formulario de acceso"
            : phase === "enter"
              ? "Cargando animación de marca"
              : "Marca"
        }
        onClick={() => {
          if (phase === "idle") setPhase("exit");
        }}
      >
        <GoISidebarBadge
          presentation="hero"
          heroHalo
          heroHaloRef={haloRef}
          subtitle={subtitle}
          description={description}
          showDescriptionOnMobile={showDescriptionOnMobile}
        />
        {phase === "idle" ? (
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-neutral-500 opacity-90 motion-safe:transition-opacity group-hover:opacity-100 light:text-zinc-500">
            Pulsa para iniciar sesión
          </p>
        ) : null}
      </button>
    </div>
  );
}
