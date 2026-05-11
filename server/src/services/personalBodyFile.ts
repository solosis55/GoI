import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultDir = resolve(currentDir, "../../data/personal-body");

/** UUID v4 (acepta mayúsculas). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSafePersonalBodyUserId(id: string): boolean {
  return UUID_RE.test(id);
}

function getDir(): string {
  const env = process.env.FITSOCIAL_PERSONAL_BODY_DIR?.trim();
  if (env) return resolve(env);
  if (process.env.VERCEL) return join("/tmp", "fitsocial-personal-body");
  return defaultDir;
}

function pathFor(userId: string): string | null {
  if (!isSafePersonalBodyUserId(userId)) return null;
  return join(getDir(), `${userId}.json`);
}

export function readPersonalBodyEnvelopeRaw(userId: string): string | null {
  const p = pathFor(userId);
  if (!p || !existsSync(p)) return null;
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function writePersonalBodyEnvelopeRaw(userId: string, jsonBody: string): void {
  const p = pathFor(userId);
  if (!p) throw new Error("invalid user id");
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, jsonBody, "utf8");
}
