# Design Decision Log (MVP)

## 1) Estructura de componentes principales

### Frontend (`src`)
- `App.tsx`: shell principal, control de sesion y navegacion por tabs (`feed`, `workouts`, `profile`).
- `context/AuthContext.tsx`: estado global de autenticacion (token, user, login/logout, persistencia local).
- `pages/AuthPage.tsx`: registro, inicio de sesion, solicitud de recuperacion de contraseña y pantalla de nueva contraseña (`?reset=token`).
- `pages/FeedPage.tsx`: timeline, crear post, likes, comentarios, seguir usuarios.
- `pages/WorkoutsPage.tsx`: CRUD de entrenamientos.
- `pages/ProfilePage.tsx`: ver/editar perfil deportivo.
- `api/*.ts`: cliente HTTP y funciones por dominio (`authApi`, `postsApi`, `workoutsApi`).
- `types/*.ts`: contratos TypeScript del cliente.

### Backend (`server/src`)
- `app.ts`: configuracion Express, middlewares y montaje de rutas.
- `routes/*.ts`: definicion de endpoints REST por recurso.
- `controllers/*.ts`: logica de negocio por endpoint.
- `services/store.ts`: almacenamiento y persistencia local en JSON.
- `server.ts`: arranque del servidor.

## 2) Componentes reutilizables (decision)

Decision actual:
- Mantener paginas feature-first para avanzar rapido en MVP.
- Extraer componentes reutilizables cuando haya repeticion clara.

Componentes reutilizables ya implementados:
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/StatusMessage.tsx`
- `components/ui/Avatar.tsx`
- `components/ui/EmptyState.tsx`
- `components/feed/PostItem.tsx`
- `components/feed/CommentList.tsx`
- `components/feed/PostComposer.tsx`
- `components/feed/PostActions.tsx`
- `components/feed/FollowSuggestionItem.tsx`
- `components/feed/StoriesRow.tsx`
- `components/feed/CreatePostForm.tsx`
- `components/feed/FeedModeTabs.tsx`
- `components/feed/UserSummaryCard.tsx`
- `components/workouts/WorkoutForm.tsx`
- `components/workouts/WorkoutItem.tsx`
- `components/profile/ProfileForm.tsx`

Siguientes candidatos a extraer:
- `components/feed/FeedSidebar.tsx`

## 3) Gestion del estado de la aplicacion

Estado global:
- `AuthContext` guarda `token` y `user`.
- Se persiste en `localStorage` (`fit-social-auth`) para mantener sesion tras recarga.

Estado local de pagina:
- Feed: posts, comentarios en borrador, sugerencias, filtros y estados UX.
- Workouts: formulario, lista, edicion y mensajes.
- Profile: formulario y feedback.

Regla de arquitectura:
- Global solo para estado transversal (autenticacion).
- Local para estado de pantalla.
- Si el estado compartido crece entre varias pantallas, evaluar store dedicado (ej. Zustand/Redux).

## 4) Diseno de API REST (backend)

Base URL (cliente):

- Desarrollo: `http://localhost:4000/api` (valor por defecto si no existe `VITE_API_URL`).
- Produccion mismo host que la SPA: rutas relativas `/api` (build sin `VITE_API_URL`).
- Produccion dominio API distinto: definir `VITE_API_URL` en el momento del build (`https://api.ejemplo.com/api`).

Recursos:
- `auth`
- `workouts`
- `posts`
- `health`

### Auth (`/api/auth`)
- `POST /register`
  - body: `{ username, email, password }`
  - 201: `{ message, user }`
- `POST /login`
  - body: `{ email, password }`
  - 200: `{ message, user, token }`
- `POST /forgot-password`
  - body: `{ email }`
  - 200: `{ message }` (misma forma si el email existe o no, para no filtrar cuentas)
  - Solo desarrollo: si `AUTH_RESET_RETURN_TOKEN=true` en el servidor **y** el email existe, respuesta adicional `{ message, devResetToken }` para probar sin servicio de correo (no usar en produccion).
- `POST /reset-password`
  - body: `{ token, password }` (password minimo 6 caracteres, igual que registro)
  - 200: `{ message }` — el token es de un solo uso y caduca a la hora; se guarda solo el hash SHA-256 en el usuario persistido.
- `GET /users?currentUserId=<id>`
  - 200: `{ users: SafeUserWithFollow[] }`
- `GET /profile/:userId`
  - 200: `{ user }`
- `PUT /profile/:userId`
  - body parcial: `{ username?, bio?, goal?, avatarUrl? }`
  - 200: `{ message, user }`
- `GET /following/:userId`
  - 200: `{ followingIds: string[] }`
- `POST /follow/:targetUserId`
  - body: `{ followerId }`
  - 200: `{ following: boolean }`

### Workouts (`/api/workouts`)
- `GET /`
  - 200: `Workout[]`
- `POST /`
  - body: `{ userId, title, description?, exercises? }`
  - 201: `Workout`
- `PUT /:id`
  - body parcial: `{ title?, description?, exercises? }`
  - 200: `Workout`
- `DELETE /:id`
  - 200: `{ message, workout }`

### Posts (`/api/posts`)
- `GET /`
  - 200: `PostWithInteractions[]` (incluye `likesCount`, `comments`, `authorUsername`)
- `POST /`
  - body: `{ userId, content, workoutId? }`
  - 201: `PostWithInteractions`
- `DELETE /:id`
  - 200: `{ message, post }`
- `POST /:id/likes`
  - body: `{ userId }`
  - 200: `{ liked: boolean }`
- `POST /:id/comments`
  - body: `{ userId, content }`
  - 201: `Comment`

### Health (`/api/health`)
- `GET /`
  - 200: estado del servicio

## 5) Persistencia: servidor vs cliente

Servidor (persistido en `server/data/store.json`):
- `users` (incluye campos opcionales internos `passwordResetTokenHash` y `passwordResetExpires` mientras un reset este pendiente; no se exponen en respuestas `user` publicas), `workouts`, `posts`, `likes`, `comments`, `follows`.
- Fuente de verdad de negocio.

Cliente (persistencia local):
- Sesion autenticada (`token`, `user`) en `localStorage`.
- Resto del estado se recalcula desde API en cada carga de pantalla.

Decision:
- Mantener JSON-file store en MVP.
- Migrar a BD relacional en fase siguiente (PostgreSQL) sin cambiar contratos de API.

## 6) Flujo de datos (simple)

```text
[React UI / Pages]
        |
        | (api/*.ts)
        v
[HTTP client]
        |
        |  REST /api/*
        v
[Express routes] -> [Controllers] -> [Store service]
                                      |
                                      v
                          [server/data/store.json]
```

Flujo tipico:
1. Usuario interactua con una pagina (ej. crear post).
2. La pagina llama a `src/api/postsApi.ts`.
3. Backend valida y persiste en `store.json`.
4. Frontend recarga feed y re-renderiza estado.

## 7) Pendiente inmediato para cerrar arquitectura

- Integrar envio de email para enlaces reales de recuperacion de contraseña (el flujo API + UI ya existe).
- Estandarizar errores API (`{ message, code }`) donde aun falte cobertura.
- Opcional: extraer sidebar completo del feed.
- Mantener convención Tailwind-first para nuevos componentes y reducir CSS legacy a `src/index.css` únicamente.
- Anadir diagrama de entidades (Users, Posts, Workouts, Likes, Comments, Follows).
- Preparar plan de migracion de `store.json` a PostgreSQL.
