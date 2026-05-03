# Project Management

## Objetivo
Organizar el desarrollo de la app (red social + deporte) con pasos claros y accionables.

## Estado
- Fecha de inicio: 2026-04-27
- Fase actual: Cierre del MVP y estandarizacion de UI con Tailwind

## Recomendaciones MVP

### Funcionalidades recomendadas para incluir
- [x] Publicaciones (crear y ver en feed).
- [x] Entrenamientos (crear, editar y eliminar).
- [x] Perfil deportivo basico (foto, bio, objetivo).
- [x] Interacciones minimas (likes y comentarios).
- [x] Historial de entrenamientos para progreso semanal.

### Funcionalidades recomendadas para dejar fuera (Fase 2)
- [ ] Chat en tiempo real.
- [ ] Stories o videos cortos.
- [ ] Sistema avanzado de notificaciones.
- [ ] Recomendaciones con IA.

### Criterios de exito del MVP
- [ ] El usuario completa el flujo: crear entrenamiento -> registrar sesion -> publicar progreso.
- [ ] El usuario entiende la app sin tutorial largo.
- [ ] El usuario repite uso al menos 2 veces por semana en pruebas iniciales.

## Paso a paso

### 1) Definir alcance del MVP
- [x] Problema principal y usuario objetivo definidos.
- [x] Funciones base: publicaciones + entrenamientos.
- [x] Cerrar lista final de funcionalidades MVP.

### 2) Diseñar arquitectura inicial
- [x] Estructura frontend y backend validada.
- [x] Convenciones de nombres y carpetas.
- [x] Variables de entorno necesarias.

### 3) Backend MVP
- [x] Setup servidor backend.
- [x] Autenticacion (registro/login).
- [x] CRUD de entrenamientos.
- [x] Perfil basico (ver/editar).
- [x] CRUD de publicaciones.
- [x] Likes y comentarios.

### 4) Frontend MVP
- [x] Pantallas: Login/Register.
- [x] Pantalla: Feed.
- [x] Pantalla: Crear publicacion.
- [x] Pantalla: Mis entrenamientos.
- [x] Pantalla: Perfil.

### 5) Integracion y pruebas
- [x] Conectar frontend con API.
- [x] Manejo de errores y estados de carga.
- [x] Tests automatizados de seguridad del backend (detalle en **Tests de seguridad (backend)**).
- [x] Hardening de autenticacion y validaciones (rate limit + expiracion de sesion + validacion consistente de input).
- [x] Pruebas del flujo principal de usuario (multi-cuenta / flujo clave revisado, mayo 2026).

### 6) Validacion con usuarios
- [x] Prueba con 3-5 usuarios reales (sesiones de validacion completadas, mayo 2026).
- [x] Recoger feedback clave.
- [x] Priorizar mejoras para siguiente iteracion (siguiente foco: auth UX y construccion incremental).

## Tests de seguridad (backend)

Ubicacion: `server/src/__tests__/`. Se ejecutan con Vitest y peticiones HTTP via `supertest` contra la app Express. En cada caso el store en memoria se vacia en `beforeEach` para aislar escenarios.

### `posts-security.test.ts` (posts)

| Escenario | Comportamiento esperado |
|-----------|-------------------------|
| Crear publicacion sin `Authorization` | `401`, codigo `AUTH_HEADER_INVALID`. |
| Crear publicacion con `Bearer <token>` valido | `201`, cuerpo con `id` y contenido. |
| Like o comentario sin token (post existente) | `401`, codigo `AUTH_HEADER_INVALID`. |
| Borrar publicacion de otro usuario (token de intruso) | `403`, codigo `POST_FORBIDDEN`. |

### `auth-workouts.test.ts` (auth + entrenamientos + perfil)

| Escenario | Comportamiento esperado |
|-----------|-------------------------|
| Login con credenciales inexistentes | `401`, codigo `AUTH_INVALID_CREDENTIALS`, `message` string. |
| Crear entrenamiento sin token | `401`, codigo `AUTH_HEADER_INVALID`. |
| Crear entrenamiento con token valido | `201`, entrenamiento con `id` y datos enviados. |
| Borrar entrenamiento de otro usuario | `403`, codigo `WORKOUT_FORBIDDEN`. |
| Actualizar perfil (`PUT /api/auth/profile/:userId`) con token de otro usuario | `403`, codigo `AUTH_FORBIDDEN`. |

Nota: este archivo guarda y restaura `data/store.json` en `beforeAll` / `afterAll` para no dejar el fichero de persistencia modificado tras la suite.

## Mensajes de error (frontend)

