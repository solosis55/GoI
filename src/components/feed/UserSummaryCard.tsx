import { Avatar } from "../ui/Avatar";

type UserSummaryCardProps = {
  username?: string;
  avatarUrl?: string;
  myPostsCount: number;
  onGoToProfile?: () => void;
};

export function UserSummaryCard({ username, avatarUrl, myPostsCount, onGoToProfile }: UserSummaryCardProps) {
  const handle = username?.trim();
  const showProfile = Boolean(handle && onGoToProfile);

  return (
    <div className="mt-3 flex gap-3">
      <div className="shrink-0 pt-0.5">
        <Avatar src={avatarUrl ?? ""} alt={handle ? `@${handle}` : ""} size={48} />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight text-neutral-100 light:text-zinc-900">
            {handle ? `@${handle}` : "Sesión activa"}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-neutral-700/90 bg-black/35 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-neutral-300 light:border-zinc-200 light:bg-zinc-100 light:text-zinc-700">
              {myPostsCount === 1 ? "1 publicación" : `${myPostsCount} publicaciones`}
            </span>
          </p>
        </div>
        {showProfile ? (
          <button
            type="button"
            onClick={onGoToProfile}
            className="inline-flex min-h-9 items-center rounded-lg border border-goi-gold/40 bg-goi-gold/[0.08] px-3 py-1.5 text-xs font-semibold text-goi-gold transition-colors hover:bg-goi-gold/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 light:border-goi-gold/45 healthy:border-goi-gold/36 light:bg-goi-gold/[0.1] healthy:bg-goi-gold/[0.08] light:text-goi-gold-dim healthy:text-goi-gold-dim light:hover:bg-goi-gold/[0.14] healthy:hover:bg-goi-gold/[0.12]"
          >
            Ir al perfil
          </button>
        ) : null}
      </div>
    </div>
  );
}
