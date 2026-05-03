export function sanitizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeEmail(value: unknown) {
  return sanitizeText(value).toLowerCase();
}

export function isLengthBetween(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}

export function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => sanitizeText(item)).filter(Boolean);
}
