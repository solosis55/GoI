/**
 * Datos públicos opcionales (prefijo `VITE_` para el cliente).
 * En producción, define por ejemplo `VITE_CONTACT_EMAIL` en el hosting.
 */
export const PUBLIC_CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL ?? "").trim();
