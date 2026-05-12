import type { Post } from "../../types/post";

function MultiPostIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16 3H5c-1.1 0-2 .9-2 2v11h2V5h11V3zm4 4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 14H9V9h11v12z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
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

export type ProfilePostsMosaicProps = {
  posts: Post[];
  selectedId: string | null;
  onSelect: (postId: string) => void;
  /**
   * `grid` — 3 columnas estilo Instagram (por defecto en perfiles).
   * `mosaic` — rejilla 6 columnas variante (compatibilidad).
   */
  layout?: "grid" | "mosaic";
  /** Post fijado en el perfil (icono chincheta). */
  pinnedPostId?: string | null;
};

export function ProfilePostsMosaic({
  posts,
  selectedId,
  onSelect,
  layout = "grid",
  pinnedPostId,
}: ProfilePostsMosaicProps) {
  const pinTrim = pinnedPostId?.trim() ?? "";

  const cellBase = [
    "group relative w-full min-w-0 overflow-hidden bg-neutral-900 outline-none transition-colors light:bg-zinc-100",
    "hover:brightness-110 light:hover:brightness-95",
  ].join(" ");

  if (layout === "grid") {
    return (
      <div className="w-full">
        <div
          className="grid grid-cols-3 gap-px bg-neutral-800 sm:gap-0.5 light:bg-zinc-300"
          role="list"
        >
          {posts.map((post) => {
            const url = postThumbnailUrl(post);
            const multi = (post.media?.length ?? 0) > 1;
            const selected = selectedId === post.id;
            const isPinned = Boolean(pinTrim && post.id === pinTrim);
            const preview = post.content.trim().slice(0, 80);
            const label =
              preview.length > 0 ? `Publicación: ${preview}${post.content.trim().length > 80 ? "…" : ""}` : "Publicación sin texto";

            return (
              <button
                key={post.id}
                type="button"
                role="listitem"
                onClick={() => onSelect(post.id)}
                className={[
                  cellBase,
                  "aspect-square",
                  selected ? "z-[1] ring-2 ring-inset ring-goi-gold light:ring-goi-gold" : "",
                ].join(" ")}
                aria-label={label}
                aria-pressed={selected}
              >
                {url ? (
                  <img src={url} alt="" className="size-full object-cover" loading="lazy" draggable={false} />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 light:text-zinc-600">
                      Solo texto
                    </span>
                    <span className="line-clamp-4 text-[10px] leading-snug text-neutral-400 light:text-zinc-700">
                      {post.content.trim() || "—"}
                    </span>
                  </div>
                )}
                {isPinned ? (
                  <span
                    className="absolute left-1 top-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    title="Destacada"
                    aria-hidden
                  >
                    <PinIcon className="size-4 text-white opacity-95" />
                  </span>
                ) : null}
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
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
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
