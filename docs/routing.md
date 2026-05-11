# Rutas y navegación (GoI)

La SPA usa **React Router 7** (`react-router-dom`): el router se monta en [`main.tsx`](../src/main.tsx) con **`BrowserRouter`**; las rutas declarativas están en [`RootRoutes.tsx`](../src/RootRoutes.tsx).

## Tabla de rutas

| Ruta | Componente | Notas |
|------|----------------|------|
| `/` | [`App`](../src/App.tsx) | Shell principal autenticado (feed, perfil, entrenamientos por pestañas; query `?post=` para foco en publicación). |
| `/aviso-legal` | [`LegalNoticePage`](../src/pages/legal/LegalNoticePage.tsx) | Sin `AuthProvider` (página pública). |
| `/privacidad` | [`PrivacyPage`](../src/pages/legal/PrivacyPage.tsx) | Sin `AuthProvider`. |
| `/contacto` | [`ContactPage`](../src/pages/legal/ContactPage.tsx) | Sin `AuthProvider`. |
| `/roadmap` | [`PersonalRoadmapPage`](../src/pages/PersonalRoadmapPage.tsx) | Roadmap personal (API / local); sin `AuthProvider` en el árbol actual. |
| **cualquier otra** | [`NotFoundPage`](../src/pages/NotFoundPage.tsx) | Captura `path="*"` — equivalente cliente a **404**. |

## Navegación

- **Entre rutas de URL:** componentes **`Link`** (pie [`SiteFooter`](../src/components/layout/SiteFooter.tsx), páginas legales, roadmap, etc.).
- **Dentro de `/` (app logueada):** la barra lateral y estado **`activeTab`** cambian la vista sin cambiar la ruta (patrón SPA por pestañas).

## Detalle técnico del comodín

- La ruta **`/`** debe declararse **antes** del comodín `*`.
- Rutas no reconocidas **no** montan `App`; muestran **`NotFoundPage`** para cumplir el criterio de página 404 explícita.

## Referencias

- Contexto y quién envuelve cada ruta: [`docs/context.md`](./context.md).
- Despliegue y fallback en servidor para SPA: [`docs/deploy.md`](./deploy.md).
