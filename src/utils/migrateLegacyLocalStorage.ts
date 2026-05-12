function migrateStorage(store: Storage, legacyPrefix: string) {
  const prefix = `${legacyPrefix}:`;
  const keys = [...Object.keys(store)];
  for (const key of keys) {
    if (!key.startsWith(prefix)) continue;
    const nextKey = `goi:${key.slice(prefix.length)}`;
    if (store.getItem(nextKey) == null) {
      const v = store.getItem(key);
      if (v != null) store.setItem(nextKey, v);
    }
  }
}

/**
 * Migra claves antiguas (`fitsocial:*`, `fit-social-auth`) a las actuales (`goi:*`, `goi-auth`).
 * Ejecutar una vez al arrancar la SPA (antes de leer tema/sesión).
 */
export function migrateLegacyLocalStorage(): void {
  try {
    if (typeof localStorage !== "undefined") {
      migrateStorage(localStorage, "fitsocial");
      const oldAuth = localStorage.getItem("fit-social-auth");
      if (oldAuth != null && localStorage.getItem("goi-auth") == null) {
        localStorage.setItem("goi-auth", oldAuth);
      }
    }
    if (typeof sessionStorage !== "undefined") {
      migrateStorage(sessionStorage, "fitsocial");
    }
  } catch {
    /* ignore */
  }
}
