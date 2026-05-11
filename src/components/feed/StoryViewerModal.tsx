import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { FeedStoryAuthor, FeedStorySlide } from "../../types/story";
import { markStoryAuthorSeen } from "../../utils/storySeen";
import { Avatar } from "../ui/Avatar";

const AUTO_ADVANCE_MS = 5600;

function StoryCloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

type StoryViewerModalProps = {
  open: boolean;
  authors: FeedStoryAuthor[];
  startAuthorIdx: number;
  startSlideIdx: number;
  onClose: () => void;
  onStoriesUiRefresh: () => void;
};

export function StoryViewerModal({
  open,
  authors,
  startAuthorIdx,
  startSlideIdx,
  onClose,
  onStoriesUiRefresh,
}: StoryViewerModalProps) {
  const [authorIdx, setAuthorIdx] = useState(startAuthorIdx);
  const [slideIdx, setSlideIdx] = useState(startSlideIdx);
  const [holdPaused, setHoldPaused] = useState(false);
  const [resumeTick, setResumeTick] = useState(0);
  const centerHoldRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setAuthorIdx(startAuthorIdx);
    setSlideIdx(startSlideIdx);
    setHoldPaused(false);
    centerHoldRef.current = false;
    setResumeTick(0);
  }, [open, startAuthorIdx, startSlideIdx]);

  useEffect(() => {
    setHoldPaused(false);
    centerHoldRef.current = false;
    setResumeTick(0);
  }, [slideIdx, authorIdx]);

  const author: FeedStoryAuthor | undefined = authors[authorIdx];
  const slides: FeedStorySlide[] = author?.slides ?? [];
  const slide = slides[slideIdx];

  const finishCurrentAuthor = useCallback(() => {
    if (author && author.slides.length) {
      markStoryAuthorSeen(author.userId, author.slides);
      onStoriesUiRefresh();
    }
  }, [author, onStoriesUiRefresh]);

  const advance = useCallback(() => {
    if (!author) {
      onClose();
      return;
    }
    if (slideIdx >= slides.length - 1) {
      finishCurrentAuthor();
      const nextAuthor = authorIdx + 1;
      if (nextAuthor >= authors.length) {
        onClose();
        return;
      }
      setAuthorIdx(nextAuthor);
      setSlideIdx(0);
      return;
    }
    setSlideIdx((s) => s + 1);
  }, [
    author,
    authorIdx,
    authors.length,
    finishCurrentAuthor,
    onClose,
    slideIdx,
    slides.length,
  ]);

  const rewind = useCallback(() => {
    if (slideIdx > 0) {
      setSlideIdx((s) => s - 1);
      return;
    }
    if (authorIdx > 0) {
      const prevAuthor = authors[authorIdx - 1];
      setAuthorIdx(authorIdx - 1);
      setSlideIdx(Math.max(0, prevAuthor.slides.length - 1));
    }
  }, [authorIdx, authors, slideIdx]);

  useEffect(() => {
    if (!open || !author || slides.length === 0 || !slide || holdPaused) return;
    const t = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [open, author, slides.length, slide, slideIdx, authorIdx, advance, holdPaused, resumeTick]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleClose = useCallback(() => {
    if (author && slides.length > 0 && slideIdx >= slides.length - 1) {
      finishCurrentAuthor();
    }
    onClose();
  }, [author, finishCurrentAuthor, onClose, slideIdx, slides.length]);

  useEffect(() => {
    if (!open) return;
    function key(ev: KeyboardEvent) {
      if (ev.key === "Escape") handleClose();
      if (ev.key === "ArrowRight") advance();
      if (ev.key === "ArrowLeft") rewind();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, handleClose, advance, rewind]);

  if (!open) return null;

  const segStyle = { "--story-segment-ms": `${AUTO_ADVANCE_MS}ms` } as CSSProperties;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal aria-label="Historias">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-black px-2 py-1.5 sm:gap-3 sm:px-3">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          onClick={handleClose}
          aria-label="Cerrar historias"
        >
          <StoryCloseIcon className="size-6" />
        </button>
        {author ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar src={author.authorAvatarUrl} alt={author.authorUsername} size={32} />
            <span className="truncate text-xs font-semibold tracking-tight text-white sm:text-[13px]">
              @{author.authorUsername}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-500">Sin historias</span>
        )}
      </div>

      <div className="flex shrink-0 gap-1.5 border-b border-white/[0.06] bg-black px-2.5 pb-1.5 pt-2 sm:gap-2 sm:px-3">
        {slides.map((seg, i) => (
          <div key={`${author?.userId ?? "u"}-${seg.id}`} className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-white/40">
            {i < slideIdx ? <div className="absolute inset-0 rounded-full bg-white" /> : null}
            {i === slideIdx ? (
              <div
                key={`${authorIdx}-${slideIdx}-${seg.id}-${resumeTick}`}
                className={`story-segment-fill absolute rounded-full bg-white ${holdPaused ? "story-segment-fill-paused" : ""}`}
                style={segStyle}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 touch-manipulation">
        {!author || !slide ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">Historia no disponible</div>
        ) : (
          <>
            <img
              src={slide.mediaUrl}
              alt=""
              className="relative z-0 h-full w-full object-cover sm:object-contain"
              draggable={false}
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[12] w-1/3 bg-linear-to-r from-black/45 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[12] w-1/3 bg-linear-to-l from-black/45 to-transparent"
              aria-hidden
            />
            <button
              type="button"
              aria-label="Anterior"
              className="absolute inset-y-0 left-0 z-20 w-1/3 cursor-w-resize bg-transparent"
              onClick={rewind}
            />
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute inset-y-0 right-0 z-20 w-1/3 cursor-e-resize bg-transparent"
              onClick={advance}
            />
            <div
              role="presentation"
              className="absolute inset-y-0 left-1/3 z-[15] w-1/3"
              style={{ touchAction: "manipulation" }}
              onPointerDown={() => {
                centerHoldRef.current = true;
                setHoldPaused(true);
              }}
              onPointerUp={() => {
                if (centerHoldRef.current) {
                  centerHoldRef.current = false;
                  setHoldPaused(false);
                  setResumeTick((t) => t + 1);
                }
              }}
              onPointerCancel={() => {
                if (centerHoldRef.current) {
                  centerHoldRef.current = false;
                  setHoldPaused(false);
                  setResumeTick((t) => t + 1);
                }
              }}
              onPointerLeave={(e) => {
                if (e.buttons === 0 && centerHoldRef.current) {
                  centerHoldRef.current = false;
                  setHoldPaused(false);
                  setResumeTick((t) => t + 1);
                }
              }}
            />
          </>
        )}
      </div>

      {author && slide ? (
        <p className="pointer-events-none shrink-0 bg-black px-3 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 text-center text-[10px] leading-snug text-white/35">
          Centro: mantén pulsado para pausar · Laterales: anterior / siguiente
        </p>
      ) : null}
    </div>
  );
}
