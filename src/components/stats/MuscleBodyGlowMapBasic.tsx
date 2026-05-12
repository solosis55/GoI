import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MuscleOctagonAxis } from "../../utils/muscleOctagonStats";
import {
  MUSCLE_OCTAGON_AXES,
  MUSCLE_OCTAGON_LABELS,
  type OctagonMapPeriod,
} from "../../utils/muscleOctagonStats";
import {
  MUSCLE_BODY_SILHOUETTE_PATH_IDS,
  MUSCLE_MAP_AXIS_TO_SVG_IDS,
  MUSCLE_MAP_PATH_FALLBACK_LABEL,
  PATH_ID_TO_OCT_AXIS,
} from "../../utils/muscleBodyMapSvgZones";
import vectorizedSvgRaw from "../../../vectorized.svg?raw";

/** Misma referencia siempre: si no, React reinyecta el SVG en cada render y se pierden estilos/defs del layout. */
const EMBEDDED_VECTOR_SVG: { __html: string } = { __html: vectorizedSvgRaw as string };

export type MuscleBodyGlowMapBasicProps = {
  hits: Record<MuscleOctagonAxis, number>;
  className?: string;
  /** Ventana usada para calcular `hits` (solo informativo en UI). */
  mapPeriod?: OctagonMapPeriod;
  onNavigateToRadar?: () => void;
};

function querySvgById(svg: SVGSVGElement, rawId: string): SVGElement | null {
  try {
    const esc = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(rawId) : rawId;
    return svg.querySelector<SVGElement>(`#${esc}`);
  } catch {
    return null;
  }
}

function pathIsTrackable(p: SVGPathElement) {
  const id = p.id;
  if (!id) return false;
  return (
    PATH_ID_TO_OCT_AXIS.has(id) ||
    Boolean(MUSCLE_MAP_PATH_FALLBACK_LABEL[id]) ||
    MUSCLE_BODY_SILHOUETTE_PATH_IDS.has(id)
  );
}

function pickPathUnderCursorForSvg(clientX: number, clientY: number, svg: SVGSVGElement): SVGPathElement | null {
  if (typeof document.elementsFromPoint === "function") {
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const n of stack) {
      if (!(n instanceof SVGPathElement)) continue;
      if (!svg.contains(n)) continue;
      if (pathIsTrackable(n)) return n;
    }
  }
  let el: Element | null = document.elementFromPoint(clientX, clientY);
  while (el) {
    if (el instanceof SVGPathElement && svg.contains(el) && pathIsTrackable(el)) return el;
    if (el === svg) break;
    el = el.parentElement;
  }
  return null;
}

function normalizeHitOps(hits: Record<MuscleOctagonAxis, number>) {
  const vals = MUSCLE_OCTAGON_AXES.map((k) => hits[k] ?? 0);
  const max = Math.max(1, ...vals);

  const ops = {} as Record<MuscleOctagonAxis, number>;
  for (const ax of MUSCLE_OCTAGON_AXES) ops[ax] = (hits[ax] ?? 0) / max;
  return ops;
}

