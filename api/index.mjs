/**
 * Vercel serverless entry: todas las peticiones reescritas desde `/api/*`
 * llegan aquí y las gestiona la misma app Express que en `npm run start:deploy`.
 *
 * Requisitos de build: `server/dist/**` debe existir (ver `vercel.json` y `npm run build:deploy`).
 */
import app from "../server/dist/app.js";

export default app;
