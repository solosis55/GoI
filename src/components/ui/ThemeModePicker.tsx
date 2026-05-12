import type { ThemeMode } from "../../context/ThemeContext";
import { useTheme } from "../../context/ThemeContext";

type ThemeOption = {
  id: ThemeMode;
  title: string;
  description: string;
};

const TEMAS_CLAROS: ThemeOption[] = [
  {
    id: "encendido",
    title: "Encendido",
    description: "Claro con acentos terracota y naranja quemado; buen contraste al sol.",
  },
  {
    id: "healthy",
    title: "Healthy",
    description: "Claro con fondo blanco y acentos verdes suaves.",
  },
];

const TEMAS_OSCUROS: ThemeOption[] = [
  {
    id: "legacy",
    title: "Legacy",
    description: "Oscuro clásico GoI (negro y oro).",
  },
  {
    id: "neon",
    title: "Neon",
    description: "Oscuro con negro y acento lima (sin oro).",
  },
];

function selectedClasses(id: ThemeMode): string {
  if (id === "encendido") {
    return "border-goi-gold/70 bg-neutral-900/80 encendido:border-goi-gold/85 encendido:bg-goi-gold/[0.14]";
  }
  if (id === "healthy") {
    return "border-goi-gold/70 bg-neutral-900/80 light:border-goi-gold/75 light:bg-zinc-100/95";
  }
  if (id === "neon") {
    return "border-goi-gold/80 bg-neutral-950/95";
  }
  return "border-goi-gold/70 bg-neutral-900/80";
}

type ThemeModePickerProps = {
  className?: string;
};

export function ThemeModePicker({ className = "" }: ThemeModePickerProps) {
  const { theme, setTheme } = useTheme();

  const renderOption = (o: ThemeOption) => {
    const selected = theme === o.id;
    return (
      <button
        key={o.id}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => setTheme(o.id)}
        className={[
          "flex min-h-[3.25rem] min-w-[10rem] flex-1 flex-col items-stretch rounded-xl border px-3 py-2.5 text-left transition-colors sm:min-w-[11rem]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "light:focus-visible:ring-offset-white",
          selected
            ? selectedClasses(o.id)
            : "border-neutral-700 bg-neutral-950/40 hover:border-neutral-600 light:border-zinc-300 light:bg-white light:hover:border-zinc-400",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "text-sm font-semibold",
            selected ? "text-goi-gold" : "text-neutral-200 light:text-zinc-800",
          ].join(" ")}
        >
          {o.title}
        </span>
        <span className="mt-0.5 text-xs leading-snug text-neutral-500 light:text-zinc-600">{o.description}</span>
      </button>
    );
  };

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la aplicación"
      className={["w-full space-y-6 sm:max-w-2xl", className].filter(Boolean).join(" ")}
    >
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 light:text-zinc-500">
          Temas claros
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{TEMAS_CLAROS.map(renderOption)}</div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 light:text-zinc-500">
          Temas oscuros
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{TEMAS_OSCUROS.map(renderOption)}</div>
      </div>
    </div>
  );
}
