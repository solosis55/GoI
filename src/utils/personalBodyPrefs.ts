/** Métricas y extensiones (historial, fotos, objetivos) solo en este dispositivo. */

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const LEGACY_KEY = (userId: string) => `fitsocial:personalBody:${userId}`;
const BUNDLE_KEY = (userId: string) => `fitsocial:personalBundle:v2:${userId}`;

const MAX_HISTORY = 150;
const MAX_PHOTOS = 18;
/** ~4.5M caracteres base64 sería el límite teórico de localStorage; cortamos antes. */
const MAX_STORED_PHOTO_CHARS = 450_000;

export type PersonalBodyMetrics = {
  weightKg: number | null;
  heightCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  /** Legado: si solo hay esto, se puede copiar a ambos brazos en UI */
  bicepsCm: number | null;
  bicepsLeftCm: number | null;
  bicepsRightCm: number | null;
  forearmCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  neckCm: number | null;
  /** % grasa corporal estimada ( báscula / plicómetro ), opcional */
  bodyFatPercent: number | null;
};

export const EMPTY_PERSONAL_BODY: PersonalBodyMetrics = {
  weightKg: null,
  heightCm: null,
  chestCm: null,
  waistCm: null,
  hipsCm: null,
  bicepsCm: null,
  bicepsLeftCm: null,
  bicepsRightCm: null,
  forearmCm: null,
  thighCm: null,
  calfCm: null,
  neckCm: null,
  bodyFatPercent: null,
};

export type PersonalGoals = {
  targetWeightKg: number | null;
  targetWaistCm: number | null;
  /** ISO date YYYY-MM-DD */
  targetDate: string | null;
  note: string;
};

export const EMPTY_GOALS: PersonalGoals = {
  targetWeightKg: null,
  targetWaistCm: null,
  targetDate: null,
  note: "",
};

export type BodySnapshot = {
  id: string;
  at: string;
  metrics: PersonalBodyMetrics;
  note: string;
};

export type ProgressPhoto = {
  id: string;
  at: string;
  dataUrl: string;
  caption: string;
};

export type PersonalBodyBundle = {
  version: 2;
  /** ISO 8601; última escritura local (comparar con servidor para fusión). */
  updatedAt?: string;
  metrics: PersonalBodyMetrics;
  goals: PersonalGoals;
  history: BodySnapshot[];
  photos: ProgressPhoto[];
};

function clampPositive(n: number | null | undefined): number | null {
  if (n == null || Number.isNaN(n)) return null;
  if (n <= 0) return null;
  return n;
}

function clampPercent(n: number | null | undefined): number | null {
  if (n == null || Number.isNaN(n)) return null;
  if (n < 3 || n > 70) return null;
  return Math.round(n * 10) / 10;
}

export function sanitizePersonalBody(raw: unknown): PersonalBodyMetrics {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PERSONAL_BODY };
  const o = raw as Record<string, unknown>;
  const num = (k: keyof PersonalBodyMetrics) => {
    const v = o[k];
    return clampPositive(typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN);
  };
  const pct = () => {
    const v = o.bodyFatPercent;
    return clampPercent(typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN);
  };
  return {
    weightKg: num("weightKg"),
    heightCm: num("heightCm"),
    chestCm: num("chestCm"),
    waistCm: num("waistCm"),
    hipsCm: num("hipsCm"),
    bicepsCm: num("bicepsCm"),
    bicepsLeftCm: num("bicepsLeftCm"),
    bicepsRightCm: num("bicepsRightCm"),
    forearmCm: num("forearmCm"),
    thighCm: num("thighCm"),
    calfCm: num("calfCm"),
    neckCm: num("neckCm"),
    bodyFatPercent: pct(),
  };
}

function sanitizeGoals(raw: unknown): PersonalGoals {
  if (!raw || typeof raw !== "object") return { ...EMPTY_GOALS };
  const o = raw as Record<string, unknown>;
  const td = o.targetDate;
  const dateStr =
    typeof td === "string" && /^\d{4}-\d{2}-\d{2}$/.test(td.trim()) ? td.trim() : null;
  const note = typeof o.note === "string" ? o.note.slice(0, 2000) : "";
  return {
    targetWeightKg: clampPositive(
      typeof o.targetWeightKg === "number"
        ? o.targetWeightKg
        : parseFloat(String(o.targetWeightKg ?? "")),
    ),
    targetWaistCm: clampPositive(
      typeof o.targetWaistCm === "number"
        ? o.targetWaistCm
        : parseFloat(String(o.targetWaistCm ?? "")),
    ),
    targetDate: dateStr,
    note,
  };
}

