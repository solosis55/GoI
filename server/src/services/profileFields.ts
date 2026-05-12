import { sanitizeText } from "./validation.js";
import { isValidProfileAvatarUrlCandidate } from "./postMedia.js";

const URL_MAX = 320;
const LOCATION_MAX = 80;

function clipUrl(s: string): string {
  return s.length > URL_MAX ? s.slice(0, URL_MAX) : s;
}

/** Vacío o URL https válida cuyo host coincide con `hostIncludes` (minúsculas). */
export function normalizeHttpsProfileUrl(raw: unknown, hostIncludes: string): string | null {
  const s0 = sanitizeText(raw ?? "");
  if (!s0) return "";
  if (!/^https:\/\//i.test(s0)) return null;
  try {
    const u = new URL(s0);
    if (u.protocol !== "https:") return null;
    if (!u.hostname.toLowerCase().includes(hostIncludes)) return null;
    return clipUrl(u.toString());
  } catch {
    return null;
  }
}

/** Instagram: URL https en instagram.com, o @usuario → URL perfil. */
export function normalizeInstagramProfileUrl(raw: unknown): string | null {
  const s0 = sanitizeText(raw ?? "");
  if (!s0) return "";
  if (s0.startsWith("@")) {
    const handle = s0.slice(1).replace(/[^a-zA-Z0-9._]/g, "");
    if (!handle || handle.length > 64) return null;
    return `https://www.instagram.com/${handle}/`;
  }
  return normalizeHttpsProfileUrl(s0, "instagram.com");
}

export function normalizeStravaProfileUrl(raw: unknown): string | null {
  return normalizeHttpsProfileUrl(raw, "strava.com");
}

/** Sitio web personal: cualquier https. */
export function normalizeWebsiteProfileUrl(raw: unknown): string | null {
  const s0 = sanitizeText(raw ?? "");
  if (!s0) return "";
  if (!/^https:\/\//i.test(s0)) return null;
  try {
    const u = new URL(s0);
    if (u.protocol !== "https:") return null;
    return clipUrl(u.toString());
  } catch {
    return null;
  }
}

export function normalizeProfileLocation(raw: unknown): string {
  const s = sanitizeText(raw ?? "");
  if (!s) return "";
  return s.length > LOCATION_MAX ? s.slice(0, LOCATION_MAX) : s;
}

export function isValidProfileBannerUrl(value: string): boolean {
  return isValidProfileAvatarUrlCandidate(value);
}
