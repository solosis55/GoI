# pages

Vistas principales de la aplicacion (shell por pestañas en `App.tsx`, sin router de URL para el area autenticada). El shell incluye **`SiteFooter`** bajo el `main` (invitado y logueado): ver `docs/components.md`.

## `AuthPage.tsx`

Presentacion: mismo **layout** (`social-shell`) con **`GoISidebarBadge`** (logo circular `public/branding/goi-logo.png`, rótulo FitSocial, bloque centrado en la sidebar); panel central **`Card tone="dark"`**, campos con clase **`.goi-field`** (foco **oro**), labels en **neutral claro** y **`StatusMessage tone="dark"`**.

Flujos:

- **Registro / login**: formulario unificado; contraseña minimo 6 caracteres (alineado con backend).
- **¿Olvidaste tu contraseña?** (solo en login): solicitud con email; mensaje generico siempre (no se indica si el correo existe).
- **Nueva contraseña**: se abre cuando la URL incluye `?reset=<token>` (enlace que en produccion vendria por email; en local ver `docs/project-management.md` y `AUTH_RESET_RETURN_TOKEN` en `server/.env.example`).

Tras un reset correcto se limpia el parametro `reset` de la URL y se vuelve al modo login.

## Otras paginas

- `FeedPage.tsx`: **encabezado** al inicio de la columna principal (**Inicio**, texto de contexto, usuario conectado); **Historias del gym** en tarjeta compacta centrada con pestañas Todos/Seguidos y fila de avatares en modo **`compact`**; rejilla **columna principal flexible** + panel derecho (resumen cuenta, sugerencias); timeline, **crear post**, likes, comentarios, seguir usuarios.
- `WorkoutsPage.tsx`: dashboard **Rutinas** (rutina = plantilla). **Resumen** (Plantillas, Entrenamientos totales, Ultimos 7 dias), **calendario** (`workout-sessions`), card **Crear rutina** solo con CTA **Ir al editor de rutinas** (sin acceso directo al catalogo desde aqui), lista **Mis rutinas** con buscar por titulo, etiqueta, ordenar, editar/duplicar/eliminar.
- `WorkoutEditorPage.tsx`: crear o editar rutina; usa `WorkoutForm` + catalogo cargado con `getExercises`. **Miga de pan:** `Rutinas` → **Editor de rutinas** (rotulo) → pill **Nueva rutina** / **Editar rutina**. En modo **crear**, el progreso se persiste con `workoutCreateDraft` (`sessionStorage`); al volver del catalogo con ejercicios se hace **merge** de `exerciseIds`. Boton **Ver catalogo** y en ejercicios **Elegir ejercicios en el catalogo** delegan en `App` (`onBrowseCatalog`).
- `ExerciseCatalogPage.tsx`: catalogo filtrable; **Ver ficha** abre detalle; seleccion y botones para llevar ejercicios al editor. **Miga de pan (desde editor):** `Rutinas` / `Editor de rutinas` / `Nueva rutina` o `Editar rutina` / pill **Catalogo** (`routineFormCrumb` + `onNavigateToEditorForm`). Solo **Rutinas** / **Catalogo** si no viene del editor. Props `creationFlowLabel` ajustan textos (**Volver al formulario**, etc.).
- `ExerciseDetailPage.tsx`: ficha de un ejercicio (`getExercise`): descripcion breve bajo el titulo, bloques **Equipamiento**, **Ejecucion** (`instructions`, multilinea), **Grupos musculares**. **Miga de pan** igual que antes (`showRoutineTrail` opcional).
- `ProfilePage.tsx`: ver/editar perfil deportivo; segunda card **Entrenamientos registrados** (misma API `workout-sessions`, solo lectura; para gestionar el flujo principal se usa la pestaña **Rutinas**).
