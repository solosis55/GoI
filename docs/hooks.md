# Hooks de React en GoI

Este documento enlaza la práctica de **estado y hooks** con el código real del proyecto.

## Checklist académica (ubicación en el repo)

| Requisito | Dónde se cumple (referencia principal) |
|-----------|----------------------------------------|
| `useState` | [`FeedPage.tsx`](../src/pages/FeedPage.tsx) (bloque de estado del feed), [`CreatePostForm.tsx`](../src/components/feed/CreatePostForm.tsx) (`stepIdx`, vista previa). |
| `useEffect` | [`FeedPage.tsx`](../src/pages/FeedPage.tsx) (carga del feed al cambiar `loadFeed`; otros efectos de foco/hidratación), [`useMentionRecents.ts`](../src/hooks/useMentionRecents.ts) (lectura desde `localStorage`). |
| `useMemo` | [`FeedPage.tsx`](../src/pages/FeedPage.tsx) (`mentionPickList`, `composerValidation`, `visiblePosts`, etc.). |
| `useCallback` | [`FeedPage.tsx`](../src/pages/FeedPage.tsx) (`refreshStoriesOnly`, gestos del recorte, `loadFeed`). |
| Custom hook reutilizable | [`useMentionRecents.ts`](../src/hooks/useMentionRecents.ts), [`useRegisterRoadmapNode.ts`](../src/hooks/useRegisterRoadmapNode.ts); también `useAuth` / `useTheme` en [`context/`](../src/context/). |
| Documentación | Este archivo (`docs/hooks.md`). |

Los números de línea pueden variar ligeramente entre commits; las **referencias por nombre** (`mentionPickList`, `useMentionRecents`, etc.) siguen siendo estables.

---

## Qué hace cada hook integrado (resumen breve)

### `useState`

Guarda **estado local** que, al cambiar, provoca un nuevo render del componente.

### `useEffect`

Ejecuta **efectos secundarios** después del pintado: cargar datos, sincronizar con `storage`, suscripciones. Opcionalmente devuelve una función de **limpieza** al desmontar o antes de re-ejecutar el efecto.

### `useMemo`

**Memoriza un valor calculado** y solo lo recalcula cuando cambian las dependencias. Sirve para derivaciones que dependen de listas o props (`mentionPickList`, validación del compositor).

### `useCallback`

**Memoriza una función** para que la referencia sea estable entre renders si las dependencias no cambian (útil al pasar callbacks a hijos o a otros hooks).

---

## Ejemplos citados en el código

### `useState` — varios estados en la página del feed

Fragmento inicial (el archivo declara más piezas de estado seguidas):

```112:117:src/pages/FeedPage.tsx
  const [posts, setPosts] = useState<Post[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [content, setContent] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "followers" | "private">("public");
  const [draftImages, setDraftImages] = useState<PendingPostImage[]>([]);
```

### `useEffect` — cargar el feed cuando está lista la función `loadFeed`

```400:402:src/pages/FeedPage.tsx
  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);
```

### `useMemo` — lista de candidatos para @ (costoso de recomputar cada vez)

```162:188:src/pages/FeedPage.tsx
  const mentionPickList = useMemo((): MentionPickUser[] => {
    const out: MentionPickUser[] = [];
    const seenByUserId = new Set<string>();
    const recentIndexById = new Map(recentMentionIds.map((id, idx) => [id, idx] as const));
    const pushCandidate = (candidate: MentionPickUser) => {
      if (seenByUserId.has(candidate.id)) return;
      seenByUserId.add(candidate.id);
      out.push({
        ...candidate,
        isFollowing: candidate.id !== user?.id && followingIds.includes(candidate.id),
        recentRank: recentIndexById.get(candidate.id) ?? null,
      });
    };
    if (user) {
      pushCandidate({ id: user.id, username: user.username });
    }
    for (const d of discoverUsers) {
      pushCandidate({ id: d.id, username: d.username });
    }
    for (const p of posts) {
      pushCandidate({ id: p.userId, username: p.authorUsername });
      for (const c of p.comments) {
        pushCandidate({ id: c.userId, username: c.authorUsername });
      }
    }
    return out;
  }, [user, discoverUsers, posts, followingIds, recentMentionIds]);
```

### `useCallback` — refrescar historias sin recrear la función en cada render

```215:223:src/pages/FeedPage.tsx
  const refreshStoriesOnly = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStories();
      setStoryAuthorsFromApi(data.authors);
    } catch {
      /* no bloquea el feed */
    }
  }, [user]);
```

### Custom hook — `useMentionRecents` (`useState` + `useEffect` + `useCallback`)

```13:58:src/hooks/useMentionRecents.ts
export function useMentionRecents(userId: string | undefined) {
  const [recentMentionIds, setRecentMentionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setRecentMentionIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(mentionRecentsStorageKey(userId));
      if (!raw) {
        setRecentMentionIds([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setRecentMentionIds([]);
        return;
      }
      setRecentMentionIds(
        parsed.filter((x): x is string => typeof x === "string").slice(0, MENTION_RECENTS_LIMIT),
      );
    } catch {
      setRecentMentionIds([]);
    }
  }, [userId]);

  const recordMentionPick = useCallback(
    (picked: MentionPickUser) => {
      if (!userId) return;
      if (picked.id === userId) return;
      setRecentMentionIds((current) => {
        const next = [picked.id, ...current.filter((id) => id !== picked.id)].slice(0, MENTION_RECENTS_LIMIT);
        try {
          localStorage.setItem(mentionRecentsStorageKey(userId), JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [userId],
  );

  return { recentMentionIds, recordMentionPick };
}
```

### Custom hook — `useRegisterRoadmapNode` (`useContext` + `useCallback`)

```1:8:src/hooks/useRegisterRoadmapNode.ts
import { useCallback, useContext } from "react";
import { RoadmapRegistryContext } from "../components/roadmap/roadmapRegistryContext";

export function useRegisterRoadmapNode(id: string) {
  const register = useContext(RoadmapRegistryContext);
  return useCallback((el: HTMLElement | null) => register(id, el), [id, register]);
}
```

Contexto del diagrama: [`roadmapRegistryContext.tsx`](../src/components/roadmap/roadmapRegistryContext.tsx).

---

## Hooks personalizados en `src/hooks/`

| Archivo | Rol |
|--------|-----|
| [`useMentionRecents.ts`](../src/hooks/useMentionRecents.ts) | Menciones recientes en `localStorage`; consumido en **`FeedPage`**. |
| [`useRegisterRoadmapNode.ts`](../src/hooks/useRegisterRoadmapNode.ts) | Ref callback por `id` para el roadmap; consumido en **`RoadmapDiagram`**. |
| [`index.ts`](../src/hooks/index.ts) | Reexportaciones opcionales. |

### Hooks junto al provider (convención habitual)

| Hook | Ubicación | Uso |
|------|-----------|-----|
| `useAuth` | [`AuthContext.tsx`](../src/context/AuthContext.tsx) | Sesión y usuario actual |
| `useTheme` | [`ThemeContext.tsx`](../src/context/ThemeContext.tsx) | Tema claro/oscuro |

No es obligatorio mover estos archivos a `src/hooks/`; suele mantenerse el hook **junto al contexto** para ver provider y API en un solo módulo.
