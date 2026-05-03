# Despliegue (MVP)

Objetivo: publicar **frontend + API en un solo origen** (`/` la SPA, `/api/*` el backend) para evitar CORS y configurar una sola URL en produccion.

## Que hace el proyecto en produccion

1. **Cliente** (`npm run build` en la raiz): genera estáticos en `/dist` con `VITE_API_URL` no definida → el cliente llama a rutas **relativas** `/api` (ver `src/api/client.ts`).
2. **Servidor** (`npm run build` en `server`): compila Express a `server/dist/`.
3. Con `NODE_ENV=production` y existiendo `dist/index.html` junto al repo (desde `server/dist` se resuelve `../../dist`), Express:
   - sirve archivos estáticos de esa carpeta,
   - ante `GET`/`HEAD` que **no** empiezan por `/api`, devuelve `index.html` (SPA),
   - usa `trust proxy` para que rate limit y IPs detrás de reverse proxy sean correctos.

La **salud** del servicio: `GET /api/health`.

## Variables de entorno obligatorias / recomendadas

| Variable | Donde | Produccion |
|---------|--------|------------|
| `NODE_ENV` | Servidor | `production` |
| `JWT_SECRET` | Servidor | **Obligatoria** antes de login/registro en produccion (emisión del JWT falla sin ella; ver `server/src/services/auth.ts`) |
| `PORT` | Servidor | La asigna casi todo PaaS (Render, Fly, Railway). Por defecto local `4000`. |
| `VITE_API_URL` | **Build** del cliente | Solo si front y API van en **hosts distintos**; entonces `https://api.tudominio.com/api` y el build debe hacerse con esa variable definida. |
| `FITSOCIAL_STORE_PATH` | Servidor (opcional) | Ruta absoluta al `store.json` en runtime. Si no se define, en **Vercel** se usa `/tmp/fitsocial-store.json` (ver arriba). |

Consulta `server/.env.example` para variables adicionales opcionales (`AUTH_RESET_RETURN_TOKEN`, etc.).

## Persistencia (importante)

Los datos viven en **`server/data/store.json`** (o en la ruta definida por **`FITSOCIAL_STORE_PATH`**). En contenedores/PaaS sin **volumen persistente**, el fichero se pierde al redesplegar o recrear la instancia.

- **MVP**: aceptable para pruebas.
- **Vercel (serverless)**: con `VERCEL=1` el store por defecto se escribe en **`/tmp/fitsocial-store.json`** (copia inicial desde `server/data/store.json` del despliegue). Los datos **no** son duraderos entre instancias ni equivalentes a un disco persistente; sirve para demos. Producción seria: base de datos o almacen gestionado.
- **Siguiente paso**: volumen Docker, disco persistente en el proveedor, o base de datos.

## Build y arranque manual (sin Docker)

En la **raiz del repo**:

```bash
npm run build:deploy
```

En el **servidor**, con el directorio de trabajo en la **raiz del repo** (para que `dist/` sea accesible desde `server/dist`):

```bash
set NODE_ENV=production
set JWT_SECRET=tu_secreto_largo
node server/dist/server.js
```

(Linux/macOS: `export NODE_ENV=production` y `export JWT_SECRET=...`)

## Docker

Desde la raiz del repo:

```bash
docker build -t fitsocial-mvp .
docker run --rm -p 4000:4000 -e NODE_ENV=production -e JWT_SECRET=un_secreto_largo_aleatorio fitsocial-mvp
```

Monta un volumen si quieres conservar datos, por ejemplo `-v fitsocial-data:/app/server/data`.

## Plataformas tipo Render / Railway / Fly

Pasos típicos:

1. Repo conectado a Git.
2. **Build**: `npm run build:deploy` (raiz del repo como contexto).
3. **Start**: `node server/dist/server.js` desde la misma raiz (o comando equivalente con `WORKDIR` en raiz).
4. Definir `JWT_SECRET` y `NODE_ENV=production` en variables del servicio.

Si la plataforma solo permite `WORKDIR` dentro de `server/`, mueve este flujo o ajusta rutas en `app.ts`; el diseño actual asume **`dist`** en **padre de `server/`**.

## Vercel (frontend + API en el mismo proyecto)

El repo incluye **`vercel.json`** y **`api/index.mjs`**: las peticiones a **`/api/*`** se enrutan a una **función serverless** que exporta la misma app **Express** compilada en `server/dist/`. El build usa **`npm run vercel-build`** (equivale a `npm run build:deploy`): Vite genera **`dist/`** y TypeScript compila el **`server/`**.

Pasos en Vercel:

1. Importa el repositorio y deja el **directorio raíz** en la raíz del monorepo (donde están `package.json`, `vercel.json` y `api/`).
2. Variables de entorno del proyecto (**Settings → Environment variables**): define al menos **`JWT_SECRET`** (obligatoria para emitir JWT en runtime; el servidor la lee al arrancar la función). Opcional: **`NODE_ENV=production`**.
3. **No** hace falta **`VITE_API_URL`** si front y API comparten el mismo dominio de Vercel (el cliente ya usa `/api` en producción).
4. Tras el deploy, prueba **`GET /api/health`** y login desde la SPA.

**Persistencia en serverless:** Vercel define **`VERCEL=1`**. El código usa **`/tmp/fitsocial-store.json`** como fichero de trabajo y, si no existe, copia el **`server/data/store.json`** empaquetado con la función (solo lectura en el bundle). Los datos pueden **perderse** al crear nuevas instancias o tras cierto tiempo; no sustituye una base de datos.

**Archivos incluidos en la función:** en `vercel.json`, **`includeFiles` debe ser un solo glob (cadena ≤256 caracteres)** según el esquema de Vercel; usamos **`"server/dist/**"`**. Tras compilar el servidor, el script **`server/scripts/copy-store-for-dist.mjs`** copia **`server/data/store.json`** a **`server/dist/data/store.json`** para que el seed viaje dentro de `dist/`.

### Si solo desplegaste el front (sin `api/` ni build de servidor)

Si el proyecto en Vercel **no** usa este `vercel.json` o el build no ejecuta `npm run vercel-build`, las peticiones a **`/api`** no llegarán a Express.

**Alternativas:**

- **API en otro host:** despliega Express en Render, Railway, Fly, etc., y define **`VITE_API_URL`** en el build de Vercel (rebuild obligatorio).
- **Proxy:** reescribe `/api/:path*` hacia un backend externo (URL fija o según documentación de Vercel).

## Checklist antes de abrir al publico

- [ ] `JWT_SECRET` definida y no incluida en el repositorio.
- [ ] `AUTH_RESET_RETURN_TOKEN` **no** activada en produccion (solo desarrollo sin email real).
- [ ] Probado `/`, carga JS/CSS y login contra `/api/auth/login`.
- [ ] Decision tomada sobre **persistencia** de `store.json` o migracion futura.