function ensureGlowDefs(svg: SVGSVGElement, gid: string) {
  const bloomId = `${gid}-bloom`;
  if (querySvgById(svg, bloomId)) return;

  const ns = "http://www.w3.org/2000/svg";

  const defs = document.createElementNS(ns, "defs");
  defs.setAttribute("id", `${gid}-mbg-defs`);

  const grad = document.createElementNS(ns, "linearGradient");
  grad.setAttribute("id", `${gid}-gold`);
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "100%");

  const themeAttr =
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;
  const healthy = themeAttr === "healthy";
  const neon = themeAttr === "neon";

  const s0 = document.createElementNS(ns, "stop");
  s0.setAttribute("offset", "0%");
  s0.setAttribute("stop-color", healthy ? "#eef1ef" : neon ? "#f0ffe8" : "#fffbeb");
  grad.appendChild(s0);

  const s1 = document.createElementNS(ns, "stop");
  s1.setAttribute("offset", "35%");
  s1.setAttribute("stop-color", healthy ? "#9db0a6" : neon ? "#c8ff3d" : "#fcd34d");
  grad.appendChild(s1);

  const s2 = document.createElementNS(ns, "stop");
  s2.setAttribute("offset", "100%");
  s2.setAttribute("stop-color", healthy ? "#4a5e56" : neon ? "#0d3d0f" : "#92400e");
  grad.appendChild(s2);

  defs.appendChild(grad);

  const filt = document.createElementNS(ns, "filter");
  filt.setAttribute("id", bloomId);
  filt.setAttribute("x", "-45%");
  filt.setAttribute("y", "-45%");
  filt.setAttribute("width", "190%");
  filt.setAttribute("height", "190%");

  const blur = document.createElementNS(ns, "feGaussianBlur");
  blur.setAttribute("stdDeviation", "2.4");
  blur.setAttribute("result", "blur");
  filt.appendChild(blur);

  const cm = document.createElementNS(ns, "feColorMatrix");
  cm.setAttribute("in", "blur");
  cm.setAttribute("type", "matrix");
  cm.setAttribute("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0");
  cm.setAttribute("result", "soft");
  filt.appendChild(cm);

  const merge = document.createElementNS(ns, "feMerge");
  const mn0 = document.createElementNS(ns, "feMergeNode");
  mn0.setAttribute("in", "soft");
  merge.appendChild(mn0);
  const mn1 = document.createElementNS(ns, "feMergeNode");
  mn1.setAttribute("in", "SourceGraphic");
  merge.appendChild(mn1);
  filt.appendChild(merge);

  defs.appendChild(filt);
  svg.appendChild(defs);
}

function mapPeriodLabel(period: OctagonMapPeriod | undefined): string {
  switch (period) {
    case "7d":
      return "Últimos 7 días (semana)";
    case "30d":
      return "Últimos 30 días";
    case "90d":
      return "Últimos 90 días";
    default:
      return "Todo el historial";
  }
}

function readDataTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "encendido" || t === "healthy" ? "light" : "dark";
}

