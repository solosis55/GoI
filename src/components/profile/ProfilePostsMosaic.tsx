import type { Post } from "../../types/post";

function MultiPostIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16 3H5c-1.1 0-2 .9-2 2v11h2V5h11V3zm4 4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 14H9V9h11v12z" />
    </svg>
  );
}

function postThumbnailUrl(post: Post): string | null {
  const img = post.media?.find((m) => m.type === "image");
  return img?.url ?? null;
}

function mosaicColSpan(index: number): "col-span-1" | "col-span-2" {
  return index % 9 < 6 ? "col-span-1" : "col-span-2";
}

type ProfilePostsMosaicProps = {
  posts: Post[];
  selectedId: string | null;
  onSelect: (postId: string) => void;
};

export function ProfilePostsMosaic({ posts, selectedId, onSelect }: ProfilePostsMosaicProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800/90 light:border-zinc-200">
      <div className="grid grid-cols-6 gap-0">
        {posts.map((post, index) => {
          const span = mosaicColSpan(index);
          const url = postThumbnailUrl(post);
          const multi = (post.media?.length ?? 0) > 1;
          const selected = selectedId === post.id;
          const preview = post.content.trim().slice(0, 80);
          const label =
            preview.length > 0 ? `Publicación: ${preview}${post.content.trim().length > 80 ? "…" : ""}` : "Publicación sin texto";

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => onSelect(post.id)}
              className={[
                "group relative aspect-[4/5] w-full min-w-0 overflow-hidden bg-neutral-900 outline-none transition-colors light:bg-zinc-200",
                span,
                selected ? "z-[1] ring-2 ring-inset ring-goi-gold light:ring-goi-gold" : "",
                !selected ? "hover:brightness-110 light:hover:brightness-95" : "",
              ].join(" ")}
              aria-label={label}
              aria-pressed={selected}
            >
              {url ? (
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 light:text-zinc-600">
                    Solo texto
                  </span>
                  <span className="line-clamp-6 text-[10px] leading-snug text-neutral-400 light:text-zinc-700">
                    {post.content.trim() || "—"}
                  </span>
                </div>
              )}
              {multi ? (
                <span
                  className="absolute right-1 top-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                  title="Varias fotos"
                  aria-hidden
                >
                  <MultiPostIcon className="size-4 text-white" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
