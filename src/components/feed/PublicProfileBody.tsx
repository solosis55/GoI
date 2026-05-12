import { useNearViewport } from "../../hooks/useNearViewport";
import type { ProfileUser } from "../../types/auth";
import type { Post } from "../../types/post";
import {
  parseInstagramProfileUrl,
  parseStravaProfileUrl,
  parseWebsiteProfileUrl,
} from "../../utils/profileLinks";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

function visibilityPillClasses(v: Post["visibility"]) {
  if (v === "public") {
    return "border-emerald-500/35 bg-emerald-500/10 text-emerald-200 light:border-emerald-600/40 light:bg-emerald-50 light:text-emerald-900 healthy:border-goi-gold/30 healthy:bg-goi-gold/[0.08] healthy:text-goi-gold-dim";
  }
  if (v === "followers") {
    return "border-goi-gold/40 bg-goi-gold/10 text-goi-gold light:border-amber-400/50 light:bg-amber-50 healthy:bg-goi-gold/[0.09] light:text-amber-950 healthy:text-goi-gold-dim";
  }
  return "border-neutral-600/60 bg-neutral-800/60 text-neutral-400 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-700";
}

function visibilityLabelShort(v: Post["visibility"]) {
  if (v === "public") return "Público";
  if (v === "followers") return "Seguidores";
  return "Solo yo";
}

export type PublicProfileBodyProps = {
  variant: "modal" | "page";
  profile: ProfileUser | null;
  posts: Post[];
  orderedPosts: Post[];
  loading: boolean;
  error: string;
  following: boolean;
  followBusy: boolean;
  showRestricted: boolean;
  handleToggleFollow: () => Promise<void>;
  /** Modal: botón X del banner */
  onModalClose?: () => void;
  /** Modal pie: ir a la vista de perfil completa en la pestaña Perfil */
  onGoToFullProfile?: () => void;
  /** Scroll infinito de publicaciones (modal / vista compacta). */
  loadMorePosts?: () => void;
  postsNextCursor?: string | null;
  postsLoadingMore?: boolean;
  /** Opcional (viene del hook); no se muestra en el modal listado. */
  postsTotal?: number;
};

