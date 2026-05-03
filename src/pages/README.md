# pages

Vistas principales de la aplicacion (shell por pestañas en `App.tsx`, sin router de URL para el area autenticada).

## `AuthPage.tsx`

Flujos:

- **Registro / login**: formulario unificado; contraseña minimo 6 caracteres (alineado con backend).
- **¿Olvidaste tu contraseña?** (solo en login): solicitud con email; mensaje generico siempre (no se indica si el correo existe).
- **Nueva contraseña**: se abre cuando la URL incluye `?reset=<token>` (enlace que en produccion vendria por email; en local ver `docs/project-management.md` y `AUTH_RESET_RETURN_TOKEN` en `server/.env.example`).

Tras un reset correcto se limpia el parametro `reset` de la URL y se vuelve al modo login.

## Otras paginas

- `FeedPage.tsx`: timeline, crear post, likes, comentarios, seguir usuarios.
- `WorkoutsPage.tsx`: CRUD de entrenamientos.
- `ProfilePage.tsx`: ver/editar perfil deportivo.
