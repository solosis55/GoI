import { useMemo, useState } from "react";
import { useNearViewport } from "../../hooks/useNearViewport";
import { PostMediaGallery } from "./PostMediaGallery";
import { ProfilePostsMosaic } from "../profile/ProfilePostsMosaic";
import { ProfilePostsMosaicSkeleton } from "../profile/ProfilePostsMosaicSkeleton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import type { Post } from "../../types/post";
import {
  parseInstagramProfileUrl,
  parseStravaProfileUrl,
  parseWebsiteProfileUrl,
} from "../../utils/profileLinks";

type ProfileTab = "posts" | "sessions";
type PostsFilter = "all" | "photos" | "recent";

type ExternalUserProfilePageProps = {
  userId: string;
  currentUserId: string | undefined;
  initialFollowingIds: string[];
  onBack: () => void;
  onFollowingChanged?: (targetUserId: string, following: boolean) => void;
  onOpenPostInFeed?: (postId: string) => void;
};

function tabClass(active: ProfileTab, id: ProfileTab) {
  return [
    "rounded-t-lg px-3 py-2.5 text-sm font-medium transition",
    active === id
      ? "border-b-2 border-goi-gold text-goi-gold light:border-amber-600 healthy:border-goi-gold/38 light:text-amber-900 healthy:text-goi-gold-dim"
      : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-300 light:text-zinc-600 light:hover:text-zinc-900",
  ].join(" ");
}

function visibilityLabelPost(post: Post) {
  const v = post.visibility ?? "public";
  if (v === "public") return "Público";
  if (v === "followers") return "Seguidores";
  return "Solo yo";
}

