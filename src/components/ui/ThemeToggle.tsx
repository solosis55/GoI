import { useTheme } from "../../context/ThemeContext";

function IconSun({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function IconLeaf({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 8.8-1.7 5.5-5 7.2-10 9.2Z"
      />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M14 16c-2.5-1.5-4-4-4-7 3 1 5.5 3 7 5Z" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"
      />
    </svg>
  );
}

type ThemeToggleProps = {
  className?: string;
};

/** Cicla Legacy → Encendido → Healthy → Neon → Legacy (`data-theme` en `<html>`). */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLegacy = theme === "legacy";

  const icon =
    theme === "legacy" ? (
      <IconMoon className="size-5" />
    ) : theme === "encendido" ? (
      <IconSun className="size-5" />
    ) : theme === "healthy" ? (
      <IconLeaf className="size-5" />
    ) : (
      <IconBolt className="size-5" />
    );

  const ariaLabel =
    isLegacy
      ? "Tema Legacy (oscuro). Cambiar a Encendido"
      : theme === "encendido"
        ? "Tema Encendido (claro terracota). Cambiar a Healthy"
        : theme === "healthy"
          ? "Tema Healthy (claro verde). Cambiar a Neon"
          : "Tema Neon (oscuro lima). Cambiar a Legacy";

  const title =
    isLegacy
      ? "Legacy → Encendido"
      : theme === "encendido"
        ? "Encendido → Healthy"
        : theme === "healthy"
          ? "Healthy → Neon"
          : "Neon → Legacy";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-300 transition-colors",
        "hover:border-goi-gold/40 hover:text-goi-gold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:border-zinc-300 light:bg-white light:text-zinc-700 light:hover:border-goi-gold/55 light:hover:text-goi-gold light:focus-visible:ring-offset-white light:focus-visible:ring-goi-gold/45",
        "healthy:hover:border-goi-gold-dim/35 healthy:hover:text-goi-gold-dim healthy:focus-visible:ring-goi-gold-dim/40",
        "neon:hover:border-goi-gold/55 neon:hover:text-goi-gold neon:focus-visible:ring-goi-gold/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      title={title}
    >
      {icon}
    </button>
  );
}
