import { useEffect, useMemo, useRef, useState } from "react";
import type { FeedStoryAuthor } from "../../types/story";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { Avatar } from "../ui/Avatar";

type StoriesRowProps = {
  authors: FeedStoryAuthor[];
  currentUserId: string;
  /** Fuerza relectura del mapa «vistas» tras cerrar el visor. */
  seenRevision: number;
  onSelectAuthor: (userId: string) => void;
};

export function StoriesRow({ authors, currentUserId, seenRevision, onSelectAuthor }: StoriesRowProps) {
  const seenMap = useMemo(() => loadStorySeenMap(), [seenRevision]);
  const stripRef = useRef<HTMLDivElement>(null);
  const [showScrollNext, setShowScrollNext] = useState(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const update = () => {
      setShowScrollNext(el.scrollWidth > el.clientWidth + 2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [authors.length, seenRevision]);

  if (authors.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-700/55 bg-black/15 px-4 py-6 text-center text-xs leading-relaxed text-neutral-500 light:border-zinc-300/90 light:bg-zinc-50/80 light:text-zinc-600">
        <span className="block font-semibold text-neutral-300 light:text-zinc-800">Publica tu primera historia</span>
        <span className="mt-2 block text-neutral-500 light:text-zinc-600">
          Aparecerá aquí; las personas que sigues podrán ver la suya en esta tira.
        </span>
      </p>
    );
  }

  return (
    <div className="relative min-h-[5.75rem] w-full">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-9 bg-linear-to-l from-neutral-950 via-neutral-950/55 to-transparent light:from-white light:via-white/75 light:to-transparent sm:w-11"
        aria-hidden
      />
      <div className="flex w-full justify-start">
        <div
          ref={stripRef}
          className="flex min-h-[5.75rem] w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 pt-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
          role="list"
          aria-label="Historias de usuarios"
        >
          {authors.map((author) => {
            const isSelf = author.userId === currentUserId;
            const hasSlides = author.slides.length > 0;
            const isNewStorySlot = isSelf && !hasSlides;
            const unseen = hasUnseenStories(author.userId, author.slides, seenMap[author.userId]);

            const ringClass = isNewStorySlot
              ? "border-2 border-dashed border-goi-gold/65 bg-neutral-950/35 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.12)] transition-[border-color,box-shadow] duration-200 group-hover:border-goi-gold group-hover:shadow-[inset_0_0_12px_rgba(212,175,55,0.15)] light:border-goi-gold/60 light:bg-white light:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] light:group-hover:border-goi-gold light:group-hover:shadow-[inset_0_0_14px_rgba(0,0,0,0.06)]"
              : hasSlides
                ? unseen
                  ? "border border-goi-gold shadow-[0_0_12px_-6px_rgba(212,175,55,0.42)]"
                  : "border border-neutral-500/90 shadow-none light:border-zinc-400"
                : "border border-dashed border-neutral-500";

            const label = isSelf ? (hasSlides ? "Tu historia" : "Nueva historia") : author.authorUsername;
            const a11y =
              isNewStorySlot
                ? "Crear nueva historia"
                : hasSlides
                  ? `Ver historia de ${author.authorUsername}`
                  : `Historia de ${author.authorUsername}`;

            return (
              <button
                key={`story-author-${author.userId}`}
                type="button"
                role="listitem"
                aria-label={a11y}
                onClick={() => onSelectAuthor(author.userId)}
                className={[
                  "story-strip-cell group grid min-h-[44px] min-w-[58px] shrink-0 snap-start place-items-center gap-1.5 px-1.5 py-2 text-center transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35 sm:min-w-[68px]",
                  isNewStorySlot
                    ? "rounded-2xl border border-goi-gold/35 bg-linear-to-b from-goi-gold/[0.22] via-goi-gold/[0.09] to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-goi-gold/55 hover:from-goi-gold/[0.28] hover:via-goi-gold/[0.12] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] light:border-goi-gold/40 light:bg-linear-to-b light:from-goi-gold/[0.18] light:via-goi-gold/[0.08] light:to-white light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] light:hover:border-goi-gold/55 light:hover:from-goi-gold/[0.24] light:hover:via-goi-gold/[0.11] light:hover:to-zinc-50/90"
                    : "rounded-xl hover:bg-neutral-900/25 light:hover:bg-zinc-200/45",
                ].join(" ")}
              >
                <div className="relative mx-auto w-fit">
                  <div className={`rounded-full p-[2px] transition-shadow duration-300 ${ringClass}`}>
                    <Avatar
                      src={author.authorAvatarUrl}
                      alt=""
                      size={36}
                      className={isNewStorySlot ? "opacity-[0.92]" : undefined}
                    />
                  </div>
                  {isNewStorySlot ? (
                    <span
                      aria-hidden
                      className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-neutral-950 bg-goi-gold text-[15px] font-semibold leading-none text-black shadow-[0_3px_12px_rgba(0,0,0,0.45)] ring-2 ring-goi-gold/45 light:border-white light:text-neutral-950 light:ring-goi-gold/50 healthy:text-white healthy:ring-[#1a2e22]/35"
                    >
                      +
                    </span>
                  ) : null}
                </div>
                <small
                  className={[
                    "max-w-[4.75rem] truncate text-center text-[11px] leading-tight tracking-wide sm:max-w-[6.25rem]",
                    isNewStorySlot
                      ? "font-semibold text-goi-gold light:text-goi-gold"
                      : isSelf
                        ? "font-medium text-neutral-200 light:text-zinc-900"
                        : "text-neutral-300 light:text-zinc-800",
                  ].join(" ")}
                  title={!isSelf ? `@${author.authorUsername}` : undefined}
                >
                  {label}
                </small>
              </button>
            );
          })}
        </div>
      </div>
      {showScrollNext ? (
        <button
          type="button"
          className="absolute right-0 top-1/2 z-[2] inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-600/55 bg-neutral-950/90 text-lg leading-none text-neutral-200 shadow-md backdrop-blur-sm transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 light:border-zinc-300 light:bg-white/95 light:text-zinc-800 light:hover:bg-zinc-50"
          aria-label="Ver más historias"
          title="Siguientes historias"
          onClick={() =>
            stripRef.current?.scrollBy({
              left: Math.min(280, (stripRef.current?.clientWidth ?? 280) * 0.85),
              behavior: "smooth",
            })
          }
        >
          <span aria-hidden className="translate-x-[1px]">
            ›
          </span>
        </button>
      ) : null}
    </div>
  );
}
