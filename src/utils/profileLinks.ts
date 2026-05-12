const URL_MAX = 320;

function clip(s: string) {
  return s.length > URL_MAX ? s.slice(0, URL_MAX) : s;
}

/** Vacío o URL https válida con host que incluye `hostIncludes` (minúsculas). */
export function parseHttpsProfileUrl(raw: string, hostIncludes: string): string | null {
  const s0 = raw.trim();
  if (!s0) return "";
  if (!/^https:\/\//i.test(s0)) return null;
  try {
    const u = new URL(s0);
    if (u.protocol !== "https:") return null;
    if (hostIncludes && !u.hostname.toLowerCase().includes(hostIncludes)) return null;
    return clip(u.toString());
  } catch {
    return null;
  }
}

export function parseInstagramProfileUrl(raw: string): string | null {
  const s0 = raw.trim();
  if (!s0) return "";
  if (s0.startsWith("@")) {
    const handle = s0.slice(1).replace(/[^a-zA-Z0-9._]/g, "");
    if (!handle || handle.length > 64) return null;
    return `https://www.instagram.com/${handle}/`;
  }
  return parseHttpsProfileUrl(s0, "instagram.com");
}

export function parseStravaProfileUrl(raw: string): string | null {
  return parseHttpsProfileUrl(raw, "strava.com");
}

export function parseWebsiteProfileUrl(raw: string): string | null {
  return parseHttpsProfileUrl(raw, "");
}

export type ProfileUrlFields = {
  websiteUrl: string;
  instagramUrl: string;
  stravaUrl: string;
};

/** Devuelve mensaje de error en español o null si todo ok. */
export function validateProfileUrlFields(fields: ProfileUrlFields): string | null {
  const w = parseWebsiteProfileUrl(fields.websiteUrl);
  if (w === null) return "La web debe estar vacía o ser una URL https válida.";
  const ig = parseInstagramProfileUrl(fields.instagramUrl);
  if (ig === null) return "Instagram: vacío, @usuario o enlace https en instagram.com.";
  const st = parseStravaProfileUrl(fields.stravaUrl);
  if (st === null) return "Strava: vacío o enlace https en strava.com.";
  return null;
}
