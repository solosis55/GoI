# Testing y mejoras (GoI)

Este documento resume **pruebas automáticas**, **comandos de calidad** y una **checklist manual** para validar el MVP antes de entregas o despliegues. La revisión en navegador (consola, responsive, flujos completos) debe repetirse cuando cambien pantallas críticas.

---

## Pruebas automáticas (Vitest)

### Frontend (raíz del repo)

```bash
npm run test
```

Ejecuta **Vitest** sobre los tests del proyecto (por defecto incluye `src/**/*.test.ts`).

| Archivo | Qué cubre (aprox.) |
|---------|---------------------|
| [`src/utils/mentionAutocomplete.test.ts`](../src/utils/mentionAutocomplete.test.ts) | Filtrado y ordenación de candidatos @ |
| [`src/utils/postComposerTemplates.test.ts`](../src/utils/postComposerTemplates.test.ts) | Plantillas de texto del compositor |

### Backend (`server/`)

```bash
cd server && npm run test
```

(o desde la raíz: `npm run test --prefix server`)

| Archivo | Qué cubre (aprox.) |
|---------|---------------------|
| [`server/src/__tests__/auth-workouts.test.ts`](../server/src/__tests__/auth-workouts.test.ts) | Auth, rutinas, perfil |
| [`server/src/__tests__/exercises.test.ts`](../server/src/__tests__/exercises.test.ts) | Catálogo de ejercicios |
| [`server/src/__tests__/posts-security.test.ts`](../server/src/__tests__/posts-security.test.ts) | Posts: permisos y seguridad |
| [`server/src/__tests__/workout-sessions.test.ts`](../server/src/__tests__/workout-sessions.test.ts) | Sesiones de entreno |
| [`server/src/__tests__/stories.test.ts`](../server/src/__tests__/stories.test.ts) | Historias / reels |

---

## Calidad de compilación y estilo

| Comando | Uso |
|---------|-----|
| `npm run build` | TypeScript + bundle Vite del cliente |
| `npm run build --prefix server` | Compilación del API Express |
| `npm run lint` | ESLint en el frontend |

Para entrega full-stack local: `npm run build:deploy` (equivalente documentado en [**docs/deploy.md**](./deploy.md)).

---

## Checklist manual (funcional)

Marcar según última sesión de prueba. Orden sugerido con API en marcha (`server`: `npm run dev`; cliente: `npm run dev`).

### Autenticación y sesión

- [ ] Registro → sesión iniciada
- [ ] Login → sesión iniciada
- [ ] Logout → vuelta a pantalla de acceso sin datos sensibles en UI
- [ ] Recuperación de contraseña (flujo visible según entorno; ver [**docs/deploy.md**](./deploy.md))

### Núcleo social (usuario logueado)

- [ ] Feed: carga de posts, modo todos / seguidos si aplica
- [ ] Crear publicación (wizard): texto, fotos, menciones, publicar
- [ ] Like y comentario en un post ajeno
- [ ] Notificaciones (campana) sin errores obvios

### Entrenamientos

- [ ] Listado de rutinas, crear/editar rutina, catálogo de ejercicios
- [ ] Registrar sesión de entreno si el flujo está activo en UI

### Perfil

- [ ] Ver y guardar perfil (usuario, bio, objetivo)

### Otras rutas

- [ ] `/roadmap`: carga y guardado (según backend disponible)
- [ ] Páginas legales `/aviso-legal`, `/privacidad`, `/contacto`
- [ ] URL inventaria → página **404** ([`NotFoundPage`](../src/pages/NotFoundPage.tsx))

---

## Responsive y consola

- **Responsive:** probar anchos típicos (móvil ~390px, tablet, escritorio); sidebar, compositor modal, feed y footer sin solapes graves (FAB, sidebar “Tu cuenta”, etc.).
- **Consola:** con DevTools abierta, repetir los flujos anteriores y anotar errores rojos o warnings repetidos; priorizar los que afecten al flujo principal.

Los bugs corregidos pueden reflejarse en **`docs/project-management.md`** como decisiones o iteraciones recientes.

---

## Referencias

- Despliegue y prueba en producción: [**docs/deploy.md**](./deploy.md).
- API para pruebas manuales con curl o cliente: [**docs/api.md**](./api.md).
