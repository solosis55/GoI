import { useEffect, useRef, useState } from "react";

type FeedPostOverflowMenuProps = {
  disabled?: boolean;
  isSaved: boolean;
  isOwner: boolean;
  authorUsername: string;
  onToggleSave: () => void;
  onMuteAuthor?: () => void;
  onReport?: () => void;
  /** Propias de la publicación (van dentro del menú, junto al like fuera). */
  onCopyLink?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  linkCopied?: boolean;
};

function MenuCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 13.5 9.5 18 19 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedPostOverflowMenu({
  disabled,
  isSaved,
  isOwner,
  authorUsername,
  onToggleSave,
  onMuteAuthor,
  onReport,
  onCopyLink,
  onEdit,
  onDelete,
  linkCopied = false,
}: FeedPostOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-neutral-700/90 bg-black/30 text-lg leading-none text-neutral-400 transition hover:border-goi-gold/45 hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35 disabled:opacity-40 light:border-zinc-300 light:bg-white light:text-zinc-600"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Más opciones de la publicación"
        onClick={() => setOpen((o) => !o)}
      >
        ···
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-lg border border-neutral-700/90 bg-neutral-950 py-1 shadow-xl light:border-zinc-200 light:bg-white"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/10 light:text-zinc-800 light:hover:bg-zinc-100"
            onClick={() => {
              onToggleSave();
              setOpen(false);
            }}
          >
            {isSaved ? "Quitar de guardados" : "Guardar publicación"}
          </button>
          {isOwner && onCopyLink ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/10 light:text-zinc-800 light:hover:bg-zinc-100"
              onClick={() => {
                onCopyLink();
              }}
            >
              {linkCopied ? (
                <>
                  <MenuCheckIcon className="size-3.5 shrink-0 text-goi-gold light:text-amber-600 healthy:text-goi-gold" />
                  Enlace copiado
                </>
              ) : (
                "Copiar enlace"
              )}
            </button>
          ) : null}
          {isOwner && onEdit ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/10 light:text-zinc-800 light:hover:bg-zinc-100"
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
            >
              Editar
            </button>
          ) : null}
          {isOwner && onDelete ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-950/35 light:text-red-700 light:hover:bg-red-50"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              Eliminar
            </button>
          ) : null}
          {!isOwner && onMuteAuthor ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/10 light:text-zinc-800 light:hover:bg-zinc-100"
              onClick={() => {
                onMuteAuthor();
                setOpen(false);
              }}
            >
              Silenciar @{authorUsername}
            </button>
          ) : null}
          {!isOwner && onReport ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-sm text-amber-200/95 hover:bg-white/10 light:text-amber-900 healthy:text-goi-gold-dim light:hover:bg-zinc-100"
              onClick={() => {
                onReport();
                setOpen(false);
              }}
            >
              Reportar contenido…
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
