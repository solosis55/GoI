# Context API y estado global en GoI

Este documento describe **cómo usamos React Context** en el proyecto y **cuándo tiene sentido** frente a props o estado local.

## ¿Cuándo usar la Context API?

Úsala cuando **muchas partes del árbol** necesitan el mismo valor o las mismas funciones y **pasar props en cadena** (prop drilling) sería incómodo o frágil.

| Caso típico | En GoI |
|-------------|--------|
| **Identidad / sesión** (quién es el usuario, token, login/logout) | [`AuthContext`](../src/context/AuthContext.tsx) |
| **Preferencia global de UI** (tema claro/oscuro) | [`ThemeContext`](../src/context/ThemeContext.tsx) |
| **Servicio técnico compartido** (registro de nodos DOM para un layout concreto) | [`RoadmapRegistryContext`](../src/components/roadmap/roadmapRegistryContext.tsx) |

**Cuándo evitar Context para “todo”:** estado que solo importa a un componente o a un subárbol pequeño suele ir mejor en **`useState` local** o **props**. Context mal usado fuerza **re-renders** de todos los consumidores cuando cambia el valor del provider (mitigable memoizando el `value`, como hacemos en auth/tema).

**Context frente a librerías de estado global (Redux, Zustand…):** para el MVP, React Context + hooks cubre sesión y tema sin añadir dependencias.

---

## Árbol de providers

Orden real de montaje (simplificado):

1. **`ThemeProvider`** — en [`main.tsx`](../src/main.tsx): envuelve **toda** la SPA (incluidas rutas legales `/aviso-legal`, `/privacidad`, `/contacto` y `/roadmap`). Así el tema y `data-theme` en `<html>` están disponibles en cualquier página.
2. **`BrowserRouter`** — enrutado ([`main.tsx`](../src/main.tsx)).
3. **`AuthProvider`** — en [`App.tsx`](../src/App.tsx), solo dentro del componente `App`, montado en la ruta **`/`** de [`RootRoutes.tsx`](../src/RootRoutes.tsx). Las páginas **dentro** de esa ruta (feed, perfil, entrenamientos, etc.) pueden usar `useAuth`. Rutas explícitas como `/aviso-legal`, `/privacidad`, `/contacto`, `/roadmap` montan solo su página: tienen **`ThemeProvider`** pero **no** `AuthProvider`. Cualquier otra URL muestra [`NotFoundPage`](../src/pages/NotFoundPage.tsx) (404); véase [`docs/routing.md`](./routing.md).

```8:15:src/main.tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <RootRoutes />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
```

```290:296:src/App.tsx
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

**`RoadmapRegistryContext`:** no es global de aplicación; el **Provider** se renderiza **solo** dentro de [`RoadmapDiagram`](../src/components/roadmap/RoadmapDiagram.tsx), alrededor del lienzo del roadmap, para que las tarjetas registren su posición en el DOM y se calculen los conectores SVG.

---

## Contextos implementados

### 1. Autenticación — `AuthContext`

| Pieza | Archivo |
|-------|---------|
| `createContext` + estado | [`AuthContext.tsx`](../src/context/AuthContext.tsx) |
| Provider | `AuthProvider` |
| Consumo | `useAuth()` |

**Valor expuesto (resumen):** `token`, `user`, `isAuthenticated`, `setAuth`, `updateUser`, `logout`. La sesión se **persiste** en `localStorage` (`fit-social-auth`). Un listener escucha el evento de sesión caducada (`AUTH_EXPIRED_EVENT`) y limpia el estado.

**Consumidores:** cualquier componente bajo `App` que llame a `useAuth()` (por ejemplo [`AppContent`](../src/App.tsx), páginas del feed, perfil, formularios).

### 2. Tema — `ThemeContext`

| Pieza | Archivo |
|-------|---------|
| `createContext` | [`ThemeContext.tsx`](../src/context/ThemeContext.tsx) |
| Provider | `ThemeProvider` |
| Consumo | `useTheme()` |

**Valor:** `theme` (`"dark"` \| `"light"`), `setTheme`, `toggleTheme`. Sincroniza **`document.documentElement`** (`data-theme`) y `localStorage` (`fitsocial:theme`) vía `applyThemeDom`.

**Consumidores:** componentes que muestran interruptor de tema o dependen del modo (sidebar, footer, etc., según diseño actual).

### 3. Registro del roadmap — `RoadmapRegistryContext`

| Pieza | Archivo |
|-------|---------|
| Contexto | [`roadmapRegistryContext.tsx`](../src/components/roadmap/roadmapRegistryContext.tsx) |
| Provider | Dentro de `RoadmapDiagram` (valor: función `registerNode`) |
| Consumo | [`useRegisterRoadmapNode`](../src/hooks/useRegisterRoadmapNode.ts) en cada tarjeta de tarea |

**Propósito:** compartir una función que **registra** `id` → elemento DOM para **dibujar aristas** entre nodos. Es estado global **local al diagrama**, no a toda la app.

---

## Checklist (documentación académica)

| Requisito | Dónde queda cubierto |
|-----------|----------------------|
| Crear contexto con `createContext` | `AuthContext`, `ThemeContext`, `RoadmapRegistryContext` |
| Implementar `Provider` | `AuthProvider`, `ThemeProvider`, `RoadmapRegistryContext.Provider` |
| Consumir en distintos componentes | `useAuth`, `useTheme`, tarjetas del roadmap con `useRegisterRoadmapNode` |
| Explicar utilidad de Context API | Esta introducción y la tabla «¿Cuándo usar la Context API?» |
| Documentar la implementación | Este archivo (`docs/context.md`) |

---

## Referencias cruzadas

- Hooks personalizados y `useState` / `useEffect`: [`docs/hooks.md`](./hooks.md).
- Decisiones de arquitectura generales: [`docs/design.md`](./design.md).
