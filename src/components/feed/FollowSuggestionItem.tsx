import type { DiscoverUser } from "../../types/auth";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

type FollowSuggestionItemProps = {
  user: DiscoverUser;
  isFollowing: boolean;
  onToggleFollow: (targetUserId: string) => void;
  onViewProfile?: (userId: string) => void;
};

export function FollowSuggestionItem({ user, isFollowing, onToggleFollow, onViewProfile }: FollowSuggestionItemProps) {
  return (
    <li className="rounded-xl border border-transparent transition-colors hover:border-neutral-800/60 hover:bg-neutral-900/20 light:hover:border-zinc-200 light:hover:bg-zinc-100/80">
      <div className="flex items-center gap-2 px-1 py-1.5 sm:gap-2.5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
          onClick={() => onViewProfile?.(user.id)}
          aria-label={`Ver perfil de @${user.username}`}
        >
          <Avatar src={user.avatarUrl} alt="" size={36} className="shrink-0" />
          <span className="min-w-0 truncate text-sm font-medium text-goi-steel light:text-zinc-800">@{user.username}</span>
        </button>
        <Button
          type="button"
          variant="secondary"
          className="!shrink-0 !px-2.5 !py-1.5 !text-xs !font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFollow(user.id);
          }}
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </Button>
      </div>
    </li>
  );
}
