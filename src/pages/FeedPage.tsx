import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getFollowing, getUsers, toggleFollow } from "../api/authApi";
import { createComment, createPost, deletePost, getPosts, toggleLike } from "../api/postsApi";
import { getWorkouts } from "../api/workoutsApi";
import { CreatePostForm } from "../components/feed/CreatePostForm";
import { FeedModeTabs } from "../components/feed/FeedModeTabs";
import { FollowSuggestionItem } from "../components/feed/FollowSuggestionItem";
import { PostItem } from "../components/feed/PostItem";
import { StoriesRow } from "../components/feed/StoriesRow";
import { UserSummaryCard } from "../components/feed/UserSummaryCard";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusMessage } from "../components/ui/StatusMessage";
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
    <section className="feed-layout grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,680px)_minmax(240px,320px)]">
      <section className="feed-main grid gap-3.5">
        <Card tone="dark">
          <h2>Historias del gym</h2>
          <FeedModeTabs mode={feedMode} onChangeMode={setFeedMode} />
          <StoriesRow posts={posts} />
        </Card>

        <Card tone="dark">
          <h2>Crear publicacion</h2>
          <CreatePostForm
            content={content}
            selectedWorkoutId={selectedWorkoutId}
            workouts={workouts}
            onChangeContent={setContent}
            onChangeWorkoutId={setSelectedWorkoutId}
            onSubmit={handleCreatePost}
          />
        </Card>

        <StatusMessage loading={loading} error={error} success={message} />
        {!loading && visiblePosts.length === 0 && (
          <EmptyState
            message={
              feedMode === "following"
                ? "Aun no hay publicaciones de usuarios seguidos."
                : "Aun no hay publicaciones en la comunidad."
            }
          />
        )}

        <ul className="workouts-list mt-3 grid list-none gap-2.5 p-0">
          {visiblePosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              isOwner={post.userId === user?.id}
              currentUserId={user?.id}
              commentValue={commentByPostId[post.id] ?? ""}
              onChangeComment={(value) =>
                setCommentByPostId((current) => ({
                  ...current,
                  [post.id]: value,
                }))
              }
              onLike={() => handleToggleLike(post.id)}
              onDelete={() => handleDeletePost(post.id)}
              onComment={() => handleCreateComment(post.id)}
              getWorkoutTitle={getWorkoutTitle}
              formatDate={formatDate}
            />
          ))}
        </ul>
      </section>

      <Card as="aside" tone="dark" className="feed-right sticky top-4 max-lg:static">
        <UserSummaryCard username={user?.username} myPostsCount={myPostsCount} />
        <h3>Sugerencias para ti</h3>
        {suggestedUsers.length === 0 && <EmptyState message="Aun no hay sugerencias." className="mt-2 text-slate-400" />}
        <ul className="suggestions-list mt-2 grid list-none gap-2.5 p-0">
          {suggestedUsers.map((suggested) => (
            <FollowSuggestionItem
              key={suggested.id}
              user={suggested}
              isFollowing={followingIds.includes(suggested.id)}
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </ul>
      </Card>
    </section>
  );
}