export function MuscleBodyGlowMapBasic({
  hits,
  className = "",
  mapPeriod = "all",
  onNavigateToRadar,
}: MuscleBodyGlowMapBasicProps) {
  const rid = useId().replace(/:/g, "");
  const gid = `mbg-${rid}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tipRaf = useRef<number | null>(null);

  const [hoverTip, setHoverTip] = useState<{
    x: number;
    y: number;
    title: string;
    detail: string;
  } | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  const { effectiveHits, isPreviewMap } = useMemo(() => {
    const allZero = MUSCLE_OCTAGON_AXES.every((ax) => (hits[ax] ?? 0) === 0);
    if (!allZero) return { effectiveHits: hits, isPreviewMap: false };
    return {
      isPreviewMap: true,
      effectiveHits: {
        ...hits,
        brazos: 9,
        hombros: 8,
        espalda: 8,
        cuadriceps: 7,
        posterior: 5,
        gemelos: 4,
      },
    };
  }, [hits]);

  const summary = useMemo(
    () =>
      MUSCLE_OCTAGON_AXES.map((ax) => `${MUSCLE_OCTAGON_LABELS[ax]}: ${effectiveHits[ax] ?? 0}`).join(", "),
    [effectiveHits],
  );

  const opsByAxis = useMemo(() => normalizeHitOps(effectiveHits), [effectiveHits]);

  const axisLegendRows = useMemo(() => {
    const ops = normalizeHitOps(effectiveHits);
    return [...MUSCLE_OCTAGON_AXES]
      .map((ax) => ({ ax, op: ops[ax] ?? 0, n: effectiveHits[ax] ?? 0 }))
      .filter((row) => row.n > 0)
      .sort((a, b) => b.op - a.op);
  }, [effectiveHits]);

  const tableRows = useMemo(
    () =>
      MUSCLE_OCTAGON_AXES.map((ax) => ({
        ax,
        label: MUSCLE_OCTAGON_LABELS[ax],
        n: effectiveHits[ax] ?? 0,
        op: Math.round((opsByAxis[ax] ?? 0) * 100),
      })),
    [effectiveHits, opsByAxis],
  );

  const hitsRef = useRef(effectiveHits);
  const previewRef = useRef(isPreviewMap);
  const opsRef = useRef(opsByAxis);
  hitsRef.current = effectiveHits;
  previewRef.current = isPreviewMap;
  opsRef.current = opsByAxis;

  const exportPng = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    setExportBusy(true);
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>` + xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      const scale = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 2);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("svg"));
        img.src = url;
      });
      const vb = svg.viewBox?.baseVal;
      const w = vb && vb.width > 0 ? vb.width : img.naturalWidth || 420;
      const h = vb && vb.height > 0 ? vb.height : img.naturalHeight || 460;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.fillStyle = readDataTheme() === "light" ? "#fafafa" : "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `goi-mapa-corporal-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch {
      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `goi-mapa-corporal-${new Date().toISOString().slice(0, 10)}.svg`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const svg = container.querySelector<SVGSVGElement>("svg");
    if (!svg) return;

    ensureGlowDefs(svg, gid);

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transition = reduceMotion
      ? "none"
      : "fill-opacity 420ms cubic-bezier(0.4, 0, 0.2, 1), filter 380ms ease, stroke 280ms ease";

    const theme = readDataTheme();
    const neutralFill =
      theme === "light"
        ? highContrast
          ? "rgba(24,24,27,0.14)"
          : "rgba(24,24,27,0.055)"
        : highContrast
          ? "rgba(255,255,255,0.13)"
          : "rgba(255,255,255,0.055)";
    const neutralStroke =
      theme === "light"
        ? highContrast
          ? "rgba(39,39,42,0.58)"
          : "rgba(113,113,122,0.34)"
        : highContrast
          ? "rgba(228,228,231,0.48)"
          : "rgba(161,161,170,0.28)";

    const goldOpacity = (op: number) => (op <= 0 ? 0 : Math.min(0.95, 0.2 + 0.75 * op));

    const processedIds = new Set<string>();

    const applyNeutral = (el: SVGElement) => {
      el.removeAttribute("fill");
      el.removeAttribute("filter");
      el.setAttribute(
        "style",
        `fill:${neutralFill};fill-opacity:1;stroke:${neutralStroke};stroke-width:${highContrast ? 1.1 : 0.75}px;vector-effect:non-scaling-stroke;paint-order:stroke fill;pointer-events:all;transition:${transition}`,
      );
    };

    for (const ax of MUSCLE_OCTAGON_AXES) {
      const op = opsByAxis[ax] ?? 0;
      const opacity = goldOpacity(op);
      const strong = op >= 0.38;

      const fill = `url(#${gid}-gold)`;
      const filter = `url(#${gid}-bloom)`;

      for (const id of MUSCLE_MAP_AXIS_TO_SVG_IDS[ax]) {
        const el = querySvgById(svg, id);
        if (!el) continue;
        processedIds.add(id);

        el.removeAttribute("fill");

        if (opacity <= 0) {
          applyNeutral(el);
          continue;
        }

        const opacityStr = opacity.toFixed(3);
        const filterPart = opacity > 0 && strong ? `filter:${filter};` : "";
        el.setAttribute(
          "style",
          `fill:${fill};fill-opacity:${opacityStr};stroke:none;${filterPart}pointer-events:all;transition:${transition}`,
        );
      }
    }

    svg.querySelectorAll("path[id]").forEach((node) => {
      const el = node as SVGPathElement;
      const id = el.id;
      if (!MUSCLE_BODY_SILHOUETTE_PATH_IDS.has(id)) return;
      if (processedIds.has(id)) return;
      applyNeutral(el);
    });
  }, [gid, opsByAxis, highContrast]);

  const handlePointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    if (tipRaf.current != null) cancelAnimationFrame(tipRaf.current);
    tipRaf.current = requestAnimationFrame(() => {
      tipRaf.current = null;
      const svg = containerRef.current?.querySelector<SVGSVGElement>("svg");
      if (!svg) {
        setHoverTip(null);
        return;
      }
      const path = pickPathUnderCursorForSvg(e.clientX, e.clientY, svg);
      if (!path) {
        setHoverTip(null);
        return;
      }
      const id = path.id;
      const axis = PATH_ID_TO_OCT_AXIS.get(id);
      const x = e.clientX;
      const y = e.clientY;
      if (axis) {
        const h = hitsRef.current;
        const n = h[axis] ?? 0;
        const op = Math.round((opsRef.current[axis] ?? 0) * 100);
        const base = `${n} apariciones en sesiones · ${op}% relativo${previewRef.current ? " (vista de ejemplo)" : ""}`;
        const detail =
          n === 0 && !previewRef.current
            ? `${base}. Sin datos en este periodo; añade sesiones o ejercicios con músculos etiquetados.`
            : `${base}.`;
        setHoverTip({
          x,
          y,
          title: MUSCLE_OCTAGON_LABELS[axis],
          detail,
        });
        return;
      }
      const fb = MUSCLE_MAP_PATH_FALLBACK_LABEL[id];
      if (fb) {
        setHoverTip({ x, y, title: fb, detail: "Zona de contorno; no suma al radar octogonal." });
        return;
      }
      setHoverTip(null);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (tipRaf.current != null) cancelAnimationFrame(tipRaf.current);
    tipRaf.current = null;
    setHoverTip(null);
  }, []);

  const tipLeft = useMemo(() => {
    if (!hoverTip || typeof window === "undefined") return 0;
    const maxLeft = window.innerWidth - 220;
    return Math.max(8, Math.min(hoverTip.x + 14, maxLeft));
  }, [hoverTip]);

  const tipTop = useMemo(() => {
    if (!hoverTip || typeof window === "undefined") return 0;
    const maxTop = window.innerHeight - 72;
    return Math.max(8, Math.min(hoverTip.y + 14, maxTop));
  }, [hoverTip]);

  const tipNode =
    hoverTip && typeof document !== "undefined" ? (
      <div
        className="pointer-events-none fixed max-w-[min(18rem,calc(100vw-1.5rem))] rounded-lg border border-neutral-700/90 bg-neutral-950/95 px-3 py-2 text-left shadow-xl backdrop-blur-sm light:border-zinc-300 light:bg-white/95"
        style={{ left: tipLeft, top: tipTop, zIndex: 9999 }}
        role="status"
        aria-live="polite"
      >
        <p className="m-0 text-[11px] font-semibold text-goi-gold healthy:text-goi-gold-dim">{hoverTip.title}</p>
        <p className="mt-0.5 m-0 text-[10px] leading-snug text-neutral-300 light:text-zinc-700">{hoverTip.detail}</p>
      </div>
    ) : null;

  return (
    <div className={["mbg-map-root w-full", highContrast ? "mbg-map-root--a11y" : "", className].filter(Boolean).join(" ")}>
      {tipNode ? createPortal(tipNode, document.body) : null}

      <figure className="m-0 mx-auto max-w-4xl overflow-hidden rounded-2xl border border-neutral-800/75 bg-linear-to-b from-neutral-950/98 via-neutral-950 to-neutral-950 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(212,175,55,0.09)] light:border-zinc-200 light:from-zinc-100 light:via-white light:to-zinc-50 light:shadow-[0_14px_40px_-22px_rgba(24,24,27,0.12),inset_0_1px_0_0_rgba(212,175,55,0.12)] healthy:shadow-[0_14px_40px_-22px_rgba(24,24,27,0.1),inset_0_1px_0_0_rgba(93,146,112,0.16)]">
        <div className="relative px-1.5 pb-2 pt-11 sm:px-3 sm:pb-4 sm:pt-14">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
            <div className="absolute -left-8 top-[22%] size-[11rem] rounded-full bg-goi-gold/[0.09] blur-3xl encendido:bg-orange-400/[0.14] healthy:bg-goi-gold/[0.11]" />
            <div className="absolute -right-10 bottom-[18%] size-[10rem] rounded-full bg-goi-gold/[0.06] blur-3xl encendido:bg-orange-400/[0.1] healthy:bg-goi-gold/[0.085]" />
          </div>

          <style>
            {`
              .mbg-vector-host > svg {
                width: 100%;
                height: auto;
                display: block;
                pointer-events: auto;
                filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.45));
              }
              .mbg-vector-host > svg path[id] {
                pointer-events: all;
              }
              html[data-theme="encendido"] .mbg-vector-host > svg,
              html[data-theme="healthy"] .mbg-vector-host > svg {
                filter: drop-shadow(0 8px 22px rgba(24, 24, 27, 0.12));
              }
            `}
          </style>

          <div
            className="relative z-[1] isolate w-full"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
          >
            <div
              ref={containerRef}
              className="mbg-vector-host h-auto w-full"
              dangerouslySetInnerHTML={EMBEDDED_VECTOR_SVG}
            />
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-12 bottom-3 z-[2] hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-goi-gold/25 to-transparent healthy:via-goi-gold/28 sm:block"
            aria-hidden
          />

          <div className="pointer-events-none absolute left-0 top-2.5 z-[2] flex w-1/2 justify-center px-1 sm:top-3.5 sm:px-2">
            <span className="rounded-full border border-white/12 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-goi-gold shadow-sm backdrop-blur-md light:border-zinc-300/70 light:bg-white/80 light:text-goi-gold-dim healthy:text-goi-gold-dim light:shadow-[0_1px_0_rgba(255,255,255,0.9)]">
              Frente
            </span>
          </div>
          <div className="pointer-events-none absolute right-0 top-2.5 z-[2] flex w-1/2 justify-center px-1 sm:top-3.5 sm:px-2">
            <span className="rounded-full border border-white/12 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-goi-gold shadow-sm backdrop-blur-md light:border-zinc-300/70 light:bg-white/80 light:text-goi-gold-dim healthy:text-goi-gold-dim light:shadow-[0_1px_0_rgba(255,255,255,0.9)]">
              Espalda
            </span>
          </div>

          {isPreviewMap ? (
            <div
              className="pointer-events-none absolute bottom-2 left-1/2 z-[3] max-w-[min(92%,28rem)] -translate-x-1/2 rounded-full border border-amber-500/40 bg-amber-950/88 px-3 py-1.5 text-center text-[10px] font-medium leading-snug text-amber-50 shadow-lg backdrop-blur-sm light:border-goi-gold/45 light:bg-goi-gold/[0.12] light:text-goi-gold-dim light:shadow-md healthy:border-goi-gold/36 healthy:bg-goi-gold/[0.085] healthy:text-goi-gold-dim"
              aria-hidden
            >
              Ejemplo: con datos reales el mapa refleja tus sesiones y ejercicios etiquetados.
            </div>
          ) : null}
        </div>

        <figcaption className="sr-only">
          Mapa corporal. Periodo: {mapPeriodLabel(mapPeriod)}. Vistas frontal y dorsal; intensidad por grupo muscular.{" "}
          {summary}
          {isPreviewMap ? " Vista de demostración sin datos de entreno." : ""}
        </figcaption>
      </figure>

      <div className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 light:text-zinc-600">
          Periodo: {mapPeriodLabel(mapPeriod)}
        </span>
        {onNavigateToRadar ? (
          <button
            type="button"
            className="rounded-lg border border-neutral-700/80 bg-black/35 px-2.5 py-1 text-[10px] font-medium text-goi-gold transition hover:border-goi-gold/45 hover:bg-neutral-900/80 light:border-zinc-300 light:bg-white light:text-goi-gold-dim healthy:text-goi-gold-dim light:hover:border-goi-gold/45 healthy:hover:border-goi-gold/30"
            onClick={onNavigateToRadar}
          >
            Ver radar octogonal
          </button>
        ) : null}
        <button
          type="button"
          disabled={exportBusy}
          className="rounded-lg border border-neutral-700/80 bg-black/35 px-2.5 py-1 text-[10px] font-medium text-neutral-200 transition hover:border-goi-gold/35 enabled:hover:bg-neutral-900/80 disabled:opacity-50 light:border-zinc-300 light:bg-white light:text-zinc-800 light:hover:border-goi-gold/40 healthy:hover:border-goi-gold/30"
          onClick={() => void exportPng()}
        >
          {exportBusy ? "Exportando…" : "Exportar PNG"}
        </button>
        <button
          type="button"
          className={[
            "rounded-lg border px-2.5 py-1 text-[10px] font-medium transition",
            highContrast
              ? "border-goi-gold/50 bg-goi-gold/15 text-goi-gold light:border-goi-gold/45 light:bg-goi-gold/[0.11] healthy:bg-goi-gold/[0.11] light:text-goi-gold-dim healthy:text-goi-gold-dim"
              : "border-neutral-700/80 bg-black/35 text-neutral-300 hover:border-goi-gold/35 light:border-zinc-300 light:bg-white light:text-zinc-800",
          ].join(" ")}
          onClick={() => setHighContrast((v) => !v)}
          aria-pressed={highContrast}
        >
          Contraste alto
        </button>
        <button
          type="button"
          className="rounded-lg border border-neutral-700/80 bg-black/35 px-2.5 py-1 text-[10px] font-medium text-neutral-300 transition hover:border-goi-gold/35 light:border-zinc-300 light:bg-white light:text-zinc-800"
          aria-expanded={tableOpen}
          onClick={() => setTableOpen((o) => !o)}
        >
          {tableOpen ? "Ocultar tabla" : "Ver tabla de datos"}
        </button>
      </div>

      {tableOpen ? (
        <div className="mx-auto mt-3 max-w-4xl overflow-x-auto rounded-xl border border-neutral-800/60 bg-black/30 light:border-zinc-200 light:bg-zinc-50/95">
          <table className="w-full min-w-[280px] border-collapse text-left text-[11px]">
            <caption className="sr-only">Impactos por grupo muscular en el periodo seleccionado</caption>
            <thead>
              <tr className="border-b border-neutral-800 bg-black/35 light:border-zinc-200 light:bg-zinc-100">
                <th className="px-3 py-2 font-semibold text-neutral-300 light:text-zinc-800">Grupo</th>
                <th className="px-3 py-2 font-semibold text-neutral-300 light:text-zinc-800">Apariciones</th>
                <th className="px-3 py-2 font-semibold text-neutral-300 light:text-zinc-800">% relativo</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ ax, label, n, op }) => (
                <tr key={ax} className="border-b border-neutral-800/40 last:border-0 light:border-zinc-100">
                  <td className="px-3 py-2 text-neutral-200 light:text-zinc-900">{label}</td>
                  <td className="px-3 py-2 tabular-nums text-neutral-400 light:text-zinc-700">{n}</td>
                  <td className="px-3 py-2 tabular-nums text-goi-gold healthy:text-goi-gold-dim">{op}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div
        className="mx-auto mt-4 max-w-4xl space-y-3 rounded-xl border border-neutral-800/60 bg-black/25 px-3 py-3 sm:px-4 sm:py-3.5 light:border-zinc-200 light:bg-zinc-50/90"
        role="presentation"
      >
        <div className="flex flex-wrap items-start gap-3">
          <span
            className="mt-0.5 h-3 w-12 shrink-0 rounded-sm bg-linear-to-r from-[#fffbeb] via-[#fcd34d] to-[#92400e] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-goi-gold/30 light:from-goi-gold/[0.1] light:via-goi-gold/50 light:to-goi-gold-dim light:ring-goi-gold/35 healthy:from-goi-gold/[0.06] healthy:via-goi-gold/45 healthy:to-goi-gold-dim healthy:ring-goi-gold/24"
            aria-hidden
          />
          <p className="m-0 min-w-0 flex-1 text-[11px] leading-relaxed text-neutral-400 light:text-zinc-600">
            <span className="font-semibold text-goi-gold healthy:text-goi-gold-dim">Intensidad relativa:</span> el
            color de acento y el brillo marcan qué grupos llevan más carga en tus sesiones, respecto al máximo del conjunto.
            Pasa el cursor por el cuerpo para ver detalle.
          </p>
        </div>

        {axisLegendRows.length > 0 ? (
          <div className="flex flex-wrap gap-x-3 gap-y-2 border-t border-neutral-800/55 pt-3 light:border-zinc-200/90">
            {axisLegendRows.map(({ ax, op, n }) => (
              <div
                key={ax}
                className="flex min-w-[7.5rem] flex-1 basis-[40%] items-center gap-2 sm:basis-[28%] sm:min-w-0 sm:flex-initial"
              >
                <span className="max-w-[5.5rem] truncate text-[10px] font-medium text-neutral-300 light:text-zinc-800">
                  {MUSCLE_OCTAGON_LABELS[ax]}
                </span>
                <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-800/90 light:bg-zinc-200">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-goi-gold-dim to-goi-gold shadow-[0_0_8px_rgba(212,175,55,0.35)] light:from-goi-gold-dim healthy:from-goi-gold-dim light:to-goi-gold healthy:to-goi-gold-dim light:shadow-[0_0_6px_rgba(196,81,30,0.28)] healthy:shadow-[0_0_6px_rgba(95,116,107,0.22)]"
                    style={{ width: `${Math.round(Math.min(1, op) * 100)}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-[10px] tabular-nums text-neutral-500 light:text-zinc-600">
                  {n}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