/** Icono reservado para el menú de interacciones (DM, compartir, etc.). */
function InteractionsMenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" d="M19 8v6M22 11h-6" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export function ExternalUserProfilePage({
  userId,
  currentUserId,
  initialFollowingIds,
  onBack,
  onFollowingChanged,
  onOpenPostInFeed,
}: ExternalUserProfilePageProps) {
  const { load: _load, ...profileUi } = usePublicProfile({
    userId,
    currentUserId,
    initialFollowingIds,
    onFollowingChanged,
  });
  const {
    profile,
    postsTotal,
    postsNextCursor,
    postsLoadingMore,
    orderedPosts,
    loading,
    error,
    following,
    followBusy,
    showRestricted,
    followerCount,
    followingCount,
    handleToggleFollow,
    loadMorePosts,
  } = profileUi;

  const [profileTab, setProfileTab] = useState<ProfileTab>("posts");
  const [postsFilter, setPostsFilter] = useState<PostsFilter>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const postsInfiniteEnabled =
    profileTab === "posts" &&
    Boolean(postsNextCursor) &&
    !showRestricted &&
    !loading &&
    !postsLoadingMore;
  const postsLoadMoreRef = useNearViewport(() => void loadMorePosts(), postsInfiniteEnabled);

  const username = profile?.username?.trim() ?? "";
  const pin = profile?.pinnedPostId?.trim() ?? "";

  const filteredPosts = useMemo(() => {
    let list = [...orderedPosts];
    if (postsFilter === "photos") {
      list = list.filter((p) => (p.media?.length ?? 0) > 0);
    }
    if (postsFilter === "recent") {
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } else if (pin) {
      list.sort((a, b) => {
        if (a.id === pin) return -1;
        if (b.id === pin) return 1;
        return a.createdAt < b.createdAt ? 1 : -1;
      });
    } else {
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return list;
  }, [orderedPosts, postsFilter, pin]);

  const pinnedPost = useMemo(() => {
    if (!pin) return null;
    return orderedPosts.find((p) => p.id === pin) ?? null;
  }, [pin, orderedPosts]);

  const selectedPost =
    selectedPostId !== null ? (filteredPosts.find((p) => p.id === selectedPostId) ?? null) : null;

  return (
    <section className="profile-page mx-auto grid w-full max-w-5xl gap-5 px-4 sm:gap-6 sm:px-6">
      <header className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-zinc-950/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] light:border-zinc-200 light:bg-white light:shadow-md">
        <div className="relative h-36 sm:h-44">
          {profile?.bannerUrl?.trim() &&
          (/^https?:\/\//i.test(profile.bannerUrl) ||
            /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(profile.bannerUrl)) &&
          profile.bannerShowInFeed !== false &&
          !showRestricted ? (
            <img src={profile.bannerUrl} alt="" className="absolute inset-0 size-full object-cover" decoding="async" />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-goi-gold/25 via-neutral-900 to-zinc-950 light:from-amber-200/50 healthy:from-goi-gold/20 light:via-zinc-100 light:to-white"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent light:from-white light:via-white/70 light:to-transparent" />

          <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-neutral-100 backdrop-blur-sm transition hover:bg-black/50 light:border-zinc-300 light:bg-white/85 light:text-zinc-900 light:hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              Mi perfil
            </button>
          </div>
        </div>

        <div className="relative -mt-11 px-4 pb-4 pt-0 sm:-mt-12 sm:px-6 sm:pb-5">
          <div className="flex flex-wrap items-end gap-4 sm:gap-6">
            <div className="shrink-0">
              <div className="rounded-full ring-4 ring-zinc-950 ring-offset-0 light:ring-white">
                <div className="relative size-[5.25rem] overflow-hidden rounded-full ring-2 ring-goi-gold/40 sm:size-28">
                  <Avatar src={profile?.avatarUrl ?? ""} alt={username ? `@${username}` : "Avatar"} fill className="ring-0" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-3 pb-0.5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <h1 className="text-xl font-semibold tracking-tight text-neutral-50 light:text-zinc-900 sm:text-2xl">
                    @{loading && !username ? "…" : username || "usuario"}
                  </h1>
                  {profile?.location?.trim() && !showRestricted ? (
                    <p className="mt-0.5 text-xs text-neutral-500 light:text-zinc-600">{profile.location.trim()}</p>
                  ) : null}
                  {profile?.goal?.trim() && !showRestricted ? (
                    <p className="mt-1 text-sm text-goi-gold/95 light:text-amber-900 healthy:text-goi-gold-dim">{profile.goal}</p>
                  ) : null}
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-400 light:text-zinc-600">
                    {showRestricted
                      ? "Perfil limitado hasta que sigas a esta cuenta."
                      : profile?.bio?.trim()
                        ? profile.bio
                        : null}
                  </p>
                </div>

                <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-end gap-2 sm:w-auto sm:min-w-[min(100%,17rem)]">
                  <button
                    type="button"
                    title="Interacciones (próximamente)"
                    aria-label="Interacciones — enlace reservado"
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-neutral-700/90 bg-neutral-900/60 text-neutral-200 shadow-inner transition hover:border-goi-gold/45 hover:bg-neutral-800 hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/50 light:border-zinc-200 light:bg-white light:text-zinc-700 light:shadow-sm light:hover:border-amber-400/60 healthy:hover:border-goi-gold/34 light:hover:bg-amber-50/90 healthy:hover:bg-goi-gold/[0.08] light:hover:text-amber-950 healthy:hover:text-goi-gold-dim"
                    onClick={() => {}}
                  >
                    <InteractionsMenuIcon className="size-[1.2rem]" />
                  </button>
                  <button
                    type="button"
                    disabled={followBusy}
                    title={following ? "Pulsa para dejar de seguir" : undefined}
                    onClick={() => void handleToggleFollow()}
                    className={[
                      "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-55 light:focus-visible:ring-offset-white sm:min-w-[10.5rem] sm:flex-initial",
                      following
                        ? "border border-goi-gold/50 bg-goi-gold/[0.12] text-goi-gold shadow-[inset_0_1px_0_0_rgba(212,175,55,0.12)] hover:bg-goi-gold/[0.18] light:border-amber-400/55 healthy:border-goi-gold/36 light:bg-amber-50 healthy:bg-goi-gold/[0.09] light:text-amber-950 healthy:text-goi-gold-dim light:hover:bg-amber-100/90 healthy:hover:bg-goi-gold/[0.14]"
                        : "bg-linear-to-br from-goi-gold via-[#c9a432] to-goi-gold-dim text-zinc-950 shadow-[0_10px_36px_-10px_rgba(212,175,55,0.65)] hover:brightness-[1.06] active:scale-[0.98] light:from-amber-400 light:via-amber-500 healthy:via-goi-gold light:to-amber-600 healthy:to-goi-gold-dim light:text-zinc-950 light:shadow-[0_12px_36px_-12px_rgba(217,119,6,0.45)]",
                    ].join(" ")}
                  >
                    {followBusy ? (
                      <span className="size-4 animate-pulse rounded-full bg-current/30" aria-hidden />
                    ) : following ? (
                      <CheckCircleIcon className="size-[1.05rem] shrink-0 opacity-90" />
                    ) : (
                      <UserPlusIcon className="size-[1.05rem] shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      {followBusy ? "Guardando…" : following ? "Siguiendo" : "Seguir"}
                    </span>
                  </button>
                </div>
              </div>

              {!showRestricted &&
              (profile?.websiteUrl || profile?.instagramUrl || profile?.stravaUrl) &&
              (profile.websiteUrl?.trim() ||
                profile.instagramUrl?.trim() ||
                profile.stravaUrl?.trim()) ? (
                <div className="flex flex-wrap gap-2">
                  {profile.websiteUrl?.trim() ? (
                    <a
                      href={parseWebsiteProfileUrl(profile.websiteUrl) || profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600/80 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-neutral-200 backdrop-blur-sm hover:border-goi-gold/50 hover:text-goi-gold light:border-zinc-300 light:bg-zinc-100 light:text-zinc-800"
                    >
                      Web
                    </a>
                  ) : null}
                  {profile.instagramUrl?.trim() ? (
                    <a
                      href={parseInstagramProfileUrl(profile.instagramUrl) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600/80 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-neutral-200 backdrop-blur-sm hover:border-goi-gold/50 hover:text-goi-gold light:border-zinc-300 light:bg-zinc-100 light:text-zinc-800"
                    >
                      Instagram
                    </a>
                  ) : null}
                  {profile.stravaUrl?.trim() ? (
                    <a
                      href={parseStravaProfileUrl(profile.stravaUrl) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600/80 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-neutral-200 backdrop-blur-sm hover:border-goi-gold/50 hover:text-goi-gold light:border-zinc-300 light:bg-zinc-100 light:text-zinc-800"
                    >
                      Strava
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-1 border-t border-neutral-800/80 pt-3 light:border-zinc-200">
                <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 sm:gap-x-10">
                  <p className="m-0 flex min-w-0 items-baseline gap-1.5">
                    <span className="text-lg font-semibold tabular-nums text-neutral-50 sm:text-xl light:text-zinc-900">
                      {loading ? "…" : followerCount}
                    </span>
                    <span className="text-sm text-neutral-500 light:text-zinc-600">seguidores</span>
                  </p>
                  <p className="m-0 flex min-w-0 items-baseline gap-1.5">
                    <span className="text-lg font-semibold tabular-nums text-neutral-50 sm:text-xl light:text-zinc-900">
                      {loading ? "…" : followingCount}
                    </span>
                    <span className="text-sm text-neutral-500 light:text-zinc-600">seguidos</span>
                  </p>
                  <p className="m-0 flex min-w-0 items-baseline gap-1.5">
                    <span className="text-lg font-semibold tabular-nums text-neutral-50 sm:text-xl light:text-zinc-900">
                      {loading ? "…" : postsTotal}
                    </span>
                    <span className="text-sm text-neutral-500 light:text-zinc-600">publicaciones</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <p className="m-0 rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 light:border-red-300 light:bg-red-50 light:text-red-900">
          {error}
        </p>
      ) : null}

      <div className="border-b border-neutral-800/80 light:border-zinc-200">
        <nav className="flex flex-wrap gap-1" role="tablist" aria-label="Perfil ajeno">
          <button type="button" role="tab" aria-selected={profileTab === "posts"} className={tabClass(profileTab, "posts")} onClick={() => setProfileTab("posts")}>
            Publicaciones
          </button>
          <button type="button" role="tab" aria-selected={profileTab === "sessions"} className={tabClass(profileTab, "sessions")} onClick={() => setProfileTab("sessions")}>
            Entrenos
          </button>
        </nav>
      </div>

      {profileTab === "posts" ? (
        <div className="relative w-full">
          <h2 className="sr-only">Publicaciones</h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 light:text-zinc-500">
              Filtro
            </span>
            {(["all", "photos", "recent"] as const).map((fid) => (
              <button
                key={fid}
                type="button"
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  postsFilter === fid
                    ? "border-goi-gold/50 bg-goi-gold/15 text-goi-gold light:border-amber-500/50 healthy:border-goi-gold/38 light:bg-amber-100 healthy:bg-goi-gold/[0.11] light:text-amber-950 healthy:text-goi-gold-dim"
                    : "border-neutral-700/80 text-neutral-400 hover:border-neutral-500 light:border-zinc-300 light:text-zinc-600",
                ].join(" ")}
                onClick={() => setPostsFilter(fid)}
              >
                {fid === "all" ? "Todas" : fid === "photos" ? "Con foto" : "Recientes"}
              </button>
            ))}
          </div>

          {pinnedPost && !showRestricted ? (
            <div className="mt-3 rounded-xl border border-goi-gold/35 bg-goi-gold/5 px-3 py-2 text-xs light:border-amber-400/40 healthy:border-goi-gold/30 light:bg-amber-50 healthy:bg-goi-gold/[0.07]">
              <span className="font-semibold text-goi-gold light:text-amber-900 healthy:text-goi-gold-dim">Destacada · </span>
              <span className="text-neutral-300 light:text-zinc-800">
                {pinnedPost.content.trim()
                  ? pinnedPost.content.slice(0, 120) + (pinnedPost.content.length > 120 ? "…" : "")
                  : "Publicación con medios"}
              </span>
            </div>
          ) : null}

          {loading && !profile ? (
            <div className="-mx-4 mt-3 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]" aria-busy="true">
              <ProfilePostsMosaicSkeleton layout="grid" />
            </div>
          ) : showRestricted ? (
            <EmptyState className="mt-4" message="Sigue a esta cuenta para ver las publicaciones permitidas." />
          ) : filteredPosts.length === 0 ? (
            <EmptyState className="mt-4" message="Sin publicaciones visibles con los filtros actuales." />
          ) : (
            <>
              <div className="-mx-4 mt-3 w-[calc(100%+2rem)] sm:-mx-6 sm:mt-4 sm:w-[calc(100%+3rem)]">
                <ProfilePostsMosaic
                  posts={filteredPosts}
                  selectedId={selectedPostId}
                  layout="grid"
                  pinnedPostId={profile?.pinnedPostId?.trim() || null}
                  onSelect={setSelectedPostId}
                />
              </div>

              {postsNextCursor ? (
                <div ref={postsLoadMoreRef} className="h-10 w-full" aria-hidden />
              ) : null}
              {postsLoadingMore ? (
                <p className="mt-2 text-center text-[11px] text-neutral-500 light:text-zinc-500">
                  Cargando más publicaciones…
                </p>
              ) : null}

              {selectedPost ? (
                <div className="fs-panel-row mt-4 flex flex-col gap-3 rounded-xl border border-neutral-800/80 bg-neutral-950/30 p-4 light:border-zinc-200 light:bg-zinc-50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-neutral-600 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-medium text-neutral-400 light:border-zinc-300 light:bg-zinc-200 light:text-zinc-700">
                      {visibilityLabelPost(selectedPost)}
                    </span>
                    {profile?.pinnedPostId === selectedPost.id ? (
                      <span className="inline-flex rounded-full border border-goi-gold/40 bg-goi-gold/15 px-2 py-0.5 text-[10px] font-medium text-goi-gold light:text-amber-900 healthy:text-goi-gold-dim">
                        Destacada
                      </span>
                    ) : null}
                  </div>
                  {selectedPost.content.trim() ? (
                    <p className="m-0 whitespace-pre-wrap text-sm text-neutral-200 light:text-zinc-900">{selectedPost.content}</p>
                  ) : null}
                  <PostMediaGallery media={selectedPost.media ?? []} />
                  {selectedPost.workoutId ? (
                    <small className="block text-neutral-400">Publicación vinculada a una rutina.</small>
                  ) : null}
                  <p className="m-0 text-xs text-neutral-600 light:text-zinc-600">
                    {selectedPost.comments.length} comentarios · {selectedPost.likesCount} likes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {onOpenPostInFeed ? (
                      <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={() => onOpenPostInFeed(selectedPost.id)}>
                        Ver en Inicio
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-neutral-500 light:text-zinc-600">Pulsa una miniatura para ver el detalle.</p>
              )}
            </>
          )}
        </div>
      ) : null}

      {profileTab === "sessions" ? (
        <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
          <h2 className="mt-0 text-lg font-semibold text-neutral-100 light:text-zinc-900">Entrenos</h2>
          <p className="mt-1 text-sm text-neutral-500 light:text-zinc-600">
            Aquí mostraremos el historial que esta cuenta decida hacer público.
          </p>
          <EmptyState className="mt-4" showIcon message="Todavía no hay entrenos públicos." />
        </Card>
      ) : null}
    </section>
  );
}
