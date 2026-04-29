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
- [ ] Pruebas del flujo principal de usuario.

### 6) Validacion con usuarios
- [ ] Prueba con 3-5 usuarios reales.
- [ ] Recoger feedback clave.
- [ ] Priorizar mejoras para siguiente iteracion.

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

## Proxima accion inmediata
Implementar auth real (hash de password + middleware de token) y ejecutar pruebas del flujo principal multiusuario.
