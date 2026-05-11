import { useCallback, useEffect, useRef, useState } from "react";
import {
  cropDataUrlToSquare,
  type EditorFilterPreset,
} from "../../utils/postImages";

const FILTER_PRESETS: { id: EditorFilterPreset; label: string }[] = [
  { id: "none", label: "Original" },
  { id: "contrast", label: "Contraste" },
  { id: "warm", label: "Cálido" },
  { id: "bw", label: "B/N" },
];

type CropState = {
  sourceUrl: string;
  sourceName: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotateQuarterTurns: 0 | 1 | 2 | 3;
  flipHorizontal: boolean;
  filterPreset: EditorFilterPreset;
  previewUrl: string;
};

export type SquareImageCropEditorProps = {
  sourceUrl: string;
  sourceName: string;
  busy?: boolean;
  onCancel: () => void;
  onApply: (croppedDataUrl: string) => void | Promise<void>;
};

export function SquareImageCropEditor({
  sourceUrl,
  sourceName,
  busy = false,
  onCancel,
  onApply,
}: SquareImageCropEditorProps) {
  const [crop, setCrop] = useState<CropState>(() => ({
    sourceUrl,
    sourceName,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    rotateQuarterTurns: 0,
    flipHorizontal: false,
    filterPreset: "none",
    previewUrl: sourceUrl,
  }));

  const cropPreviewRequestIdRef = useRef(0);
  const cropDragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    sensitivity: number;
  } | null>(null);
  const cropPanActiveRef = useRef(false);
  const cropPanRafRef = useRef<number | null>(null);
  const cropPanPendingRef = useRef<{ ox: number; oy: number } | null>(null);
  const cropPinchStateRef = useRef<{ startDistance: number; startZoom: number } | null>(null);

  useEffect(() => {
    setCrop({
      sourceUrl,
      sourceName,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotateQuarterTurns: 0,
      flipHorizontal: false,
      filterPreset: "none",
      previewUrl: sourceUrl,
    });
  }, [sourceUrl, sourceName]);

  useEffect(() => {
    const requestId = ++cropPreviewRequestIdRef.current;
    let cancelled = false;
    void (async () => {
      try {
        const livePan = cropPanActiveRef.current;
        const preview = await cropDataUrlToSquare(crop.sourceUrl, {
          zoom: crop.zoom,
          offsetX: crop.offsetX,
          offsetY: crop.offsetY,
          rotateQuarterTurns: crop.rotateQuarterTurns,
          flipHorizontal: crop.flipHorizontal,
          filterPreset: crop.filterPreset,
          ...(livePan ? { previewMaxOutput: 420 } : {}),
        });
        if (cancelled || requestId !== cropPreviewRequestIdRef.current) return;
        setCrop((current) => ({ ...current, previewUrl: preview }));
      } catch {
        /* silence */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- evitar bucle al actualizar solo previewUrl
  }, [
    crop.sourceUrl,
    crop.zoom,
    crop.offsetX,
    crop.offsetY,
    crop.rotateQuarterTurns,
    crop.flipHorizontal,
    crop.filterPreset,
  ]);

  const flushCropPanOffsets = useCallback(() => {
    cropPanRafRef.current = null;
    const pending = cropPanPendingRef.current;
    cropPanPendingRef.current = null;
    if (!pending) return;
    setCrop((current) => ({ ...current, offsetX: pending.ox, offsetY: pending.oy }));
  }, []);

  const handleCropPreviewPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (busy || cropPinchStateRef.current) return;
    event.preventDefault();
    cropPanActiveRef.current = true;
    const w = event.currentTarget.getBoundingClientRect().width;
    const sensitivity = Math.max(120, w * 0.42);
    cropDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: crop.offsetX,
      baseY: crop.offsetY,
      sensitivity,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [busy, crop.offsetX, crop.offsetY]);

  const handleCropPreviewPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = cropDragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const nextX = Math.max(-1, Math.min(1, drag.baseX - deltaX / drag.sensitivity));
      const nextY = Math.max(-1, Math.min(1, drag.baseY - deltaY / drag.sensitivity));
      cropPanPendingRef.current = { ox: nextX, oy: nextY };
      if (cropPanRafRef.current == null) {
        cropPanRafRef.current = requestAnimationFrame(flushCropPanOffsets);
      }
    },
    [flushCropPanOffsets],
  );

  const handleCropPreviewPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    cropPanActiveRef.current = false;
    if (cropPanRafRef.current != null) {
      cancelAnimationFrame(cropPanRafRef.current);
      cropPanRafRef.current = null;
    }
    if (cropPanPendingRef.current) {
      const p = cropPanPendingRef.current;
      cropPanPendingRef.current = null;
      setCrop((current) => ({ ...current, offsetX: p.ox, offsetY: p.oy }));
    }
    cropDragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }, []);

  const handleCropPreviewTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (busy || event.touches.length < 2) return;
      const distance = getTouchDistance(event.touches);
      if (distance <= 0) return;
      cropPanActiveRef.current = false;
      if (cropPanRafRef.current != null) {
        cancelAnimationFrame(cropPanRafRef.current);
        cropPanRafRef.current = null;
      }
      cropPanPendingRef.current = null;
      cropPinchStateRef.current = {
        startDistance: distance,
        startZoom: crop.zoom,
      };
      cropDragStateRef.current = null;
    },
    [busy, crop.zoom, getTouchDistance],
  );

  const handleCropPreviewTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const pinch = cropPinchStateRef.current;
      if (!pinch || event.touches.length < 2) return;
      const distance = getTouchDistance(event.touches);
      if (distance <= 0) return;
      event.preventDefault();
      const zoomFactor = distance / pinch.startDistance;
      const nextZoom = Math.max(1, Math.min(3, pinch.startZoom * zoomFactor));
      setCrop((current) => ({ ...current, zoom: nextZoom }));
    },
    [getTouchDistance],
  );

  const handleCropPreviewTouchEnd = useCallback(() => {
    cropPinchStateRef.current = null;
  }, []);

  async function handleApply() {
    if (busy) return;
    const finalDataUrl = await cropDataUrlToSquare(crop.sourceUrl, {
      zoom: crop.zoom,
      offsetX: crop.offsetX,
      offsetY: crop.offsetY,
      rotateQuarterTurns: crop.rotateQuarterTurns,
      flipHorizontal: crop.flipHorizontal,
      filterPreset: crop.filterPreset,
    });
    await onApply(finalDataUrl);
  }

  return (
    <aside
      className="min-w-0 rounded-xl border border-neutral-800 bg-zinc-950/98 p-3 shadow-2xl light:border-zinc-200 light:bg-white"
      role="region"
      aria-label="Editor de recorte 1:1"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Editor de imagen (1:1)</h4>
        <button
          type="button"
          className="inline-flex min-h-10 items-center rounded-lg border border-neutral-700 px-3 text-xs text-neutral-300 light:border-zinc-300 light:text-zinc-700"
          onClick={onCancel}
          disabled={busy}
        >
          Cerrar
        </button>
      </div>
      <p className="mb-2 text-xs text-neutral-500 light:text-zinc-600">Ajusta el encuadre para: {crop.sourceName}</p>
      <div className="grid gap-2">
        <div className="rounded-lg border border-neutral-800 bg-black/40 p-2 light:border-zinc-200 light:bg-zinc-50">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-neutral-400 light:text-zinc-600">Vista previa (arrastra para mover)</p>
            <span className="rounded border border-goi-gold/35 bg-goi-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-goi-gold">
              1:1
            </span>
          </div>
          <div
            className="touch-none cursor-grab select-none active:cursor-grabbing"
            onPointerDown={handleCropPreviewPointerDown}
            onPointerMove={handleCropPreviewPointerMove}
            onPointerUp={handleCropPreviewPointerUp}
            onPointerCancel={handleCropPreviewPointerUp}
            onTouchStart={handleCropPreviewTouchStart}
            onTouchMove={handleCropPreviewTouchMove}
            onTouchEnd={handleCropPreviewTouchEnd}
            onTouchCancel={handleCropPreviewTouchEnd}
          >
            <img
              src={crop.previewUrl}
              alt="Vista previa del recorte"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="pointer-events-none aspect-square w-full rounded object-cover"
            />
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-black/25 p-2 light:border-zinc-200 light:bg-zinc-100/80">
          <p className="mb-2 text-[11px] font-medium text-neutral-400 light:text-zinc-600">Transformación</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-neutral-700 px-2 text-xs font-medium text-neutral-200 hover:border-neutral-600 sm:flex-none light:border-zinc-300 light:text-zinc-800 light:hover:border-zinc-400"
              disabled={busy}
              onClick={() =>
                setCrop((current) => ({
                  ...current,
                  rotateQuarterTurns: ((current.rotateQuarterTurns + 1) % 4) as 0 | 1 | 2 | 3,
                }))
              }
            >
              Rotar 90°
            </button>
            <button
              type="button"
              className={[
                "inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border px-2 text-xs font-medium sm:flex-none",
                crop.flipHorizontal
                  ? "border-goi-gold/55 bg-goi-gold/15 text-goi-gold"
                  : "border-neutral-700 text-neutral-200 hover:border-neutral-600 light:border-zinc-300 light:text-zinc-800",
              ].join(" ")}
              disabled={busy}
              onClick={() => setCrop((current) => ({ ...current, flipHorizontal: !current.flipHorizontal }))}
            >
              Espejo
            </button>
          </div>
          <p className="mb-1.5 mt-3 text-[11px] font-medium text-neutral-400 light:text-zinc-600">Estilo</p>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_PRESETS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={[
                  "rounded-md border px-2 py-1.5 text-[11px] font-semibold",
                  crop.filterPreset === id
                    ? "border-goi-gold/55 bg-goi-gold/15 text-goi-gold"
                    : "border-neutral-700 text-neutral-300 hover:border-neutral-600 light:border-zinc-300 light:text-zinc-800",
                ].join(" ")}
                disabled={busy}
                onClick={() => setCrop((current) => ({ ...current, filterPreset: id }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 1.25, 1.5, 2, 2.5].map((z) => (
            <button
              key={z}
              type="button"
              className={[
                "rounded-md border px-2 py-1 text-[11px] font-semibold",
                Math.abs(crop.zoom - z) < 0.03
                  ? "border-goi-gold/55 bg-goi-gold/15 text-goi-gold"
                  : "border-neutral-700 text-neutral-300 hover:border-neutral-600 light:border-zinc-300 light:text-zinc-700",
              ].join(" ")}
              disabled={busy}
              onClick={() => setCrop((current) => ({ ...current, zoom: z }))}
            >
              {z.toFixed(2)}x
            </button>
          ))}
        </div>
        <label className="grid gap-1 text-xs text-neutral-300 light:text-zinc-700">
          Zoom: {crop.zoom.toFixed(2)}x
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={crop.zoom}
            disabled={busy}
            onChange={(event) => setCrop((current) => ({ ...current, zoom: Number(event.target.value) }))}
          />
        </label>
        <label className="grid gap-1 text-xs text-neutral-300 light:text-zinc-700">
          Horizontal: {crop.offsetX.toFixed(2)}
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={crop.offsetX}
            disabled={busy}
            onChange={(event) => setCrop((current) => ({ ...current, offsetX: Number(event.target.value) }))}
          />
        </label>
        <label className="grid gap-1 text-xs text-neutral-300 light:text-zinc-700">
          Vertical: {crop.offsetY.toFixed(2)}
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={crop.offsetY}
            disabled={busy}
            onChange={(event) => setCrop((current) => ({ ...current, offsetY: Number(event.target.value) }))}
          />
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-lg border border-neutral-700 px-3 text-xs text-neutral-300 light:border-zinc-300 light:text-zinc-700"
            disabled={busy}
            onClick={() =>
              setCrop((current) => ({
                ...current,
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
                rotateQuarterTurns: 0,
                flipHorizontal: false,
                filterPreset: "none",
              }))
            }
          >
            Restablecer todo
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-lg border border-goi-gold/50 bg-goi-gold/15 px-3 text-xs font-semibold text-goi-gold disabled:opacity-60"
            disabled={busy}
            onClick={() => void handleApply()}
          >
            Aplicar recorte
          </button>
        </div>
      </div>
    </aside>
  );
}
