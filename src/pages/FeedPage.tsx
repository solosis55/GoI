import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getFollowing, getUsers, toggleFollow } from "../api/authApi";
import { createComment, createPost, deletePost, getPosts, toggleLike } from "../api/postsApi";
import { getWorkouts } from "../api/workoutsApi";
import { useAuth } from "../context/AuthContext";
import type { DiscoverUser } from "../types/auth";
import type { Post } from "../types/post";
import type { Workout } from "../types/workout";

export function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [content, setContent] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [feedMode, setFeedMode] = useState<"all" | "following">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const myPostsCount = useMemo(
    () => (user ? posts.filter((post) => post.userId === user.id).length : 0),
    [posts, user]
  );
  const suggestedUsers = useMemo(() => {
    return discoverUsers.slice(0, 6);
  }, [discoverUsers]);
  const visiblePosts = useMemo(() => {
    if (feedMode === "all") return posts;
    return posts.filter((post) => followingIds.includes(post.userId) || post.userId === user?.id);
  }, [feedMode, followingIds, posts, user?.id]);

  async function loadFeed() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!user) return;
      const [postsResponse, workoutsResponse, usersResponse, followingResponse] = await Promise.all([
        getPosts(),
        getWorkouts(),
        getUsers(user.id),
        getFollowing(user.id),
      ]);
      setPosts(postsResponse);
      const mine = user ? workoutsResponse.filter((workout) => workout.userId === user.id) : [];
      setWorkouts(mine);
      setDiscoverUsers(usersResponse.users);
      setFollowingIds(followingResponse.followingIds);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el feed");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFollow(targetUserId: string) {
    if (!user) return;
    setError("");
    try {
      await toggleFollow(targetUserId, user.id);
      await loadFeed();
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : "No se pudo actualizar seguimiento");
    }
  }

  useEffect(() => {
    void loadFeed();
  }, [user?.id]);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");

    const trimmed = content.trim();
    if (trimmed.length < 4) {
      setError("La publicacion debe tener al menos 4 caracteres");
      return;
    }
    if (trimmed.length > 280) {
      setError("La publicacion no puede superar 280 caracteres");
      return;
    }

    try {
      await createPost({
        userId: user.id,
        content: trimmed,
        workoutId: selectedWorkoutId || null,
      });
      setContent("");
      setSelectedWorkoutId("");
      await loadFeed();
      setMessage("Publicacion creada");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear la publicacion");
    }
  }

  async function handleDeletePost(id: string) {
    if (!window.confirm("Seguro que quieres eliminar esta publicacion?")) return;
    setError("");
    setMessage("");
    try {
      await deletePost(id);
      await loadFeed();
      setMessage("Publicacion eliminada");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la publicacion");
    }
  }

  async function handleToggleLike(postId: string) {
    if (!user) return;
    setError("");
    setMessage("");
    try {
      await toggleLike(postId, user.id);
      await loadFeed();
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : "No se pudo actualizar el like");
    }
  }

  async function handleCreateComment(postId: string) {
    if (!user) return;
    setError("");
    setMessage("");
    const contentValue = commentByPostId[postId]?.trim();
    if (!contentValue) return;
    if (contentValue.length > 180) {
      setError("El comentario no puede superar 180 caracteres");
      return;
    }

    try {
      await createComment(postId, {
        userId: user.id,
        content: contentValue,
      });
      setCommentByPostId((current) => ({ ...current, [postId]: "" }));
      await loadFeed();
      setMessage("Comentario publicado");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "No se pudo comentar");
    }
  }

  function getWorkoutTitle(workoutId: string | null) {
    if (!workoutId) return null;
    const workout = workouts.find((item) => item.id === workoutId);
    return workout?.title ?? "Entrenamiento vinculado";
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <section className="feed-layout">
      <section className="feed-main">
        <section className="card card-dark">
          <h2>Historias del gym</h2>
          <div className="actions">
            <button
              type="button"
              className={feedMode === "all" ? "nav-active" : "secondary"}
              onClick={() => setFeedMode("all")}
            >
              Todos
            </button>
            <button
              type="button"
              className={feedMode === "following" ? "nav-active" : "secondary"}
              onClick={() => setFeedMode("following")}
            >
              Seguidos
            </button>
          </div>
          <div className="stories-row">
            {posts.slice(0, 8).map((post) => (
              <div key={`story-${post.id}`} className="story-item">
                <div className="story-ring">
                  <img
                    src={post.authorAvatarUrl || "https://via.placeholder.com/40x40"}
                    alt={post.authorUsername}
                  />
                </div>
                <small>{post.authorUsername}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-dark">
          <h2>Crear publicacion</h2>
          <form className="stack" onSubmit={handleCreatePost}>
            <label>
              Contenido
              <textarea
                required
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Hoy rompi PR en sentadilla..."
              />
            </label>

            <label>
              Entrenamiento vinculado (opcional)
              <select value={selectedWorkoutId} onChange={(event) => setSelectedWorkoutId(event.target.value)}>
                <option value="">Sin entrenamiento</option>
                {workouts.map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.title}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit">Publicar</button>
          </form>
        </section>

        {loading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {!loading && visiblePosts.length === 0 && (
          <p>{feedMode === "following" ? "Aun no hay publicaciones de usuarios seguidos." : "Aun no hay publicaciones en la comunidad."}</p>
        )}

        <ul className="workouts-list">
          {visiblePosts.map((post) => (
            <li key={post.id} className="workout-item post-card">
              <div>
                <strong>
                  {post.authorUsername}
                  {post.userId === user?.id ? " (tu)" : ""}
                </strong>
                <p className="meta">{formatDate(post.createdAt)}</p>
                <p>{post.content}</p>
                {post.workoutId && <small>Entrenamiento: {getWorkoutTitle(post.workoutId)}</small>}
                <p className="meta">Likes: {post.likesCount}</p>
                <ul className="comments-list">
                  {post.comments.map((comment) => (
                    <li key={comment.id}>
                      <small>
                        {comment.authorUsername}
                        {comment.userId === user?.id ? " (tu)" : ""}: {comment.content}
                      </small>
                    </li>
                  ))}
                </ul>
                <div className="inline-actions">
                  <input
                    value={commentByPostId[post.id] ?? ""}
                    onChange={(event) =>
                      setCommentByPostId((current) => ({ ...current, [post.id]: event.target.value }))
                    }
                    placeholder="Escribe un comentario"
                  />
                  <button type="button" className="secondary" onClick={() => handleCreateComment(post.id)}>
                    Comentar
                  </button>
                </div>
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={() => handleToggleLike(post.id)}>
                  Like
                </button>
                {post.userId === user?.id && (
                  <button type="button" className="danger" onClick={() => handleDeletePost(post.id)}>
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="feed-right card card-dark">
        <h3>Tu cuenta</h3>
        <p className="meta">
          @{user?.username} | Publicaciones: {myPostsCount}
        </p>
        <h3>Sugerencias para ti</h3>
        {suggestedUsers.length === 0 && <p className="meta">Aun no hay sugerencias.</p>}
        <ul className="suggestions-list">
          {suggestedUsers.map((suggested) => (
            <li key={suggested.id} className="suggestion-item">
              <img
                src={suggested.avatarUrl || "https://via.placeholder.com/32x32"}
                alt={suggested.username}
              />
              <span>{suggested.username}</span>
              <button type="button" className="secondary" onClick={() => handleToggleFollow(suggested.id)}>
                {followingIds.includes(suggested.id) ? "Siguiendo" : "Seguir"}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
