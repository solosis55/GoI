import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../api/authApi";
import { deletePost, getPosts, getPostsByUser, updatePost as updatePostApi } from "../api/postsApi";
import { getWorkoutSessions } from "../api/workoutSessionsApi";
import { getWorkouts } from "../api/workoutsApi";
import { PostMediaGallery } from "../components/feed/PostMediaGallery";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ProfileAccountCard } from "../components/profile/ProfileAccountCard";
import { ProfileAvatarPanel } from "../components/profile/ProfileAvatarPanel";
import { ProfileForm } from "../components/profile/ProfileForm";
import { ProfilePostsMosaic } from "../components/profile/ProfilePostsMosaic";
import { ProfilePostsMosaicSkeleton } from "../components/profile/ProfilePostsMosaicSkeleton";
import { WorkoutSessionsHistory } from "../components/workouts/WorkoutSessionsHistory";
import { useAuth } from "../context/AuthContext";
import type { SafeUser } from "../types/auth";
import type { Post } from "../types/post";
import type { Workout } from "../types/workout";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { getErrorMessage } from "../utils/errorMessages";
import { countSessionsThisWeek } from "../utils/musclePentagonStats";
import { loadSavedPostIds, pruneSavedPostIdsToExisting, toggleSavedPost } from "../utils/feedLocalPrefs";

type ProfileTab = "profile" | "posts" | "sessions";
type PostsSubTab = "mine" | "saved";

type ProfilePageProps = {
  onOpenPostInFeed?: (postId: string) => void;
  onGoToFeed?: () => void;
  onGoToStatistics?: () => void;
  onGoToWorkouts?: () => void;
  onGoToSettings?: () => void;
};