function sanitizeSnapshot(raw: unknown): BodySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const at = typeof o.at === "string" ? o.at : "";
  if (!id || !at) return null;
  const note = typeof o.note === "string" ? o.note.slice(0, 2000) : "";
  return { id, at, metrics: sanitizePersonalBody(o.metrics), note };
}

function sanitizePhoto(raw: unknown): ProgressPhoto | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const at = typeof o.at === "string" ? o.at : "";
  const dataUrl = typeof o.dataUrl === "string" ? o.dataUrl : "";
  const caption = typeof o.caption === "string" ? o.caption.slice(0, 500) : "";
  if (!id || !at || !dataUrl.startsWith("data:image/")) return null;
  if (dataUrl.length > MAX_STORED_PHOTO_CHARS) return null;
  return { id, at, dataUrl, caption };
}

export function sanitizeBundle(raw: unknown): PersonalBodyBundle {
  if (!raw || typeof raw !== "object") return defaultBundle();
  const o = raw as Record<string, unknown>;
  const historyRaw = Array.isArray(o.history) ? o.history : [];
  const photosRaw = Array.isArray(o.photos) ? o.photos : [];
  const history = historyRaw.map(sanitizeSnapshot).filter(Boolean) as BodySnapshot[];
  const photos = photosRaw.map(sanitizePhoto).filter(Boolean) as ProgressPhoto[];
  history.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const updatedAt =
    typeof o.updatedAt === "string" && !Number.isNaN(Date.parse(o.updatedAt)) ? o.updatedAt : undefined;
  return {
    version: 2,
    updatedAt,
    metrics: sanitizePersonalBody(o.metrics),
    goals: sanitizeGoals(o.goals),
    history: history.slice(-MAX_HISTORY),
    photos: photos.slice(-MAX_PHOTOS),
  };
}

export function defaultBundle(metrics: PersonalBodyMetrics = EMPTY_PERSONAL_BODY): PersonalBodyBundle {
  return {
    version: 2,
    updatedAt: undefined,
    metrics: { ...metrics },
    goals: { ...EMPTY_GOALS },
    history: [],
    photos: [],
  };
}

/** Si el servidor tiene una copia más reciente, sustituye el bundle local. */
export function mergeRemotePersonalBody(
  local: PersonalBodyBundle,
  remote: unknown,
  serverWrittenAt: string | null,
): { bundle: PersonalBodyBundle; changed: boolean } {
  if (!remote || typeof remote !== "object" || !serverWrittenAt) {
    return { bundle: local, changed: false };
  }
  const rts = Date.parse(serverWrittenAt);
  const lts = local.updatedAt ? Date.parse(local.updatedAt) : 0;
  if (Number.isNaN(rts) || rts <= lts) return { bundle: local, changed: false };
  const out = sanitizeBundle(remote);
  out.updatedAt = serverWrittenAt;
  return { bundle: out, changed: true };
}

export function loadPersonalBody(userId: string): PersonalBodyMetrics {
  return { ...loadBundle(userId).metrics };
}

export function loadBundle(userId: string): PersonalBodyBundle {
  try {
    const v2 = localStorage.getItem(BUNDLE_KEY(userId));
    if (v2) return sanitizeBundle(JSON.parse(v2));
    const leg = localStorage.getItem(LEGACY_KEY(userId));
    if (leg) {
      const metrics = sanitizePersonalBody(JSON.parse(leg));
      const b = defaultBundle(metrics);
      saveBundle(userId, b);
      return b;
    }
  } catch {
    /* ignore */
  }
  return defaultBundle();
}

export function savePersonalBody(userId: string, data: PersonalBodyMetrics) {
  const b = loadBundle(userId);
  b.metrics = { ...sanitizePersonalBody(data) };
  saveBundle(userId, b);
}

