# Documentación final y reflexión (GoI)

Este documento cierra el apartado de **reflexión del proyecto**: enlaza la documentación ya existente, resume la arquitectura, recoge **problemas típicos** y el **uso de IA**, y deja huecos marcados para que el equipo complete experiencias concretas.

---

## 1. Documentación revisada (`docs/`)

La carpeta **`docs/`** concentra decisiones de producto y técnica. Para **API** y **capa de red del cliente**, los puntos de entrada son:

| Documento | Contenido |
|-----------|-----------|
| [**api.md**](./api.md) | Contrato REST: prefijo `/api`, JWT `Bearer`, códigos HTTP, ejemplos JSON por recurso. |
| [**api-client.md**](./api-client.md) | `apiFetch`, `ApiError`, `src/api/*.ts`, tipos en `src/types/`, estados de UI. |
| [**design.md**](./design.md) | Arquitectura, diseño de API §4, persistencia, flujo de datos. |

El índice general está en el [**README.md**](../README.md) (sección *Documentación en el repo*). El histórico cronológico de decisiones e iteraciones: [**project-management.md**](./project-management.md).

---

## 2. Qué aprendimos y cómo encaja todo

### Frontend (React + TypeScript)

La interfaz es una **SPA** (Vite + React 19): páginas y componentes en **`src/`**, estado local y contexto donde toca (**Auth**, **tema**). Las llamadas al servidor no van dispersas: pasan por **`apiFetch`** ([**src/api/client.ts**](../src/api/client.ts)) y módulos por dominio (**`postsApi.ts`**, **`authApi.ts`**, …).

### Backend (Express + TypeScript)

El API vive en **`server/`**: **rutas → controladores → servicios**, persistencia MVP en **`store.json`** (y fichero aparte para roadmap personal). Los errores JSON siguen **`{ code, message }`** ([**services/http.ts**](../server/src/services/http.ts)).

### Cómo se conectan

1. El usuario actúa en la UI.
2. El cliente construye una petición HTTP (normalmente JSON) hacia **`API_BASE_URL` + ruta** (`/posts`, `/auth/login`, …).
3. Express valida, escribe o lee datos y responde con JSON.
4. Los tipos **`src/types/`** alinean lo que espera el front con las respuestas reales; cuando hay desajuste, falla en compilación o en runtime (`ApiError`).

*[Opcional — personalizar]: Un párrafo propio sobre lo que más os ha ayudado a entender este flujo (primer CRUD, primer bug de CORS, etc.).*

---

## 3. Principales problemas y cómo los abordamos

Ejemplos **habituales** en un proyecto como este (acompañad con **vuestros casos reales**):

| Área | Problema típico | Enfoque en GoI |
|------|-----------------|----------------|
| **Front ↔ API** | URL base incorrecta en producción (solo estático en Vercel sin `/api`). | Cliente con **`/api`** relativo mismo origen; guía [**deploy.md**](./deploy.md). |
| **Tipos** | Respuesta del servidor con campos distintos a los esperados. | Ajustar **`src/types/`** y controladores; tests en **`server/src/__tests__/`**. |
| **Sesión** | Token válido pero usuario borrado del `store` (datos reiniciados). | Código **`AUTH_SESSION_STALE`** y limpieza de sesión en el cliente ([**api/client.ts**](../src/api/client.ts)). |
| **Payloads grandes** | Imágenes base64 en posts/historias. | **`express.json({ limit: "18mb" })`** en [**app.ts**](../server/src/app.ts). |
| **UX compleja** | Compositor de publicaciones, recorte, responsive. | Iteración por fases documentada en **project-management**. |

*[Personalizar]: Lista corta de 2–3 bugs o fricciones que más tiempo os llevaron y la solución final.*

---

## 4. Uso de herramientas de IA en el desarrollo

Durante el proyecto se utilizó asistencia de **IA generativa** (por ejemplo en el IDE o chat dedicado) principalmente para:

- Acelerar **exploración del código** y localizar archivos relacionados con una funcionalidad.
- **Esbozar o refactorizar** fragmentos de UI o utilidades, siempre revisados y probados por personas.
- **Redactar o ampliar documentación** en Markdown siguiendo la convención del repo.

La **responsabilidad** del diseño, las decisiones de arquitectura, las pruebas manuales y la coherencia con el negocio siguen siendo del equipo. La IA no sustituye la revisión de seguridad (JWT, rate limit, validación en servidor) ni el despliegue real.

*[Personalizar]: Indicad herramienta aproximada (si la política del centro lo permite), frecuencia y qué partes **no** delegasteis a IA.*

---

## 5. Reflexión final

**Fortalezas del MVP:** monorepo claro (`src/` + `server/`), API REST documentada, cliente HTTP tipado, tests automáticos en cliente y servidor, guías de despliegue.

**Deuda / siguiente paso:** persistencia en fichero JSON adecuada para demos; migración a base de datos gestionada cuando el producto lo exija; email real para recuperación de contraseña ([**design.md**](./design.md), pendientes).

*[Personalizar]: Dos o tres frases sobre qué repetiríais en otro proyecto y qué haríais distinto.*

---

## Referencias cruzadas

- Diseño global: [**design.md**](./design.md)
- Despliegue: [**deploy.md**](./deploy.md)
- Pruebas: [**testing.md**](./testing.md)