Se centralizaron textos amigables para el usuario en `src/utils/errorMessages.ts`. La funcion `getErrorMessage` recibe el error (incluido `ApiError` del cliente HTTP con `code`) y un mensaje por defecto; mapea codigos del backend (`AUTH_INVALID_CREDENTIALS`, `AUTH_EMAIL_IN_USE`, `AUTH_FORBIDDEN`, `POST_FORBIDDEN`, `WORKOUT_FORBIDDEN`, recursos no encontrados, etc.) a frases en castellano, con fallback al `message` del servidor o al texto de respaldo. Las pantallas que llaman a la API pueden usar esto para mostrar errores coherentes con los codigos de los tests de seguridad.

Actualizacion reciente:
- Se ampliaron los codigos soportados en `errorMessages` (`AUTH_REGISTER_INVALID_INPUT`, `AUTH_LOGIN_INVALID_INPUT`, `AUTH_PROFILE_INVALID_INPUT`, `AUTH_RATE_LIMITED`, `POST_INVALID_INPUT`, `COMMENT_INVALID_INPUT`, `WORKOUT_INVALID_INPUT`, entre otros).
- En `AuthPage`, cuando llega `AUTH_RATE_LIMITED`, se muestra un mensaje especifico y se bloquea temporalmente el boton de envio para evitar reintentos inmediatos.
- Codigos de recuperacion de contraseña: `AUTH_FORGOT_PASSWORD_INVALID_INPUT`, `AUTH_RESET_INVALID_INPUT`, `AUTH_RESET_TOKEN_INVALID`.

## Hardening de autenticacion y validaciones

### Seguridad de autenticacion
- Se anadio rate limit para `POST /api/auth/login` y `POST /api/auth/register` con `express-rate-limit` (ventana 15 min, max 20 intentos, codigo `AUTH_RATE_LIMITED`).
- Se implemento logout global en frontend cuando la API responde token invalido/caducado (`AUTH_TOKEN_INVALID`, `AUTH_UNAUTHORIZED` o `401`) usando evento `AUTH_EXPIRED_EVENT` desde `src/api/client.ts` y listener en `AuthContext`.
- Se reforzo `JWT_SECRET`: en produccion es obligatorio definirlo; solo fuera de produccion se usa el secreto por defecto.

### Normalizacion y validacion consistente de input (backend)
- Se creo `server/src/services/validation.ts` con helpers reutilizables (`sanitizeText`, `normalizeEmail`, `isLengthBetween`, `sanitizeStringArray`).
- Se endurecieron validaciones en controladores:
  - `workoutsController`: `title` 3-80, `description` max 280, saneado de `exercises` y limite de elementos.
  - `postsController`: `content` de post 4-280, `content` de comentario 1-180.
  - `authController`: email normalizado, username 3-24, password minima en registro, validaciones de perfil (`bio`, `goal`, `avatarUrl`).

## Implementacion realizada (paso a paso)

