import { useEffect } from "react";
import { createPortal } from "react-dom";

type PostMediaLightboxProps = {
  open: boolean;
  urls: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

export function PostMediaLightbox({ open, urls, index, onClose, onIndexChange }: PostMediaLightboxProps) {
  const safeIndex = urls.length ? Math.min(Math.max(0, index), urls.length - 1) : 0;
  const url = urls[safeIndex] ?? "";

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowLeft" && urls.length > 1) {
        e.preventDefault();
        onIndexChange(safeIndex <= 0 ? urls.length - 1 : safeIndex - 1);
      }
      if (e.key === "ArrowRight" && urls.length > 1) {
        e.preventDefault();
        onIndexChange(safeIndex >= urls.length - 1 ? 0 : safeIndex + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onIndexChange, safeIndex, urls.length]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/92 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada de la imagen"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 pb-2" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-neutral-400">
          {urls.length > 1 ? `${safeIndex + 1} / ${urls.length}` : ""}
        </span>
        <button
          type="button"
          className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/50"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {urls.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              className="absolute left-1 top-1/2 z-[1] -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/50 sm:left-2"
              onClick={() => onIndexChange(safeIndex <= 0 ? urls.length - 1 : safeIndex - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              className="absolute right-1 top-1/2 z-[1] -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/50 sm:right-2"
              onClick={() => onIndexChange(safeIndex >= urls.length - 1 ? 0 : safeIndex + 1)}
            >
              ›
            </button>
          </>
        ) : null}

        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- imagen ampliada */}
        <img
          src={url}
          alt=""
          className="max-h-[min(88vh,1200px)] max-w-full touch-manipulation object-contain"
        />
      </div>
    </div>,
    document.body,
  );
}
