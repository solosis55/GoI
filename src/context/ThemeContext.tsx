import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "../constants/storageKeys";

export { THEME_STORAGE_KEY };

/** Legacy = oscuro GoI · Encendido = claro terracota · Healthy = claro verde · Neon = oscuro lima */
export type ThemeMode = "legacy" | "encendido" | "healthy" | "neon";

const ORDER: ThemeMode[] = ["legacy", "encendido", "healthy", "neon"];

/** Migra valores antiguos `dark` / `light` del almacenamiento. */
export function normalizeStoredTheme(raw: string | null): ThemeMode {
  if (raw === "legacy" || raw === "encendido" || raw === "healthy" || raw === "neon") return raw;
  if (raw === "dark") return "legacy";
  if (raw === "light") return "encendido";
  return "legacy";
}

function readInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "legacy";
  const a = document.documentElement.getAttribute("data-theme");
  return normalizeStoredTheme(a);
}

export function applyThemeDom(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  /** Ciclo Legacy → Encendido → Healthy → Neon → Legacy */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    applyThemeDom(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const i = ORDER.indexOf(prev);
      const next = ORDER[(i + 1) % ORDER.length]!;
      applyThemeDom(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