1. Se inicializo el proyecto con Vite + React + TypeScript.
2. Se instalo `react-router-dom` para preparar enrutado.
3. Se creo la estructura de carpetas frontend en `src/` (`components`, `pages`, `hooks`, `types`, `utils`, `context`, `api`).
4. Se creo la estructura backend en `server/src` (`routes`, `controllers`, `services`, `config`).
5. Se anadieron `README.md` por carpeta para documentar su contenido esperado.
6. Se levanto backend minimo en `server` con Express + TypeScript.
7. Se implementaron endpoints base:
   - `GET /api/health`
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET|POST|PUT|DELETE /api/workouts`
8. Se conecto el frontend con API y `localStorage` (sesion de usuario).
9. Se implemento UI de autenticacion (registro/login).
10. Se implemento UI de entrenamientos (crear, listar, eliminar).
11. Se anadio edicion de entrenamientos en la UI (guardar/cancelar).
12. Se activo persistencia local del backend con archivo JSON en `server/data/store.json`.
13. Se reinicio y valido backend/frontend para asegurar flujo funcional end-to-end.
14. Se anadieron campos de perfil al usuario (`bio`, `goal`, `avatarUrl`) en backend.
15. Se implementaron endpoints de perfil (`GET/PUT /api/auth/profile/:userId`).
16. Se implemento pantalla de perfil en frontend para ver y editar datos.
17. Se anadio navegacion basica entre Entrenamientos y Perfil.
18. Se anadio entidad `Post` en backend con persistencia en archivo local JSON.
19. Se implementaron endpoints de publicaciones (`GET/POST/DELETE /api/posts`).
20. Se implemento pantalla Feed en frontend con formulario para crear publicaciones.
21. Se anadio opcion para vincular una publicacion a un entrenamiento del usuario.
22. Se actualizo la navegacion con pestana de Feed y se valido el flujo completo.
23. Se implementaron likes para publicaciones (`POST /api/posts/:id/likes`) con comportamiento toggle.
24. Se implementaron comentarios en publicaciones (`POST /api/posts/:id/comments`).
25. El endpoint de listado de posts ahora devuelve conteo de likes y lista de comentarios.
26. Se actualizo el Feed para permitir dar like y comentar en cada publicacion.
27. Se mejoro UX con confirmacion antes de eliminar entrenamientos/publicaciones.
28. Se anadieron mensajes de exito tras crear, editar o eliminar acciones clave.
29. Se agregaron validaciones basicas de longitud/formato en auth, perfil, entrenamientos, posts y comentarios.
30. Se anadieron media queries para mejorar el uso en movil (header, acciones, tarjetas y formularios).
31. Se convirtio el Feed en pagina principal "Inicio" con publicaciones de toda la comunidad y accesos rapidos a Perfil/Entrenamientos.
32. Se rediseño la UI de Inicio con estructura tipo red social (sidebar izquierda, feed central y panel derecho de sugerencias).
33. Se implemento seguir usuarios (follow/unfollow) con persistencia en backend.
34. Se añadio filtro de feed por "Todos" y "Seguidos".
35. Se integraron botones de seguir en sugerencias de la Home.
36. Se extrajeron y consolidaron componentes reutilizables en `ui`, `feed`, `workouts` y `profile`.
37. Se documento arquitectura y componentes en `docs/design.md` y `docs/components.md`.
38. Se instalo y configuro Tailwind CSS en Vite (`tailwindcss` + `@tailwindcss/vite`).
39. Se migro la UI principal a Tailwind-first (botones, cards, formularios, layouts y listas de feed/workouts/perfil).
40. Se limpio `src/App.css` dejando estilo legacy minimo tras la migracion.
41. Se anadieron tests de seguridad del API: `posts-security.test.ts` (posts, likes, comentarios, borrado) y `auth-workouts.test.ts` (login, workouts, perfil ajeno), con Vitest y supertest.
42. Se anadieron mensajes de error user-facing en `src/utils/errorMessages.ts` (`getErrorMessage`, mapa por codigo de API), alineados con respuestas del backend.
43. Se anadio rate limit en autenticacion (`/api/auth/login` y `/api/auth/register`) para mitigar intentos abusivos y devolver `AUTH_RATE_LIMITED`.
44. Se implemento expiracion de sesion global en frontend: `api/client` emite `AUTH_EXPIRED_EVENT` ante errores auth, y `AuthContext` limpia estado/localStorage automaticamente.
45. Se reforzo el manejo de secretos JWT: en produccion el backend exige `JWT_SECRET` y falla al arrancar si no esta definido.
46. Se incorporo una capa comun de validacion (`server/src/services/validation.ts`) y se aplicaron reglas consistentes de normalizacion/longitud en `authController`, `postsController` y `workoutsController`.
47. Se actualizo `errorMessages.ts` con nuevos codigos de validacion/rate-limit y se mejoro UX en `AuthPage` para `AUTH_RATE_LIMITED` (mensaje especifico + bloqueo temporal del submit).
48. Se implemento recuperacion de contraseña en API: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`, token de un solo uso (hash SHA-256 en `store.json`), caducidad 1 hora, misma ventana de rate limit que login/registro. Respuesta generica para no filtrar existencia de email.
49. Se amplio `AuthPage` con flujo "Olvide mi contraseña", formulario de nueva contraseña con enlace `?reset=<token>`, mensaje de exito y alineacion de validacion (minimo 6 caracteres en contraseña). En desarrollo, con `AUTH_RESET_RETURN_TOKEN=true` en el servidor, la API puede devolver `devResetToken` y la UI muestra el enlace local (solo si `import.meta.env.DEV`).
50. Documentacion sincronizada: `docs/design.md`, `docs/project-management.md`, `src/pages/README.md`, `server/.env.example`.
51. Despliegue preparado: cliente en modo `production` usa base API `/api` (`src/api/client.ts`); con `NODE_ENV=production` el servidor sirve la SPA desde la carpeta `dist` del monorepo, `trust proxy` para rate limiting tras proxy y guia operativa unificada en `docs/deploy.md`, Dockerfile y scripts `npm run build:deploy` / `npm run start:deploy` en la raiz.

## Recuperacion de contraseña (resumen operativo)

| Entorno | Comportamiento |
|---------|----------------|
| Produccion | El usuario recibe el mismo mensaje generico tras solicitar reset; hace falta integrar envio de email con el token (Fase 2). El token no se expone en la respuesta JSON. |
| Desarrollo local | Opcional: `AUTH_RESET_RETURN_TOKEN=true` en `server/.env` para que la respuesta incluya `devResetToken` y poder abrir `http://localhost:5173/?reset=...` y completar el flujo sin correo. |

## Proxima accion inmediata

- Integrar proveedor de email (enlace firmado en el correo) o continuar con mejoras UX priorizadas tras la validacion con usuarios.
