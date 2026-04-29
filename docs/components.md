# Componentes (MVP)

## Checklist de la fase

- [x] Crear varios componentes reutilizables usando React.
- [x] Definir props tipadas usando TypeScript.
- [x] Usar composicion de componentes cuando sea necesario.
- [x] Aplicar Tailwind CSS para estilos y layout.
- [x] Crear componentes (listas, tarjetas, formularios) que consuman datos tipados.
- [x] Documentar componentes en este archivo.

## Componentes implementados

### UI base (`src/components/ui`)
- `Button`
  - Props: `variant`, props nativas de `button`.
  - Uso: acciones primarias/secundarias/peligro, tabs activas, enlaces tipo boton.
- `Card`
  - Props: `tone`, `as`, `className`.
  - Uso: contenedores visuales en feed, perfil y entrenamientos.
- `StatusMessage`
  - Props: `loading`, `error`, `success`, `loadingText`.
  - Uso: feedback estandar de carga/error/exito.
- `Avatar`
  - Props: `src`, `alt`, `size`, `className`.
  - Uso: imagen de usuario en historias y sugerencias.
- `EmptyState`
  - Props: `message`, `className`.
  - Uso: estados vacios en listas y paneles.

### Feed (`src/components/feed`)
- `PostItem`
  - Props: `post`, `isOwner`, `currentUserId`, callbacks de like/delete/comment.
  - Uso: tarjeta principal de publicacion.
- `CommentList`
  - Props: `comments`, `currentUserId`.
  - Uso: lista tipada de comentarios por post.
- `PostComposer`
  - Props: `value`, `onChange`, `onSubmit`.
  - Uso: input + boton para comentar.
- `PostActions`
  - Props: `isOwner`, `onLike`, `onDelete`.
  - Uso: acciones de like y eliminar.
- `FollowSuggestionItem`
  - Props: `user`, `isFollowing`, `onToggleFollow`.
  - Uso: item de sugerencias para seguir usuarios.
- `StoriesRow`
  - Props: `posts`.
  - Uso: fila de historias basada en publicaciones recientes.
- `CreatePostForm`
  - Props: `content`, `selectedWorkoutId`, `workouts`, handlers.
  - Uso: formulario para crear publicacion.
- `FeedModeTabs`
  - Props: `mode`, `onChangeMode`.
  - Uso: alternar feed entre "Todos" y "Seguidos".
- `UserSummaryCard`
  - Props: `username`, `myPostsCount`.
  - Uso: resumen de cuenta en sidebar del feed.

### Workouts (`src/components/workouts`)
- `WorkoutForm`
  - Props: campos del formulario, handlers, `submitLabel`, `onCancel`.
  - Uso: crear y editar entrenamientos.
- `WorkoutItem`
  - Props: `workout`, estado de edicion, handlers de editar/eliminar.
  - Uso: item de lista de entrenamientos con modo vista/edicion.

### Profile (`src/components/profile`)
- `ProfileForm`
  - Props: campos de perfil, estados (`loading/error/message`) y handlers.
  - Uso: formulario de actualizacion de perfil.

## Pendientes

- [ ] (Opcional) Extraer `FeedSidebar` para encapsular toda la barra derecha del feed.