export function ProfilePage({
  onOpenPostInFeed,
  onGoToFeed,
  onGoToStatistics,
  onGoToWorkouts,
  onGoToSettings,
}: ProfilePageProps) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [goal, setGoal] = useState(user?.goal ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [accountEmail, setAccountEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<WorkoutSessionWithTitle[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingVisibility, setEditingVisibility] = useState<"public" | "followers" | "private">("public");
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>("profile");
  const [postsSubTab, setPostsSubTab] = useState<PostsSubTab>("mine");
  const [timelinePosts, setTimelinePosts] = useState<Post[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState("");
  const [savedPostIdSet, setSavedPostIdSet] = useState<Set<string>>(() => new Set());

  const userId = user?.id;

  const sessionsThisWeek = useMemo(() => countSessionsThisWeek(sessions), [sessions]);

  const loadMyPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    setPostsError("");
    try {
      const [list, workoutsRes] = await Promise.all([getPostsByUser(userId), getWorkouts()]);
      setMyPosts(list);
      setMyWorkouts(workoutsRes.filter((w) => w.userId === userId));
    } catch (loadError) {
      setPostsError(getErrorMessage(loadError, "No se pudieron cargar tus publicaciones"));
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  const loadTimelinePosts = useCallback(async () => {
    if (!userId) return;
    setTimelineLoading(true);
    setTimelineError("");
    try {
      const all = await getPosts();
      setTimelinePosts(all);
    } catch (e) {
      setTimelineError(getErrorMessage(e, "No se pudieron cargar el listado para guardados"));
    } finally {
      setTimelineLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setSavedPostIdSet(new Set());
      return;
    }
    setSavedPostIdSet(new Set(loadSavedPostIds(userId)));
  }, [userId]);

  useEffect(() => {
    if (profileTab !== "posts" || !userId) return;
    void loadTimelinePosts();
  }, [profileTab, userId, loadTimelinePosts]);

  useEffect(() => {
    if (profileTab !== "posts" || !userId) return;
    function onWinFocus() {
      void loadTimelinePosts();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") void loadTimelinePosts();
    }
    window.addEventListener("focus", onWinFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onWinFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [profileTab, userId, loadTimelinePosts]);

  function refreshSavedLocal() {
    if (!userId) return;
    setSavedPostIdSet(new Set(loadSavedPostIds(userId)));
  }

  const savedPostsOrdered = useMemo(() => {
    if (!userId || timelinePosts.length === 0) return [];
    const byId = new Map(timelinePosts.map((p) => [p.id, p]));
    const ids = loadSavedPostIds(userId);
    const out: Post[] = [];
    for (const id of ids) {
      const p = byId.get(id);
      if (p) out.push(p);
    }
    return out;
  }, [userId, timelinePosts, savedPostIdSet]);

  const timelinePostIdSet = useMemo(() => new Set(timelinePosts.map((p) => p.id)), [timelinePosts]);

  const savedOrphansCount = useMemo(() => {
    if (!userId) return 0;
    const ids = loadSavedPostIds(userId);
    return ids.filter((id) => !timelinePostIdSet.has(id)).length;
  }, [userId, timelinePostIdSet, savedPostIdSet]);

  function handlePruneSavedOrphans() {
    if (!userId) return;
    pruneSavedPostIdsToExisting(userId, timelinePostIdSet);
    refreshSavedLocal();
    setSelectedPostId(null);
  }

  const displayedPosts = postsSubTab === "mine" ? myPosts : savedPostsOrdered;
  const postsListLoading = postsSubTab === "mine" ? postsLoading : timelineLoading;

  const selectedPost =
    selectedPostId !== null ? (displayedPosts.find((p) => p.id === selectedPostId) ?? null) : null;
  const selectedPostIsMine = Boolean(userId && selectedPost && selectedPost.userId === userId);

  useEffect(() => {
    setSelectedPostId(null);
    setEditingPostId(null);
  }, [postsSubTab]);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");
    try {
      const response = await getProfile(userId);
      const u = response.user;
      setUsername(u.username);
      setBio(u.bio);
      setGoal(u.goal);
      setAvatarUrl(u.avatarUrl);
      const email = u.email ?? user?.email ?? "";
      setAccountEmail(email);
      const next: SafeUser = {
        id: u.id,
        username: u.username,
        email,
        bio: u.bio,
        goal: u.goal,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
      updateUser(next);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar el perfil"));
    } finally {
      setLoading(false);
    }
  }, [userId, user?.email, updateUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadMyPosts();
  }, [loadMyPosts]);

  useEffect(() => {
    if (!selectedPostId) return;
    if (postsSubTab === "mine") {
      if (!myPosts.some((p) => p.id === selectedPostId)) setSelectedPostId(null);
    } else if (!savedPostsOrdered.some((p) => p.id === selectedPostId)) {
      setSelectedPostId(null);
    }
  }, [myPosts, savedPostsOrdered, postsSubTab, selectedPostId]);

  useEffect(() => {
    setEditingPostId(null);
  }, [selectedPostId]);

  useEffect(() => {
    if (profileTab !== "posts") {
      setSelectedPostId(null);
      setEditingPostId(null);
    }
  }, [profileTab]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function loadSessions() {
      setSessionsLoading(true);
      setSessionsError("");
      try {
        const list = await getWorkoutSessions();
        if (!cancelled) setSessions(list);
      } catch (loadError) {
        if (!cancelled) {
          setSessionsError(getErrorMessage(loadError, "No se pudieron cargar las sesiones"));
        }
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    void loadSessions();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleDeletePost(postId: string) {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    setPostsError("");
    try {
      await deletePost(postId);
      await loadMyPosts();
    } catch (deleteErr) {
      setPostsError(getErrorMessage(deleteErr, "No se pudo eliminar la publicación"));
    }
  }

  function startEditingPost(post: Post) {
    setEditingPostId(post.id);
    setEditingContent(post.content);
    setEditingVisibility(post.visibility ?? "public");
    setPostsError("");
  }

  async function handleSavePostEdit() {
    if (!editingPostId) return;
    const trimmed = editingContent.trim();
    const edited = myPosts.find((p) => p.id === editingPostId);
    const hasPhotos = (edited?.media?.length ?? 0) > 0;
    if (trimmed.length > 280 || (!hasPhotos && trimmed.length < 4)) {
      setPostsError(
        "Sin fotos el texto debe tener entre 4 y 280 caracteres; con fotos, opcional hasta 280.",
      );
      return;
    }
    try {
      await updatePostApi(editingPostId, { content: trimmed, visibility: editingVisibility });
      setEditingPostId(null);
      setEditingContent("");
      await loadMyPosts();
    } catch (editErr) {
      setPostsError(getErrorMessage(editErr, "No se pudo actualizar la publicación"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");
    setError("");

    if (username.trim().length < 3) {
      setLoading(false);
      setError("El usuario debe tener al menos 3 caracteres");
      return;
    }
    if (goal.length > 60) {
      setLoading(false);
      setError("El objetivo no puede superar 60 caracteres");
      return;
    }
    if (bio.length > 200) {
      setLoading(false);
      setError("La bio no puede superar 200 caracteres");
      return;
    }
    const avatarOk =
      !avatarUrl ||
      /^https?:\/\//i.test(avatarUrl) ||
      /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(avatarUrl);
    if (!avatarOk) {
      setLoading(false);
      setError("La foto debe ser un enlace https o una imagen subida desde tu equipo.");
      return;
    }

    try {
      const response = await updateProfile(user.id, {
        username: username.trim(),
        bio,
        goal,
        avatarUrl,
      });
      updateUser(response.user);
      setAccountEmail(response.user.email);
      setMessage("Perfil actualizado correctamente");
      await loadMyPosts();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "No se pudo actualizar el perfil"));
    } finally {
      setLoading(false);
    }
  }

  function visibilityLabel(post: Post) {
    const v = post.visibility ?? "public";
    if (v === "public") return "Público";
    if (v === "followers") return "Seguidores";
    return "Solo yo";
  }

  function getWorkoutTitle(workoutId: string | null) {
    if (!workoutId) return null;
    const workout = myWorkouts.find((w) => w.id === workoutId);
    return workout?.title ?? "Rutina vinculada";
  }

  function handleRemoveFromSaved(postId: string) {
    if (!userId) return;
    toggleSavedPost(userId, postId);
    refreshSavedLocal();
    setSelectedPostId(null);
  }

  function tabClass(id: ProfileTab) {
    return [
      "rounded-t-lg px-3 py-2.5 text-sm font-medium transition",
      profileTab === id
        ? "border-b-2 border-goi-gold text-goi-gold light:border-amber-600 light:text-amber-900"
        : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-600 light:hover:text-zinc-900",
    ].join(" ");
  }

  const selectedPostPanel =
    selectedPost && profileTab === "posts" ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 md:hidden"
          aria-label="Cerrar detalle de publicación"
          onClick={() => setSelectedPostId(null)}
        />
        <div
          className={[
            "fs-panel-row mt-4 flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between",
            "md:relative md:mt-4",
            "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:m-0 max-md:max-h-[min(70vh,560px)] max-md:overflow-y-auto max-md:rounded-t-2xl max-md:border max-md:border-neutral-800 max-md:bg-zinc-950 max-md:p-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] max-md:shadow-[0_-12px_48px_rgba(0,0,0,0.55)] light:max-md:border-zinc-200 light:max-md:bg-white",
          ].join(" ")}
        >
          <div className="mb-1 flex items-center justify-between border-b border-neutral-800 pb-2 md:hidden light:border-zinc-200">
            <span className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Publicación</span>
            <button
              type="button"
              className="text-xs font-medium text-neutral-400 hover:text-goi-gold light:text-zinc-600 light:hover:text-amber-800"
              onClick={() => setSelectedPostId(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full border border-neutral-600 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-medium text-neutral-400 light:border-zinc-300 light:bg-zinc-200 light:text-zinc-700">
              {visibilityLabel(selectedPost)}
            </span>
            {!selectedPostIsMine ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-600 light:ring-zinc-300">
                  <Avatar src={selectedPost.authorAvatarUrl} alt="" fill className="ring-0" />
                </div>
                <p className="text-xs font-medium text-neutral-300 light:text-zinc-800">@{selectedPost.authorUsername}</p>
              </div>
            ) : null}
            {selectedPostIsMine && editingPostId === selectedPost.id ? (
              <div className="mt-2 grid gap-2">
                <textarea
                  className="goi-field min-h-[88px]"
                  maxLength={280}
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  placeholder="Texto opcional si la publicación tiene fotos."
                />
                {selectedPost.media && selectedPost.media.length > 0 ? (
                  <PostMediaGallery media={selectedPost.media} />
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="goi-field max-w-[170px]"
                    value={editingVisibility}
                    onChange={(event) =>
                      setEditingVisibility(event.target.value as "public" | "followers" | "private")
                    }
                  >
                    <option value="public">Público</option>
                    <option value="followers">Seguidores</option>
                    <option value="private">Solo yo</option>
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    className="!py-1.5 !text-xs"
                    onClick={() => void handleSavePostEdit()}
                  >
                    Guardar
                  </Button>
                  <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={() => setEditingPostId(null)}>
                    Cancelar
                  </Button>
                  <span className="text-xs text-neutral-500">{editingContent.trim().length}/280</span>
                </div>
                {selectedPost.workoutId ? (
                  <small className="text-neutral-400">Rutina: {getWorkoutTitle(selectedPost.workoutId)}</small>
                ) : null}
              </div>
            ) : (
              <>
                {selectedPost.content.trim() ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-200 light:text-zinc-900">
                    {selectedPost.content}
                  </p>
                ) : null}
                <PostMediaGallery media={selectedPost.media ?? []} />
                {selectedPost.workoutId ? (
                  <small className="mt-1 block text-neutral-400">
                    Rutina: {getWorkoutTitle(selectedPost.workoutId)}
                  </small>
                ) : null}
              </>
            )}
            <p className="mt-1 text-xs text-neutral-600 light:text-zinc-600">
              {selectedPost.comments.length} comentarios · {selectedPost.likesCount} likes
            </p>
          </div>
          <div className="flex flex-wrap gap-2 max-[479px]:w-full">
            {onOpenPostInFeed && editingPostId !== selectedPost.id ? (
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 self-start !py-1.5 !text-xs max-[479px]:w-full sm:self-auto"
                onClick={() => onOpenPostInFeed(selectedPost.id)}
              >
                Ver en Inicio
              </Button>
            ) : null}
            {userId && savedPostIdSet.has(selectedPost.id) ? (
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 self-start !py-1.5 !text-xs max-[479px]:w-full sm:self-auto"
                onClick={() => handleRemoveFromSaved(selectedPost.id)}
              >
                Quitar de guardados
              </Button>
            ) : null}
            {selectedPostIsMine ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 self-start !py-1.5 !text-xs max-[479px]:w-full sm:self-auto"
                  onClick={() => startEditingPost(selectedPost)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="shrink-0 self-start !py-1.5 !text-xs max-[479px]:w-full sm:self-auto"
                  onClick={() => void handleDeletePost(selectedPost.id)}
                >
                  Eliminar
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </>
    ) : null;

  return (
    <section className="profile-page mx-auto grid w-full max-w-5xl gap-5 px-4 sm:gap-6 sm:px-6">
      <header className="feed-page-header rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Tu cuenta</p>
        <div className="mt-3 flex flex-wrap items-start gap-4 sm:gap-5">
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setAvatarPanelOpen((open) => !open)}
              className="group rounded-full outline-none ring-offset-2 ring-offset-black transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-goi-gold light:ring-offset-zinc-100"
              aria-expanded={avatarPanelOpen}
              aria-haspopup="dialog"
              aria-label={avatarUrl ? "Cambiar foto de perfil" : "Añadir foto de perfil"}
            >
              {avatarUrl ? (
                <div className="relative size-20 overflow-hidden rounded-full ring-2 ring-goi-gold/25 group-hover:ring-goi-gold/55 sm:size-24">
                  <Avatar src={avatarUrl} alt={username || "Foto de perfil"} fill className="ring-0" />
                </div>
              ) : (
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-goi-gold/40 bg-black/55 px-1 text-center text-[11px] font-semibold leading-tight text-goi-gold/90 shadow-inner shadow-black/60 light:bg-zinc-100/90 light:shadow-inner light:shadow-zinc-900/10 sm:size-24 sm:text-xs">
                  + Añadir foto
                </span>
              )}
            </button>
            {userId ? (
              <ProfileAvatarPanel
                open={avatarPanelOpen}
                onClose={() => setAvatarPanelOpen(false)}
                userId={userId}
                avatarUrl={avatarUrl}
                usernameTrimmed={username.trim()}
                usernameAlt={username.trim() ? `@${username.trim()}` : "Tu foto de perfil"}
                bio={bio}
                goal={goal}
                onSaved={(next) => {
                  updateUser(next);
                  setAvatarUrl(next.avatarUrl ?? "");
                  setUsername(next.username ?? username);
                  setBio(next.bio ?? bio);
                  setGoal(next.goal ?? goal);
                  setAccountEmail(next.email ?? accountEmail);
                  setMessage("Foto actualizada.");
                  void loadMyPosts();
                }}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900 sm:text-2xl">
                @{username || "usuario"}
              </h1>
              {goal.trim() ? <p className="mt-1 text-sm text-goi-gold/90">{goal}</p> : null}
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
                {bio.trim() ? bio : "Sin biografía todavía. Edítala en la pestaña Perfil."}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 light:text-zinc-600">
                Cada publicación tiene su visibilidad propia (público, seguidores o solo tú).{" "}
                <Link
                  to="/privacidad"
                  className="font-medium text-goi-gold underline-offset-2 hover:underline light:text-amber-900"
                >
                  Política de privacidad
                </Link>
                {onGoToSettings ? (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="font-medium text-goi-gold underline-offset-2 hover:underline light:text-amber-900"
                      onClick={onGoToSettings}
                    >
                      Ajustes
                    </button>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              <span className="rounded-full border border-neutral-700/90 bg-black/30 px-2.5 py-1 font-medium tabular-nums text-neutral-200 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-900">
                {postsLoading ? "…" : `${myPosts.length} mías`}
              </span>
              <span className="rounded-full border border-neutral-700/90 bg-black/30 px-2.5 py-1 font-medium tabular-nums text-neutral-200 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-900">
                {savedPostIdSet.size} guardados
              </span>
              <span className="rounded-full border border-neutral-700/90 bg-black/30 px-2.5 py-1 font-medium tabular-nums text-neutral-200 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-900">
                {sessionsLoading ? "…" : `${sessions.length} entrenos`}
              </span>
              <span className="rounded-full border border-goi-gold/35 bg-goi-gold/10 px-2.5 py-1 font-medium tabular-nums text-goi-gold light:border-amber-400/50 light:bg-amber-100/80 light:text-amber-950">
                {sessionsLoading ? "…" : `Esta semana · ${sessionsThisWeek}`}
              </span>
              <span className="rounded-full border border-neutral-700/90 bg-black/30 px-2.5 py-1 font-medium tabular-nums text-neutral-200 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-900">
                {postsLoading ? "…" : `${myWorkouts.length} rutinas`}
              </span>
            </div>

            {(onGoToFeed || onGoToStatistics || onGoToWorkouts) && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {onGoToFeed ? (
                  <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={onGoToFeed}>
                    Ir al Inicio
                  </Button>
                ) : null}
                {onGoToStatistics ? (
                  <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={onGoToStatistics}>
                    Ver estadísticas
                  </Button>
                ) : null}
                {onGoToWorkouts ? (
                  <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={onGoToWorkouts}>
                    Ir a rutinas
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-neutral-800/80 light:border-zinc-200">
        <nav className="flex flex-wrap gap-1" role="tablist" aria-label="Secciones del perfil">
          <button
            type="button"
            role="tab"
            aria-selected={profileTab === "profile"}
            className={tabClass("profile")}
            onClick={() => setProfileTab("profile")}
          >
            Perfil
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={profileTab === "posts"}
            className={tabClass("posts")}
            onClick={() => setProfileTab("posts")}
          >
            Publicaciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={profileTab === "sessions"}
            className={tabClass("sessions")}
            onClick={() => setProfileTab("sessions")}
          >
            Entrenos
          </button>
        </nav>
      </div>

      {profileTab === "profile" ? (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
          <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
            <h2 className="mt-0 text-lg font-semibold text-neutral-100 light:text-zinc-900">Datos públicos</h2>
            <p className="mb-3 text-sm text-neutral-500 light:text-zinc-600">
              Usuario, objetivo y bio se muestran en el feed y en cómo te ven quienes te siguen. La foto la cambias
              pulsando tu imagen arriba.
            </p>
            <ProfileForm
              username={username}
              goal={goal}
              bio={bio}
              loading={loading}
              error={error}
              message={message}
              onChangeUsername={setUsername}
              onChangeGoal={setGoal}
              onChangeBio={setBio}
              onSubmit={handleSubmit}
            />
          </Card>
          <ProfileAccountCard accountEmail={accountEmail} />
        </div>
      ) : null}

      {profileTab === "posts" ? (
        <Card tone="dark" className="relative border-neutral-800/70 light:border-zinc-200">
          <h2 className="mt-0 text-lg font-semibold text-neutral-100 light:text-zinc-900">Publicaciones</h2>
          <p className="mt-1 text-sm text-neutral-500 light:text-zinc-600">
            {postsSubTab === "mine"
              ? "Tus publicaciones en cuadrícula de miniaturas. Pulsa el marcador para ver las guardadas en este dispositivo."
              : "Publicaciones que guardaste desde el menú ··· en Inicio. Pulsa la cuadrícula para volver a las tuyas."}
          </p>

          <div
            className="mt-4 flex items-end justify-center gap-12 border-b border-neutral-800 pb-2 sm:gap-16 light:border-zinc-200"
            role="tablist"
            aria-label="Vista de publicaciones"
          >
            <button
              type="button"
              role="tab"
              aria-selected={postsSubTab === "mine"}
              aria-label="Mis publicaciones"
              title="Mis publicaciones"
              onClick={() => setPostsSubTab("mine")}
              className={[
                "inline-flex flex-col items-center rounded-lg px-3 pt-2 outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
                postsSubTab === "mine"
                  ? "border-t-2 border-goi-gold text-goi-gold light:border-amber-600 light:text-amber-800"
                  : "border-t-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-500 light:hover:text-zinc-800",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                <path
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                  d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z"
                />
              </svg>
              <span
                className={[
                  "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                  postsSubTab === "mine"
                    ? "text-goi-gold light:text-amber-900"
                    : "text-neutral-500 light:text-zinc-500",
                ].join(" ")}
              >
                Mías
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={postsSubTab === "saved"}
              aria-label="Guardados"
              title="Guardados"
              onClick={() => setPostsSubTab("saved")}
              className={[
                "inline-flex flex-col items-center rounded-lg px-3 pt-2 outline-none transition focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white",
                postsSubTab === "saved"
                  ? "border-t-2 border-goi-gold text-goi-gold light:border-amber-600 light:text-amber-800"
                  : "border-t-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-500 light:hover:text-zinc-800",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                <path
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 4h12v17l-6-4-6 4V4z"
                />
              </svg>
              <span
                className={[
                  "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                  postsSubTab === "saved"
                    ? "text-goi-gold light:text-amber-900"
                    : "text-neutral-500 light:text-zinc-500",
                ].join(" ")}
              >
                Guardados
              </span>
            </button>
          </div>

          {postsSubTab === "mine" ? (
            <details className="mt-3 text-xs text-neutral-500 light:text-zinc-600">
              <summary className="cursor-pointer select-none font-medium text-neutral-400 hover:text-neutral-300 light:text-zinc-500 light:hover:text-zinc-800">
                Cómo está montada la cuadrícula
              </summary>
              <p className="mt-2 leading-relaxed">
                Primera fila: seis miniaturas estrechas; siguientes filas: tres más anchas; sin huecos entre celdas.
              </p>
            </details>
          ) : null}

          {postsError ? <p className="mt-2 text-sm text-red-400 light:text-red-700">{postsError}</p> : null}
          {timelineError ? <p className="mt-2 text-sm text-red-400 light:text-red-700">{timelineError}</p> : null}

          {postsSubTab === "saved" && !timelineLoading && !timelineError && savedOrphansCount > 0 ? (
            <div
              className="mt-3 flex flex-col gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between light:border-amber-600/40 light:bg-amber-100/80"
              role="status"
            >
              <p className="m-0 text-xs leading-relaxed text-amber-100/95 light:text-amber-950">
                Hay {savedOrphansCount} guardado{savedOrphansCount === 1 ? "" : "s"} que ya no aparecen en el Inicio
                (borrados o fuera de alcance). Puedes limpiar la lista local.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 self-start !py-1.5 !text-xs sm:self-auto"
                onClick={() => handlePruneSavedOrphans()}
              >
                Limpiar lista
              </Button>
            </div>
          ) : null}

          {postsListLoading ? (
            <div className="mt-4 w-full">
              <ProfilePostsMosaicSkeleton />
            </div>
          ) : postsSubTab === "mine" && myPosts.length === 0 ? (
            <EmptyState
              showIcon
              className="mt-4"
              message="Aún no tienes publicaciones. Abre Inicio y crea tu primera publicación."
            />
          ) : postsSubTab === "saved" && savedPostsOrdered.length === 0 ? (
            <EmptyState
              showIcon
              className="mt-4"
              message="No tienes publicaciones guardadas. En Inicio, abre el menú ··· en una tarjeta y elige Guardar publicación."
            />
          ) : (
            <>
              <div className="mt-3 w-full">
                <ProfilePostsMosaic
                  posts={displayedPosts}
                  selectedId={selectedPostId}
                  onSelect={(id) => setSelectedPostId((current) => (current === id ? null : id))}
                />
              </div>

              {selectedPostPanel}

              {!selectedPost ? (
                <p className="mt-3 text-xs text-neutral-500 light:text-zinc-600">
                  Pulsa una miniatura para ver texto completo, estadísticas y acciones.
                </p>
              ) : null}
            </>
          )}
        </Card>
      ) : null}

      {profileTab === "sessions" ? (
        <>
          {sessionsError ? <p className="m-0 text-sm text-red-400 light:text-red-700">{sessionsError}</p> : null}
          <WorkoutSessionsHistory
            title="Entrenamientos registrados"
            description={
              <>
                Lo que anotas en Rutinas aparece aquí. Para registrar entrenos nuevos o gestionar el historial completo,
                usa la pestaña <strong className="font-semibold text-neutral-400 light:text-zinc-700">Rutinas</strong>.
              </>
            }
            sessions={sessions}
            loading={sessionsLoading}
            emptyMessage="Aún no hay entrenamientos. Regístralos desde la pestaña Rutinas."
            showDelete={false}
          />
        </>
      ) : null}
    </section>
  );
}
