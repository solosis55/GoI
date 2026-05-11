import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
/** Misma carpeta que `store.json`: queda en el repo / máquina de desarrollo. */
const defaultRepoPath = resolve(currentDir, "../../data/personal-roadmap.json");

function getFilePath(): string {
  const env = process.env.FITSOCIAL_PERSONAL_ROADMAP_PATH?.trim();
  if (env) return resolve(env);
  if (process.env.VERCEL) return join("/tmp", "fitsocial-personal-roadmap.json");
  return defaultRepoPath;
}

export function getPersonalRoadmapFilePath(): string {
  return getFilePath();
}

export function readPersonalRoadmapFileRaw(): string | null {
  const p = getFilePath();
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function writePersonalRoadmapFileRaw(jsonBody: string): void {
  const p = getFilePath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, jsonBody, "utf8");
}
