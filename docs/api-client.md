# Capa de red en el frontend (GoI)

Describe el **cliente HTTP tipado**, los **módulos por dominio** y la relación con **`src/types/`**. Contrato REST del servidor: [**docs/api.md**](./api.md). Diseño general y persistencia: [**docs/design.md**](./design.md).

---

## Cliente central: `apiFetch`

Archivo: [`src/api/client.ts`](../src/api/client.ts).

- **`apiFetch<T>(path, options?)`**: envuelve **`fetch`** con base URL común, cabecera **`Content-Type: application/json`** y, si hay sesión, **`Authorization: Bearer <JWT>`** leído de `localStorage` (`fit-social-auth`).
- **Base URL:** `import.meta.env.VITE_API_URL` o, por defecto, `http://localhost:4000/api` en desarrollo y **`/api`** en producción (mismo origen que la SPA).
- **Respuesta tipada:** el genérico **`T`** es el JSON parseado en éxito (`response.ok`).
- **`ApiError`:** si la respuesta no es OK o hay fallo de red, se lanza `ApiError` con **`status`**, **`code`** (del cuerpo `{ code, message }` del backend o valores como `API_NETWORK_ERROR`) y **`message`** usable en UI.
- **Sesión caducada:** si el código/status indica token inválido o sesión obsoleta (`AUTH_SESSION_STALE`, etc.), se emite el evento **`AUTH_EXPIRED_EVENT`** (`auth:expired`); [`AuthContext`](../src/context/AuthContext.tsx) escucha y limpia la sesión.

Las páginas suelen capturar `ApiError` vía **`getErrorMessage`** ([`src/utils/errorMessages.ts`](../src/utils/errorMessages.ts)) y mostrar texto en **`StatusMessage`** o estado local `error`.

---

## Módulos por dominio (`src/api/`)

Cada archivo agrupa llamadas relacionadas y delega en `apiFetch`:

| Archivo | Contenido típico |
|---------|-------------------|
| [`authApi.ts`](../src/api/authApi.ts) | Registro, login, perfil, usuarios, follow |
| [`postsApi.ts`](../src/api/postsApi.ts) | Posts, likes, comentarios, notificaciones |
| [`workoutsApi.ts`](../src/api/workoutsApi.ts) | CRUD de rutinas |
| [`exercisesApi.ts`](../src/api/exercisesApi.ts) | Catálogo de ejercicios |
| [`workoutSessionsApi.ts`](../src/api/workoutSessionsApi.ts) | Sesiones de entreno registradas |
| [`storiesApi.ts`](../src/api/storiesApi.ts) | Historias / reels |
| [`personalRoadmapApi.ts`](../src/api/personalRoadmapApi.ts) | GET/PUT roadmap personal (`apiFetch`) |

Convención: rutas relativas al prefijo `/api` ya incluido en `API_BASE_URL` (p. ej. `apiFetch("/posts")` → `…/api/posts`).

---

## Tipos TypeScript (`src/types/`)

Los JSON de respuesta se modelan con interfaces/types compartidos entre UI y cliente:

| Archivo | Dominio |
|---------|---------|
| [`auth.ts`](../src/types/auth.ts) | Usuario seguro, discover, etc. |
| [`post.ts`](../src/types/post.ts) | Posts, comentarios, notificaciones |
| [`workout.ts`](../src/types/workout.ts) | Rutinas |
| [`exercise.ts`](../src/types/exercise.ts) | Ejercicios del catálogo |
| [`workoutSession.ts`](../src/types/workoutSession.ts) | Sesiones registradas |
| [`story.ts`](../src/types/story.ts) | Historias / slides |

Las funciones en `src/api/*.ts` devuelven **`Promise<T>`** donde **`T`** es uno de estos tipos o un tipo derivado (por ejemplo listas).

---

## Estados de red en la UI

Patrón habitual en páginas que llaman a la API:

- **Carga:** `loading` / `mediaBusy` / flags similares + mensajes “Cargando…” donde aplique.
- **Éxito:** datos en estado (`posts`, `user`, …) o `message` de confirmación.
- **Error:** `catch` → `setError(getErrorMessage(err, …))` o equivalente; opcional reintento manual por el usuario.

No hay un único hook global para los tres estados: cada pantalla compone `useState` / `useEffect` según necesidad (coherente con “Fase 3” del proyecto).

---

## Persistencia local vs API

- **Fuente de verdad para datos de negocio en servidor:** las listas y entidades se **obtienen y guardan vía API** tras login; el cliente **no** sustituye el backend con solo `localStorage` para posts, rutinas publicadas, etc.
- **Excepciones deliberadas (UX / MVP):** token y usuario en `localStorage` (sesión), borradores en `sessionStorage`, caches ligeras (p. ej. menciones recientes, historias vistas). No invalidan el modelo “API como verdad” para el contenido principal del dominio.

---

## Referencias

- Contrato REST y ejemplos JSON: [**docs/api.md**](./api.md).
- URL base y despliegue: [**docs/deploy.md**](./deploy.md).