export function PublicProfileBody({
  variant,
  profile,
  posts,
  orderedPosts,
  loading,
  error,
  following,
  followBusy,
  showRestricted,
  handleToggleFollow,
  onModalClose,
  onGoToFullProfile,
  loadMorePosts,
  postsNextCursor,
  postsLoadingMore,
}: PublicProfileBodyProps) {
  const postsInfiniteEnabled = Boolean(
    loadMorePosts && postsNextCursor && !postsLoadingMore && !loading,
  );
  const postsLoadMoreSentinelRef = useNearViewport(() => loadMorePosts?.(), postsInfiniteEnabled);

  const sectionClass =
    variant === "modal"
      ? "flex max-h-[min(92vh,680px)] min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800/90 bg-zinc-950 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.88)] ring-1 ring-goi-gold/[0.12] light:border-zinc-200/95 light:bg-white light:shadow-[0_24px_60px_-18px_rgba(24,24,27,0.22)] light:ring-amber-400/15 healthy:ring-goi-gold/16"
      : "mx-auto mb-8 mt-2 flex min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800/90 bg-zinc-950 shadow-md ring-1 ring-goi-gold/[0.12] light:border-zinc-200/95 light:bg-white light:shadow-md light:ring-amber-400/15 healthy:ring-goi-gold/16";

  const scrollAreaClass =
    variant === "modal"
      ? "min-h-0 flex-1 overflow-y-auto border-t border-neutral-800/80 px-4 pb-3 pt-3 light:border-zinc-200"
      : "border-t border-neutral-800/80 px-4 pb-3 pt-3 light:border-zinc-200";

  const sectionProps =
    variant === "modal"
      ? {
          role: "dialog" as const,
          "aria-modal": true as const,
          "aria-labelledby": "public-profile-heading",
        }
      : {
          role: "region" as const,
          "aria-labelledby": "public-profile-heading",
        };

  return (
    <section className={sectionClass} {...sectionProps}>
      <div className="relative h-[7.25rem] shrink-0 sm:h-36">
        {variant === "modal" && onModalClose ? (
          <button
            type="button"
            onClick={onModalClose}
            className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-neutral-100 shadow-lg backdrop-blur-md transition hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/60 light:border-black/10 light:bg-white/85 light:text-zinc-800 light:hover:bg-white"
            aria-label="Cerrar perfil"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
        {profile?.bannerUrl?.trim() &&
        (/^https?:\/\//i.test(profile.bannerUrl) ||
          /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(profile.bannerUrl)) &&
        profile.bannerShowInFeed !== false &&
        !showRestricted ? (
          <img src={profile.bannerUrl} alt="" className="absolute inset-0 size-full object-cover" decoding="async" />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(212,175,55,0.22),transparent_55%),linear-gradient(165deg,rgba(24,24,27,0.95)_0%,rgba(9,9,11,1)_45%,rgba(24,24,27,0.92)_100%)] light:bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,rgba(251,191,36,0.35),transparent_50%),linear-gradient(165deg,#fafafa_0%,#e4e4e7_100%)] healthy:bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,rgba(52,211,153,0.28),transparent_50%),linear-gradient(165deg,#f7faf8_0%,#e7efe9_100%)]"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/65 to-transparent light:from-white light:via-white/75" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-goi-gold/25 to-transparent light:via-amber-400/30 healthy:via-goi-gold/30" />
      </div>

      <header className="relative -mt-10 shrink-0 px-4 pb-4 pt-0 sm:-mt-11 sm:px-5">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="relative size-[3.75rem] shrink-0 overflow-hidden rounded-full shadow-[0_8px_28px_-8px_rgba(0,0,0,0.65)] ring-[3px] ring-zinc-950 ring-offset-0 light:size-16 light:shadow-md light:ring-white">
            <span className="absolute inset-0 rounded-full ring-2 ring-inset ring-goi-gold/35 light:ring-amber-400/40 healthy:ring-goi-gold/22" aria-hidden />
            <Avatar src={profile?.avatarUrl ?? ""} alt={profile?.username ?? ""} fill className="ring-0" />
          </div>
          <div className="min-w-0 pt-6 sm:pt-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-goi-gold-dim light:text-amber-800 healthy:text-goi-gold-dim/90">
              Perfil
            </p>
            <h2
              id="public-profile-heading"
              className="truncate text-lg font-semibold tracking-tight text-neutral-50 light:text-zinc-900 sm:text-xl"
            >
              {loading ? "Cargando…" : `@${profile?.username ?? ""}`}
            </h2>
            {profile?.location?.trim() ? (
              <p className="mt-0.5 text-xs text-neutral-500 light:text-zinc-600">{profile.location.trim()}</p>
            ) : null}
            {profile?.goal?.trim() && !showRestricted ? (
              <p className="mt-1.5 text-sm font-medium text-goi-gold/95 light:text-amber-900 healthy:text-goi-gold-dim">{profile.goal}</p>
            ) : null}
            {profile?.bio?.trim() && !showRestricted ? (
              <p className="mt-2 text-sm leading-relaxed text-neutral-400 light:text-zinc-600">{profile.bio}</p>
            ) : null}
            {(profile?.websiteUrl || profile?.instagramUrl || profile?.stravaUrl) && !showRestricted ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.websiteUrl ? (
                  <a
                    href={parseWebsiteProfileUrl(profile.websiteUrl) || profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-neutral-600/70 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-neutral-200 backdrop-blur-sm transition hover:border-goi-gold/45 hover:text-goi-gold light:border-zinc-300 light:bg-white/90 light:text-zinc-800 light:hover:border-amber-400/60 healthy:hover:border-goi-gold/34 light:hover:text-amber-900 healthy:hover:text-goi-gold-dim"
                  >
                    Web
                  </a>
                ) : null}
                {profile.instagramUrl ? (
                  <a
                    href={parseInstagramProfileUrl(profile.instagramUrl) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-neutral-600/70 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-neutral-200 backdrop-blur-sm transition hover:border-goi-gold/45 hover:text-goi-gold light:border-zinc-300 light:bg-white/90 light:text-zinc-800 light:hover:border-amber-400/60 healthy:hover:border-goi-gold/34 light:hover:text-amber-900 healthy:hover:text-goi-gold-dim"
                  >
                    Instagram
                  </a>
                ) : null}
                {profile.stravaUrl ? (
                  <a
                    href={parseStravaProfileUrl(profile.stravaUrl) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-neutral-600/70 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-neutral-200 backdrop-blur-sm transition hover:border-goi-gold/45 hover:text-goi-gold light:border-zinc-300 light:bg-white/90 light:text-zinc-800 light:hover:border-amber-400/60 healthy:hover:border-goi-gold/34 light:hover:text-amber-900 healthy:hover:text-goi-gold-dim"
                  >
                    Strava
                  </a>
                ) : null}
              </div>
            ) : null}
            <p className="mt-3 text-[11px] text-neutral-500 light:text-zinc-500">
              <span className="font-medium tabular-nums text-neutral-400 light:text-zinc-700">{posts.length}</span>{" "}
              publicación{posts.length === 1 ? "" : "es"} visible{posts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </header>

      <div className={scrollAreaClass}>
        {error ? (
          <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 light:border-red-300 light:bg-red-50 light:text-red-900">
            {error}
          </p>
        ) : null}

        {loading && !profile ? (
          <div className="space-y-3" aria-busy="true" aria-label="Cargando publicaciones">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-3.5 light:border-zinc-200 light:bg-zinc-100"
              >
                <div className="h-2.5 w-16 rounded-full bg-neutral-700/80 light:bg-zinc-300" />
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded bg-neutral-700/60 light:bg-zinc-300" />
                  <div className="h-2 w-[92%] rounded bg-neutral-700/40 light:bg-zinc-200" />
                  <div className="h-2 w-[80%] rounded bg-neutral-700/40 light:bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showRestricted ? (
          <div className="rounded-xl border border-goi-gold/25 bg-gradient-to-br from-goi-gold/[0.08] to-transparent px-4 py-3.5 text-sm leading-relaxed text-neutral-300 light:border-amber-300 healthy:border-goi-gold/26 light:from-amber-50/90 light:to-white light:text-zinc-800">
            <p className="m-0 font-medium text-goi-gold/95 light:text-amber-900 healthy:text-goi-gold-dim">Perfil limitado</p>
            <p className="mt-2 mb-0 text-neutral-400 light:text-zinc-600">
              Esta cuenta solo muestra la información completa a quien la sigue. Pulsa{" "}
              <strong className="text-neutral-200 light:text-zinc-900">Seguir</strong> para ver bio, enlaces y publicaciones
              permitidas.
            </p>
          </div>
        ) : null}

        {!loading && !error && !showRestricted && posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-700/80 bg-neutral-900/30 px-4 py-8 text-center light:border-zinc-300 light:bg-zinc-50">
            <p className="m-0 text-sm font-medium text-neutral-400 light:text-zinc-600">Sin publicaciones visibles</p>
            <p className="mt-1.5 text-xs text-neutral-600 light:text-zinc-500">
              No hay entradas que puedas ver con tu cuenta.
            </p>
          </div>
        ) : null}

        {!showRestricted && orderedPosts.length > 0 ? (
          <ul className="mt-1 grid list-none gap-3 p-0">
            {orderedPosts.map((p) => {
              const vis = p.visibility ?? "public";
              const isPinned = profile?.pinnedPostId === p.id;
              const hasMedia = (p.media?.length ?? 0) > 0;
              const dateLabel = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <li
                  key={p.id}
                  className={[
                    "relative overflow-hidden rounded-xl border px-3.5 py-3 transition duration-200",
                    isPinned
                      ? "border-goi-gold/45 bg-gradient-to-br from-goi-gold/[0.09] via-neutral-900/50 to-neutral-950/80 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.12)] light:border-amber-400/45 healthy:border-goi-gold/32 light:from-amber-50/95 light:via-white light:to-zinc-50 healthy:shadow-[inset_0_1px_0_0_rgba(95,116,107,0.1)]"
                      : "border-neutral-800/75 bg-neutral-900/35 hover:border-neutral-600/70 hover:bg-neutral-900/55 light:border-zinc-200 light:bg-zinc-50/90 light:hover:border-zinc-300 light:hover:bg-white",
                  ].join(" ")}
                >
                  {isPinned ? (
                    <div
                      className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-goi-gold via-goi-gold-dim to-goi-gold/70 light:from-amber-500 healthy:from-goi-gold light:via-amber-600 healthy:via-goi-gold-dim light:to-amber-500 healthy:to-goi-gold-dim"
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 pl-0.5">
                    {isPinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-goi-gold/35 bg-goi-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-goi-gold light:border-amber-400/50 light:bg-amber-100 healthy:bg-goi-gold/[0.11] light:text-amber-950 healthy:text-goi-gold-dim">
                        Destacada
                      </span>
                    ) : null}
                    <span
                      className={[
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        visibilityPillClasses(vis),
                      ].join(" ")}
                    >
                      {visibilityLabelShort(vis)}
                    </span>
                    {hasMedia ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-neutral-500 light:text-zinc-500">
                        <svg viewBox="0 0 24 24" fill="none" className="size-3.5 shrink-0 opacity-80" aria-hidden>
                          <path
                            d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="m9 11 2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Fotos
                      </span>
                    ) : null}
                    {dateLabel ? (
                      <span className="ml-auto text-[10px] tabular-nums text-neutral-600 light:text-zinc-500">{dateLabel}</span>
                    ) : null}
                  </div>
                  {p.content.trim() ? (
                    <p className="mt-2.5 line-clamp-5 text-sm leading-relaxed text-neutral-200 light:text-zinc-900">{p.content}</p>
                  ) : hasMedia ? (
                    <p className="mt-2.5 text-sm italic text-neutral-500 light:text-zinc-500">Publicación con imágenes</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {postsNextCursor ? (
          <div ref={postsLoadMoreSentinelRef} className="h-10 w-full shrink-0" aria-hidden />
        ) : null}
        {postsLoadingMore ? (
          <p className="mt-2 text-center text-[11px] text-neutral-500 light:text-zinc-500">Cargando más…</p>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-neutral-800/90 bg-linear-to-t from-zinc-950 to-zinc-950/98 px-4 py-4 shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.65)] light:border-zinc-200 light:from-white light:to-zinc-50 light:shadow-[0_-8px_30px_-12px_rgba(24,24,27,0.08)]">
        <div className="mx-auto flex max-w-lg items-stretch gap-3">
          {variant === "modal" && onGoToFullProfile ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="!min-h-12 flex-1 !rounded-xl !border-neutral-600 !bg-neutral-800/90 !py-3 !text-sm font-semibold !text-neutral-100 hover:!border-neutral-500 hover:!bg-neutral-700 light:!border-zinc-300 light:!bg-white light:!text-zinc-900 light:hover:!bg-zinc-50"
                onClick={onGoToFullProfile}
              >
                Ver perfil
              </Button>
              <Button
                type="button"
                variant={following ? "secondary" : "primary"}
                className={[
                  "!min-h-12 flex-[1.08] !rounded-xl !py-3 !text-sm font-semibold shadow-md",
                  following
                    ? "!border-goi-gold/45 !bg-goi-gold/10 !text-goi-gold hover:!border-goi-gold/65 hover:!bg-goi-gold/18 light:!border-amber-400/55 light:!bg-amber-50 light:!text-amber-950 light:hover:!bg-amber-100/90"
                    : "!shadow-goi-gold/20 light:!shadow-amber-900/15",
                ].join(" ")}
                disabled={followBusy}
                onClick={() => void handleToggleFollow()}
              >
                {followBusy ? "Guardando…" : following ? "Dejar de seguir" : "Seguir"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant={following ? "secondary" : "primary"}
              className={[
                "!min-h-12 w-full !rounded-xl !py-3 !text-sm font-semibold shadow-md sm:flex-1",
                following
                  ? "!border-goi-gold/45 !bg-goi-gold/10 !text-goi-gold hover:!border-goi-gold/65 hover:!bg-goi-gold/18 light:!border-amber-400/55 light:!bg-amber-50 light:!text-amber-950 light:hover:!bg-amber-100/90"
                  : "!shadow-goi-gold/20 light:!shadow-amber-900/15",
              ].join(" ")}
              disabled={followBusy}
              onClick={() => void handleToggleFollow()}
            >
              {followBusy ? "Guardando…" : following ? "Dejar de seguir" : "Seguir"}
            </Button>
          )}
        </div>
        <p className="mt-2.5 text-center text-[10px] text-neutral-600 light:text-zinc-500">
          {following ? "Pulsa para dejar de seguir a esta cuenta." : "Verás sus publicaciones permitidas en tu Inicio."}
        </p>
      </footer>
    </section>
  );
}
