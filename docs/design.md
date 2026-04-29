# Design Decision Log (MVP)

## 1) Estructura de componentes principales

### Frontend (`src`)
- `App.tsx`: shell principal, control de sesion y navegacion por tabs (`feed`, `workouts`, `profile`).
- `context/AuthContext.tsx`: estado global de autenticacion (token, user, login/logout, persistencia local).
- `pages/AuthPage.tsx`: registro e inicio de sesion.
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

Base URL:
- `http://localhost:4000/api`

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
- `users`, `workouts`, `posts`, `likes`, `comments`, `follows`.
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

- Definir auth real (hash de password + validacion de token en middleware).
- Estandarizar errores API (`{ message, code }`).
- Opcional: extraer sidebar completo del feed.
- Mantener convención Tailwind-first para nuevos componentes y reducir CSS legacy a `src/index.css` únicamente.
- Anadir diagrama de entidades (Users, Posts, Workouts, Likes, Comments, Follows).
- Preparar plan de migracion de `store.json` a PostgreSQL.