export function saveBundle(userId: string, bundle: PersonalBodyBundle) {
  const cleaned = sanitizeBundle(bundle);
  cleaned.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(BUNDLE_KEY(userId), JSON.stringify(cleaned));
  } catch {
    /* quota */
  }
}

export function saveGoals(userId: string, goals: PersonalGoals) {
  const b = loadBundle(userId);
  b.goals = sanitizeGoals(goals);
  saveBundle(userId, b);
}

export function appendHistoryEntry(userId: string, metrics: PersonalBodyMetrics, note: string) {
  const b = loadBundle(userId);
  const entry: BodySnapshot = {
    id: newId(),
    at: new Date().toISOString(),
    metrics: { ...sanitizePersonalBody(metrics) },
    note: note.slice(0, 2000),
  };
  b.history = [...b.history, entry].slice(-MAX_HISTORY);
  saveBundle(userId, b);
}

export function deleteHistoryEntry(userId: string, id: string) {
  const b = loadBundle(userId);
  b.history = b.history.filter((h) => h.id !== id);
  saveBundle(userId, b);
}

export function addProgressPhoto(userId: string, dataUrl: string, caption: string): boolean {
  const b = loadBundle(userId);
  if (b.photos.length >= MAX_PHOTOS) return false;
  if (dataUrl.length > MAX_STORED_PHOTO_CHARS) return false;
  b.photos = [
    ...b.photos,
    {
      id: newId(),
      at: new Date().toISOString(),
      dataUrl,
      caption: caption.slice(0, 500),
    },
  ].slice(-MAX_PHOTOS);
  saveBundle(userId, b);
  return true;
}

export function deleteProgressPhoto(userId: string, id: string) {
  const b = loadBundle(userId);
  b.photos = b.photos.filter((p) => p.id !== id);
  saveBundle(userId, b);
}

/** IMC si hay peso y altura válidos; si no, null. */
export function computeBmi(weightKg: number | null, heightCm: number | null): number | null {
  const w = clampPositive(weightKg);
  const h = clampPositive(heightCm);
  if (w == null || h == null) return null;
  const m = h / 100;
  if (m <= 0) return null;
  return Math.round((w / (m * m)) * 10) / 10;
}

export function exportPersonalDataCsv(userId: string): string {
  const b = loadBundle(userId);
  const headers = [
    "fecha_iso",
    "nota",
    "peso_kg",
    "altura_cm",
    "imc",
    "pecho_cm",
    "cintura_cm",
    "cadera_cm",
    "biceps_cm",
    "biceps_i_cm",
    "biceps_d_cm",
    "antebrazo_cm",
    "muslo_cm",
    "gemelo_cm",
    "cuello_cm",
    "grasa_pct",
  ];
  const lines = [headers.join(",")];
  for (const h of b.history) {
    const m = h.metrics;
    const imc = computeBmi(m.weightKg, m.heightCm);
    const row = [
      h.at,
      h.note,
      m.weightKg ?? "",
      m.heightCm ?? "",
      imc ?? "",
      m.chestCm ?? "",
      m.waistCm ?? "",
      m.hipsCm ?? "",
      m.bicepsCm ?? "",
      m.bicepsLeftCm ?? "",
      m.bicepsRightCm ?? "",
      m.forearmCm ?? "",
      m.thighCm ?? "",
      m.calfCm ?? "",
      m.neckCm ?? "",
      m.bodyFatPercent ?? "",
    ];
    lines.push(row.map(csvCell).join(","));
  }
  const m = b.metrics;
  const imcNow = computeBmi(m.weightKg, m.heightCm);
  lines.push(
    [
      new Date().toISOString(),
      "valor_actual",
      m.weightKg ?? "",
      m.heightCm ?? "",
      imcNow ?? "",
      m.chestCm ?? "",
      m.waistCm ?? "",
      m.hipsCm ?? "",
      m.bicepsCm ?? "",
      m.bicepsLeftCm ?? "",
      m.bicepsRightCm ?? "",
      m.forearmCm ?? "",
      m.thighCm ?? "",
      m.calfCm ?? "",
      m.neckCm ?? "",
      m.bodyFatPercent ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return lines.join("\n");
}

function csvEscape(s: string): string {
  const t = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

function csvCell(v: string | number): string {
  if (typeof v === "number") return String(v);
  return csvEscape(v);
}
