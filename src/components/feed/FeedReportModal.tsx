import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/Button";

const REASONS = [
  { id: "spam", label: "Spam o publicidad" },
  { id: "harassment", label: "Acoso o odio" },
  { id: "nsfw", label: "Contenido inapropiado" },
  { id: "other", label: "Otro" },
] as const;

type FeedReportModalProps = {
  open: boolean;
  authorUsername: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function FeedReportModal({ open, authorUsername, onClose, onSubmit }: FeedReportModalProps) {
  const titleId = useId();
  const [reasonId, setReasonId] = useState<(typeof REASONS)[number]["id"]>("spam");
  const [detail, setDetail] = useState("");

  if (!open) return null;

  function submit() {
    const label = REASONS.find((r) => r.id === reasonId)?.label ?? reasonId;
    const full = detail.trim() ? `${label}: ${detail.trim()}` : label;
    onSubmit(full);
    setDetail("");
    setReasonId("spam");
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-neutral-700 bg-zinc-950 p-4 shadow-2xl light:border-zinc-200 light:bg-white"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-neutral-100 light:text-zinc-900">
          Reportar publicación
        </h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Usuario: @{authorUsername}. El informe se guarda en este dispositivo como referencia hasta que exista moderación en servidor.
        </p>
        <div className="mt-3 grid gap-2">
          <label className="text-xs font-medium text-neutral-400 light:text-zinc-600">Motivo</label>
          <select
            className="goi-field text-sm"
            value={reasonId}
            onChange={(e) => setReasonId(e.target.value as (typeof REASONS)[number]["id"])}
          >
            {REASONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <label className="mt-2 text-xs font-medium text-neutral-400 light:text-zinc-600">
            Detalle (opcional)
          </label>
          <textarea
            className="goi-field min-h-[72px] text-sm"
            maxLength={400}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Contexto breve…"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={submit}>
            Enviar informe
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
