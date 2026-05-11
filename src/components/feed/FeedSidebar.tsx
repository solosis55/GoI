import { useId, useState } from "react";
import type { DiscoverUser } from "../../types/auth";
import type { MusclePentagonAxis } from "../../utils/musclePentagonStats";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { MusclePentagonRadar } from "./MusclePentagonRadar";
import { FollowSuggestionItem } from "./FollowSuggestionItem";
import { UserSummaryCard } from "./UserSummaryCard";

/** Paneles del carrusel bajo «Tu cuenta». */
export type FeedSidebarPanel = "suggestions" | "workouts" | "social";

const PANEL_ORDER: FeedSidebarPanel[] = ["suggestions", "workouts", "social"];

const PANEL_LABEL: Record<FeedSidebarPanel, string> = {
  suggestions: "Sugerencias",
  workouts: "Estadísticas",
  /** Publicaciones, siguiendo y seguidores. */
  social: "Comunidad",
};

type FeedSidebarProps = {
  username?: string;
  avatarUrl?: string;
  myPostsCount: number;
  followingCount: number;
  followersCount: number;
  /** Sesiones de entreno registradas (historial). */
  workoutTotalSessions: number;
  workoutSessionsThisWeek: number;
  /** Rutinas propias (plantillas). */
  workoutRoutinesCreated: number;
  muscleHits: Record<MusclePentagonAxis, number>;
  suggestedUsers: DiscoverUser[];
  followingIds: string[];
  onToggleFollow: (targetUserId: string) => void;
  onViewProfile: (userId: string) => void;
  /** Abre el perfil propio (modal o ruta). */
  onGoToProfile?: () => void;
  panel: FeedSidebarPanel;
  onPanelChange: (panel: FeedSidebarPanel) => void;
  className?: string;
};

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

