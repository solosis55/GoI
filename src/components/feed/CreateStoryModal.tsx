import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createStory } from "../../api/storiesApi";
import { getErrorMessage } from "../../utils/errorMessages";
import { compressManyStorySlides, STORY_UI_CREATE_MAX_SLIDES } from "../../utils/postImages";
import { Button } from "../ui/Button";
import { SquareImageCropEditor } from "./SquareImageCropEditor";

function ModalCloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PhotoStackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="6.5"
        y="6.5"
        width="15"
        height="15"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </svg>
  );
}

type DraftSlide = { id: string; dataUrl: string; name: string };

type CreateStoryModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateStoryModal({ open, onClose, onCreated }: CreateStoryModalProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<DraftSlide | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [dropHighlight, setDropHighlight] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetAndClose = useCallback(() => {
    setDraft(null);
    setCropOpen(false);
    setErr("");
    setDropHighlight(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        resetAndClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resetAndClose]);

  const handleAdd = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    setErr("");
    setBusy(true);
    try {
      const compressed = await compressManyStorySlides(files, 0);
      const picked = compressed.slice(0, STORY_UI_CREATE_MAX_SLIDES)[0];
      if (!picked) {
        setErr("Selecciona una imagen JPG, PNG o WebP.");
        return;
      }
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setDraft({ id, dataUrl: picked.dataUrl, name: picked.name });
      setCropOpen(true);
    } catch {
      setErr("No se pudo procesar la imagen. Prueba JPG, PNG o WebP.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onDropFiles = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropHighlight(false);
      void handleAdd(e.dataTransfer.files);
    },
    [handleAdd],
  );

  const onDragOverZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes("Files")) return;
    setDropHighlight(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      setErr("Añade una foto.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await createStory([{ type: "image", url: draft.dataUrl }]);
      setDraft(null);
      setCropOpen(false);
      onCreated();
      onClose();
    } catch (e) {
      setErr(getErrorMessage(e, "No se pudo publicar la historia"));
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const cardWide = Boolean(draft && cropOpen);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px] sm:p-6 light:bg-zinc-900/40"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        className={[
          "flex max-h-[min(92vh,880px)] min-h-0 w-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-zinc-950 shadow-2xl light:border-zinc-200 light:bg-white",
          cardWide ? "max-w-4xl" : "max-w-lg",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full shrink-0 bg-linear-to-r from-goi-gold-dim via-goi-gold to-goi-gold-dim" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4 p-4 sm:gap-5 sm:p-5">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0 pr-2">
                <h2
                  id={titleId}
                  className="text-lg font-semibold tracking-tight text-neutral-50 sm:text-xl light:text-zinc-900"
                >
                  Nueva historia
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 light:text-zinc-600">
                  Una foto por ahora · caduca en ~24 h · visible para quien te sigue en la tira del inicio.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45 light:text-zinc-600 light:hover:bg-zinc-100"
                onClick={resetAndClose}
                aria-label="Cerrar"
              >
                <ModalCloseIcon className="size-6" />
              </button>
            </header>

            <form
              className={[
                "grid gap-4",
                draft && cropOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]" : "",
              ].join(" ")}
              onSubmit={(e) => void handleSubmit(e)}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  void handleAdd(event.target.files);
                  event.target.value = "";
                }}
              />

              <div className="min-w-0 space-y-4">
                {!draft ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    onDragEnter={onDragOverZone}
                    onDragOver={onDragOverZone}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropHighlight(false);
                    }}
                    onDrop={onDropFiles}
                    className={[
                      "flex min-h-[10rem] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45",
                      dropHighlight
                        ? "border-goi-gold/70 bg-goi-gold/10 light:border-amber-500/70 healthy:border-goi-gold/42 light:bg-amber-50 healthy:bg-goi-gold/[0.08]"
                        : "border-neutral-600/70 bg-neutral-900/40 hover:border-goi-gold/45 hover:bg-goi-gold/[0.06] light:border-zinc-300 light:bg-zinc-50/80 light:hover:border-amber-400/55 healthy:hover:border-goi-gold/32",
                      busy ? "pointer-events-none opacity-70" : "",
                    ].join(" ")}
                  >
                    <PhotoStackIcon className="size-11 text-goi-gold/85 light:text-amber-700 healthy:text-goi-gold" />
                    <span className="text-sm font-medium text-neutral-200 light:text-zinc-800">
                      Arrastra una foto o elige desde tu dispositivo
                    </span>
                    <span className="max-w-[18rem] text-[11px] leading-relaxed text-neutral-500 light:text-zinc-600">
                      Podrás recortar y aplicar el mismo estilo que en las publicaciones antes de publicar.
                    </span>
                    {busy ? (
                      <span className="text-xs font-medium text-goi-gold light:text-amber-800 healthy:text-goi-gold-dim">Procesando…</span>
                    ) : null}
                  </button>
                ) : (
                  <div className="space-y-3 rounded-xl border border-neutral-800/90 bg-black/20 p-3 light:border-zinc-200 light:bg-zinc-50">
                    <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-xl ring-1 ring-white/12 light:ring-zinc-300/90">
                      <img src={draft.dataUrl} alt="" className="size-full object-cover" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="!text-sm"
                        disabled={busy}
                        onClick={() => setCropOpen(true)}
                      >
                        Editar imagen (1:1)
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="!text-sm"
                        disabled={busy}
                        onClick={() => fileRef.current?.click()}
                      >
                        Cambiar foto
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="!text-sm"
                        disabled={busy}
                        onClick={() => {
                          setDraft(null);
                          setCropOpen(false);
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                )}

                {err ? (
                  <p className="rounded-lg border border-red-500/35 bg-red-950/40 px-3 py-2 text-sm text-red-300 light:border-red-300/50 light:bg-red-50 light:text-red-800">
                    {err}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 border-t border-neutral-800/80 pt-4 light:border-zinc-200">
                  <Button type="submit" variant="primary" disabled={busy || !draft} className="min-h-11 px-6">
                    Publicar historia
                  </Button>
                  <Button type="button" variant="secondary" disabled={busy} onClick={resetAndClose}>
                    Cancelar
                  </Button>
                </div>
              </div>

              {draft && cropOpen ? (
                <SquareImageCropEditor
                  sourceUrl={draft.dataUrl}
                  sourceName={draft.name}
                  busy={busy}
                  onCancel={() => setCropOpen(false)}
                  onApply={async (croppedDataUrl) => {
                    setBusy(true);
                    try {
                      setDraft((current) => (current ? { ...current, dataUrl: croppedDataUrl } : current));
                      setCropOpen(false);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
