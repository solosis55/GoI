import type { ThemeMode } from "../context/ThemeContext";

/** Logo principal segun tema (PNG: Legacy clásico; Encendido / Healthy / Neon = assets en public/branding). */
export function brandingLogoSrc(theme: ThemeMode): string {
  switch (theme) {
    case "encendido":
      return "/branding/goi-logo-theme-encendido.png";
    case "healthy":
      return "/branding/goi-logo-theme-healthy.png";
    case "neon":
      return "/branding/goi-logo-theme-neon.png";
    default:
      return "/branding/goi-logo.png";
  }
}
