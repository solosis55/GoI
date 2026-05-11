# Despliegue (entrada académica)

Este archivo cumple el rol de **`docs/deployment.md`** cuando la guía del proyecto exige ese nombre. La **documentación operativa completa** está en:

**[docs/deploy.md](./deploy.md)**

Allí encontrarás:

- Objetivo **frontend + API en el mismo origen** (`/` SPA, `/api/*` backend).
- **Vercel**: `vercel.json`, `api/index.mjs`, comando `vercel-build`, variables (`JWT_SECRET`, `VERCEL`, store en `/tmp`, etc.).
- Build local monorepo (`npm run build:deploy`), Docker si aplica, checklist previo a producción.
- Persistencia de **`store.json`** y roadmap en disco / limitaciones serverless.

Tras desplegar, añade las **URLs reales** en la tabla **«Producción (URLs)»** del **[README.md](../README.md)**.