function FeedSidebarWorkoutStats({
  totalSessions,
  sessionsThisWeek,
  routinesCreated,
  muscleHits,
}: {
  totalSessions: number;
  sessionsThisWeek: number;
  routinesCreated: number;
  muscleHits: Record<MusclePentagonAxis, number>;
}) {
  const [expanded, setExpanded] = useState(false);
  const row =
    "flex items-center justify-between gap-3 border-b border-neutral-800/45 py-2.5 text-sm last:border-b-0 light:border-zinc-200/90";

  return (
    <div className="mt-3 space-y-2">
      <div className="rounded-xl border border-neutral-800/60 bg-black/20 px-3 py-1 light:border-zinc-200 light:bg-zinc-50/90">
        <p className="mb-1 text-xs leading-snug text-neutral-500 light:text-zinc-600">
          Datos de tus sesiones registradas y rutinas (pestaña Rutinas).
        </p>
        <dl>
          <div className={row}>
            <dt className="text-neutral-400 light:text-zinc-600">Entrenamientos totales</dt>
            <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{totalSessions}</dd>
          </div>
          <div className={row}>
            <dt className="text-neutral-400 light:text-zinc-600">Rutinas creadas</dt>
            <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{routinesCreated}</dd>
          </div>
          <div className={row}>
            <dt className="text-neutral-400 light:text-zinc-600">Entrenamientos esta semana</dt>
            <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{sessionsThisWeek}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        className="w-full rounded-lg py-2 text-center text-xs font-semibold uppercase tracking-wide text-goi-gold transition hover:text-goi-gold-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35 light:text-amber-800 light:hover:text-amber-950"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Ver menos" : "Ver más"}
      </button>

      {expanded ? (
        <div className="rounded-xl border border-neutral-800/55 bg-black/15 px-2 py-5 light:border-zinc-200 light:bg-white/95">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-goi-gold-dim">
            Grupos musculares (sesiones)
          </p>
          <MusclePentagonRadar hits={muscleHits} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

function FeedSidebarSocialStats({
  myPostsCount,
  followingCount,
  followersCount,
}: {
  myPostsCount: number;
  followingCount: number;
  followersCount: number;
}) {
  const row =
    "flex items-center justify-between gap-3 border-b border-neutral-800/45 py-2.5 text-sm last:border-b-0 light:border-zinc-200/90";
  return (
    <div className="mt-3 rounded-xl border border-neutral-800/60 bg-black/20 px-3 py-1 light:border-zinc-200 light:bg-zinc-50/90">
      <p className="mb-1 text-xs leading-snug text-neutral-500 light:text-zinc-600">
        Tu presencia en el feed y las relaciones que llevas aquí.
      </p>
      <dl>
        <div className={row}>
          <dt className="text-neutral-400 light:text-zinc-600">Publicaciones</dt>
          <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{myPostsCount}</dd>
        </div>
        <div className={row}>
          <dt className="text-neutral-400 light:text-zinc-600">Siguiendo</dt>
          <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{followingCount}</dd>
        </div>
        <div className={row}>
          <dt className="text-neutral-400 light:text-zinc-600">Te siguen</dt>
          <dd className="font-semibold tabular-nums text-neutral-100 light:text-zinc-900">{followersCount}</dd>
        </div>
      </dl>
    </div>
  );
}

export function FeedSidebar({
  username,
  avatarUrl,
  myPostsCount,
  followingCount,
  followersCount,
  workoutTotalSessions,
  workoutSessionsThisWeek,
  workoutRoutinesCreated,
  muscleHits,
  suggestedUsers,
  followingIds,
  onToggleFollow,
  onViewProfile,
  onGoToProfile,
  panel,
  onPanelChange,
  className,
}: FeedSidebarProps) {
  const headingId = useId();

  function cycle(delta: -1 | 1) {
    const idx = PANEL_ORDER.indexOf(panel);
    const next = (idx + delta + PANEL_ORDER.length) % PANEL_ORDER.length;
    onPanelChange(PANEL_ORDER[next] ?? "suggestions");
  }

  return (
    <Card
      as="aside"
      tone="dark"
      className={[
        "feed-right relative min-w-0 w-full overflow-hidden sticky top-4 max-lg:static !shadow-none border-neutral-800/55 light:border-zinc-200/85 light:shadow-[0_12px_36px_-24px_rgba(24,24,27,0.07)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[2px] bg-linear-to-r from-goi-gold/85 via-goi-gold/40 to-transparent light:from-amber-500/90 light:via-amber-400/45"
        aria-hidden
      />
      <section className="relative z-[1]" aria-labelledby="feed-sidebar-account-heading">
        <h3 id="feed-sidebar-account-heading" className="sr-only">
          Tu cuenta
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-goi-gold-dim">Tu cuenta</p>
        <UserSummaryCard
          username={username}
          avatarUrl={avatarUrl}
          myPostsCount={myPostsCount}
          onGoToProfile={onGoToProfile}
        />
      </section>

      <div
        className="my-5 h-px w-full bg-linear-to-r from-transparent via-neutral-700/90 to-transparent light:via-zinc-300/90"
        role="presentation"
      />

      <section className="relative z-[1]" aria-labelledby={headingId}>
        <h3 id={headingId} className="sr-only">
          {PANEL_LABEL[panel]}
        </h3>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700/80 bg-black/30 text-neutral-300 transition hover:border-goi-gold/45 hover:bg-neutral-900/80 hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 light:border-zinc-300 light:bg-white light:text-zinc-700 light:hover:border-amber-400/60 light:hover:bg-amber-50/90"
            aria-label="Vista anterior"
            onClick={() => cycle(-1)}
          >
            <ChevronIcon dir="left" />
          </button>
          <p
            className="min-w-0 flex-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-goi-gold-dim"
            aria-live="polite"
          >
            {PANEL_LABEL[panel]}
          </p>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700/80 bg-black/30 text-neutral-300 transition hover:border-goi-gold/45 hover:bg-neutral-900/80 hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 light:border-zinc-300 light:bg-white light:text-zinc-700 light:hover:border-amber-400/60 light:hover:bg-amber-50/90"
            aria-label="Vista siguiente"
            onClick={() => cycle(1)}
          >
            <ChevronIcon dir="right" />
          </button>
        </div>

        {panel === "suggestions" ? (
          <>
            <p className="mt-2 text-xs leading-snug text-neutral-500 light:text-zinc-600">
              Personas que podrías seguir; pulsa el nombre para ver el perfil.
            </p>
            {suggestedUsers.length === 0 && (
              <EmptyState
                showIcon
                message="Nadie nuevo por aquí todavía."
                className="mt-3 border-neutral-700/75 bg-black/25 py-6 light:border-zinc-300/90 light:bg-zinc-50/90"
              />
            )}
            {suggestedUsers.length === 0 ? (
              <p className="mt-2 text-center text-[11px] leading-relaxed text-neutral-500 light:text-zinc-600">
                Cambia el feed a «Todos» y participa para descubrir más cuentas.
              </p>
            ) : null}
            <ul className="suggestions-list mt-3 grid list-none gap-1 p-0">
              {suggestedUsers.map((suggested) => (
                <FollowSuggestionItem
                  key={suggested.id}
                  user={suggested}
                  isFollowing={followingIds.includes(suggested.id)}
                  onToggleFollow={onToggleFollow}
                  onViewProfile={onViewProfile}
                />
              ))}
            </ul>
          </>
        ) : panel === "workouts" ? (
          <FeedSidebarWorkoutStats
            totalSessions={workoutTotalSessions}
            sessionsThisWeek={workoutSessionsThisWeek}
            routinesCreated={workoutRoutinesCreated}
            muscleHits={muscleHits}
          />
        ) : (
          <FeedSidebarSocialStats
            myPostsCount={myPostsCount}
            followingCount={followingCount}
            followersCount={followersCount}
          />
        )}
      </section>
    </Card>
  );
}
