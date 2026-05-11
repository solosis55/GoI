import type { Request, Response } from "express";
import {
  readPersonalBodyEnvelopeRaw,
  writePersonalBodyEnvelopeRaw,
} from "../services/personalBodyFile.js";

/** JSON máximo por usuario (fotos base64); por debajo del límite express.json global. */
const MAX_ENVELOPE_CHARS = 14_000_000;

type BodyEnvelope = {
  serverWrittenAt: string;
  bundle: unknown;
};

function parseEnvelope(raw: string): BodyEnvelope | null {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o.serverWrittenAt !== "string") return null;
    if (Number.isNaN(Date.parse(o.serverWrittenAt))) return null;
    return { serverWrittenAt: o.serverWrittenAt, bundle: o.bundle };
  } catch {
    return null;
  }
}

/** GET /api/auth/personal-body */
export function getPersonalBody(req: Request, res: Response) {
  const userId = res.locals.authUserId as string;
  const raw = readPersonalBodyEnvelopeRaw(userId);
  if (!raw) {
    res.json({ serverWrittenAt: null, bundle: null });
    return;
  }
  const env = parseEnvelope(raw);
  if (!env) {
    res.status(500).json({ code: "PERSONAL_BODY_CORRUPT", message: "No se pudo leer el archivo de datos personales." });
    return;
  }
  res.json({ serverWrittenAt: env.serverWrittenAt, bundle: env.bundle });
}

/** PUT /api/auth/personal-body — reemplazo completo del bundle. */
export function putPersonalBody(req: Request, res: Response) {
  const userId = res.locals.authUserId as string;
  const bundle = (req.body as { bundle?: unknown })?.bundle;
  if (bundle === undefined || bundle === null || typeof bundle !== "object") {
    res.status(400).json({
      code: "PERSONAL_BODY_INVALID",
      message: "El cuerpo debe ser JSON con { bundle: { ... } }.",
    });
    return;
  }

  const serverWrittenAt = new Date().toISOString();
  const envelope = JSON.stringify({ serverWrittenAt, bundle }, null, 0);

  if (envelope.length > MAX_ENVELOPE_CHARS) {
    res.status(413).json({
      code: "PERSONAL_BODY_TOO_LARGE",
      message: "Los datos superan el tamaño máximo permitido (reduce fotos o historial).",
    });
    return;
  }

  try {
    writePersonalBodyEnvelopeRaw(userId, envelope);
    res.json({ ok: true, serverWrittenAt });
  } catch {
    res.status(500).json({ code: "PERSONAL_BODY_WRITE_FAILED", message: "No se pudo guardar en disco." });
  }
}
