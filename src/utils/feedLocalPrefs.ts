/** Preferencias locales del feed (guardados, silenciados, reportes) por usuario. */

export const OPEN_FEED_COMPOSER_SESSION_KEY = "goi:openFeedComposer";

/** Marca que al abrir Inicio debe abrirse el compositor de publicación (una vez). */
export function stashOpenFeedComposerRequest() {
  try {
    sessionStorage.setItem(OPEN_FEED_COMPOSER_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

const savedKey = (userId: string) => `goi:feedSaved:${userId}`;
const mutedKey = (userId: string) => `goi:feedMuted:${userId}`;
const reportsKey = (userId: string) => `goi:feedReports:${userId}`;

export type LocalFeedReport = {
  postId: string;
  authorId: string;
  reason: string;
  createdAt: string;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadSavedPostIds(userId: string): string[] {
  const raw = readJson<string[]>(savedKey(userId), []);
  return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
}

export function saveSavedPostIds(userId: string, ids: string[]) {
  writeJson(savedKey(userId), ids);
}

export function toggleSavedPost(userId: string, postId: string): boolean {
  const ids = loadSavedPostIds(userId);
  const i = ids.indexOf(postId);
  if (i >= 0) {
    ids.splice(i, 1);
    saveSavedPostIds(userId, ids);
    return false;
  }
  ids.unshift(postId);
  saveSavedPostIds(userId, ids.slice(0, 500));
  return true;
}

/** Quita de la lista local IDs que ya no existen en el servidor (p. ej. post borrado). Devuelve cuántos se eliminaron. */
export function pruneSavedPostIdsToExisting(userId: string, existingPostIds: Set<string>): number {
  const ids = loadSavedPostIds(userId);
  const next = ids.filter((id) => existingPostIds.has(id));
  const removed = ids.length - next.length;
  if (removed > 0) saveSavedPostIds(userId, next);
  return removed;
}

export function loadMutedUserIds(userId: string): string[] {
  const raw = readJson<string[]>(mutedKey(userId), []);
  return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
}

export function saveMutedUserIds(userId: string, ids: string[]) {
  writeJson(mutedKey(userId), ids);
}

export function muteUser(userId: string, targetUserId: string) {
  if (targetUserId === userId) return;
  const ids = new Set(loadMutedUserIds(userId));
  ids.add(targetUserId);
  saveMutedUserIds(userId, [...ids]);
}

export function unmuteUser(userId: string, targetUserId: string) {
  const ids = loadMutedUserIds(userId).filter((id) => id !== targetUserId);
  saveMutedUserIds(userId, ids);
}

export function clearMutedUsers(userId: string) {
  saveMutedUserIds(userId, []);
}

export function appendLocalReport(viewerId: string, entry: Omit<LocalFeedReport, "createdAt"> & { createdAt?: string }) {
  const list = readJson<LocalFeedReport[]>(reportsKey(viewerId), []);
  const row: LocalFeedReport = {
    ...entry,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  list.unshift(row);
  writeJson(reportsKey(viewerId), list.slice(0, 200));
}
