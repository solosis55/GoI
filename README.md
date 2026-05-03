# FitSocial · GoI (Group of Iron)

Web tipo **red social + deporte**: publicar progreso en un feed comunitario, llevar **entrenamientos**, edición de **perfil** y relaciones básicas (**seguir usuarios**, likes y comentarios). El nombre de producto en la UI es *FitSocial*; el proyecto de idea y planificación se relaciona con **GoI (Group of Iron)**.

**Seguimiento y tareas:** tablero en Trello — [https://trello.com/b/6Yn18TWn/red-social-goi](https://trello.com/b/6Yn18TWn/red-social-goi)

## Alcance actual (MVP)

- Registro, inicio de sesión, sesión persistida en el cliente (JWT).
- Recuperación de contraseña preparada en API y flujo en pantalla de auth (en producción falta integrar envío de correo; en local ver `server/.env.example` y `AUTH_RESET_RETURN_TOKEN`).
- Feed con publicaciones, filtro “Todos / Seguidos”, likes y comentarios.
- CRUD de entrenamientos por usuario.
- Perfil deportivo (usuario, bio, objetivo, avatar).
- API con validación, rate limit en auth y tests de seguridad básicos (`server`).

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, `react-router-dom` (uso principal: shell por pestañas) |
| Backend | Node.js, Express 5, TypeScript, JWT, bcrypt, persistencia en **`server/data/store.json`** |
| Calidad | ESLint (raíz), Vitest + supertest (`server`) |

## Requisitos

- **Node.js** 22+ recomendado (LTS actual). Comprueba con `node -v`.

## Desarrollo local

1. **Instalar dependencias** (desde la raíz del repo):

   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Variables del servidor** (opcional en local): copia `server/.env.example` a `server/.env` y ajusta. Para JWT en entornos cercanos a producción define `JWT_SECRET`.

3. **Arrancar**:

   - Frontend: en la raíz, `npm run dev` → suele quedar en `http://localhost:5173`.
   - Backend: en la carpeta `server`, `npm run dev` → API en `http://localhost:4000` (puerto configurable con `PORT`).

   El cliente usa por defecto `http://localhost:4000/api` en modo desarrollo (`src/api/client.ts`).

## Scripts útiles (raíz)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo Vite (frontend). |
| `npm run build` | Build del frontend (`dist/`). |
| `npm run build:server` | Compila solo el backend (`server/dist/`). |
| `npm run build:deploy` | Build frontend + backend (listo para un solo proceso o Docker). |
| `npm run start:deploy` | Ejecuta `node server/dist/server.js` (**desde la raíz del repo**, con `NODE_ENV=production` y frontend ya construido). |
| `npm run lint` | ESLint sobre el frontend. |

En `server/`: `npm test` ejecuta Vitest.

## Despliegue

Guía detallada (variables, Docker, persistencia de `store.json`, checklist): **[docs/deploy.md](./docs/deploy.md)**.

## Documentación en el repo

- [docs/idea.md](./docs/idea.md) — visión GoI y funcionalidades planteadas.
- [docs/project-management.md](./docs/project-management.md) — estado del MVP, checklist y decisiones recientes.
- [docs/design.md](./docs/design.md) — arquitectura, API y convenciones de front.
- [docs/components.md](./docs/components.md) — componentes reutilizables.

## Estructura rápida

```text
├── src/              # React (páginas, componentes, api, context)
├── server/src/       # Express (rutas, controladores, servicios, tests)
├── server/data/      # store.json (persistencia local del MVP)
├── docs/             # Documentación de producto y técnica
└── public/           # Estáticos públicos del frontend (favicon, etc.)
```

## Estado

MVP en evolución; la base de datos en fichero JSON es adecuada para pruebas y demos. Para producción a medio plazo conviene **volumen persistente** en el host o migración a una base de datos gestionada.
