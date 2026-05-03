import { randomUUID } from "node:crypto";
import { sanitizeWorkoutTags } from "./validation.js";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  /** SHA-256 hex del token de un solo uso; no se expone por API. */
  passwordResetTokenHash?: string;
  /** ISO 8601; caducidad del token de restablecimiento. */
  passwordResetExpires?: string;
};

export type Workout = {
  id: string;
  userId: string;
  title: string;
  description: string;
  exercises: string[];
  /** Etiquetas libres (p. ej. "pecho", "tiron") para filtrar y organizar. */
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

/** Registro de que el usuario realizo un entrenamiento (plantilla) en una fecha. */
export type WorkoutSession = {
  id: string;
  userId: string;
  workoutId: string;
  /** ISO 8601 (instante aproximado de la sesion). */
  performedAt: string;
  notes: string;
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  content: string;
  workoutId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Like = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Follow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

export const store = {
  users: [] as User[],
  workouts: [] as Workout[],
  workoutSessions: [] as WorkoutSession[],
  posts: [] as Post[],
  likes: [] as Like[],
  comments: [] as Comment[],
  follows: [] as Follow[],
};

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const defaultRepoStorePath = resolve(currentDir, "../../data/store.json");

/** Ruta del JSON persistido. En Vercel las funciones solo escriben bien en `/tmp` (ver `docs/deploy.md`). */
function getDataFilePath(): string {
  const fromEnv = process.env.FITSOCIAL_STORE_PATH?.trim();
  if (fromEnv) return resolve(fromEnv);
  if (process.env.VERCEL) return join("/tmp", "fitsocial-store.json");
  return defaultRepoStorePath;
}

export function createId() {
  return randomUUID();
}

type PersistedStore = {
  users: User[];
  workouts: Workout[];
  workoutSessions?: WorkoutSession[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  follows: Follow[];
};

export function initializeStore() {
  const dataFilePath = getDataFilePath();
  if (!existsSync(dataFilePath)) {
    mkdirSync(dirname(dataFilePath), { recursive: true });
    if (process.env.VERCEL && existsSync(defaultRepoStorePath)) {
      copyFileSync(defaultRepoStorePath, dataFilePath);
    } else {
      writeFileSync(dataFilePath, JSON.stringify(store, null, 2), "utf-8");
    }
  }

  const raw = readFileSync(dataFilePath, "utf-8");
  const parsed = JSON.parse(raw) as Partial<PersistedStore>;
  store.users = Array.isArray(parsed.users)
    ? parsed.users.map((user) => ({
        ...user,
        bio: user.bio ?? "",
        goal: user.goal ?? "",
        avatarUrl: user.avatarUrl ?? "",
        updatedAt: user.updatedAt ?? user.createdAt ?? new Date().toISOString(),
      }))
    : [];
  store.workouts = Array.isArray(parsed.workouts)
    ? parsed.workouts.map((w) => ({
        ...w,
        tags: sanitizeWorkoutTags(Array.isArray(w.tags) ? w.tags : []),
      }))
    : [];
  store.workoutSessions = Array.isArray(parsed.workoutSessions) ? parsed.workoutSessions : [];
  store.posts = Array.isArray(parsed.posts) ? parsed.posts : [];
  store.likes = Array.isArray(parsed.likes) ? parsed.likes : [];
  store.comments = Array.isArray(parsed.comments) ? parsed.comments : [];
  store.follows = Array.isArray(parsed.follows) ? parsed.follows : [];
}

export function saveStore() {
  const dataFilePath = getDataFilePath();
  mkdirSync(dirname(dataFilePath), { recursive: true });
  writeFileSync(dataFilePath, JSON.stringify(store, null, 2), "utf-8");
}
