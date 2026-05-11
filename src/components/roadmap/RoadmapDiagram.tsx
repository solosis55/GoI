import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRegisterRoadmapNode } from "../../hooks/useRegisterRoadmapNode";
import { Button } from "../ui/Button";
import { RoadmapRegistryContext } from "./roadmapRegistryContext";
import { collectRoadmapEdgesDetailed } from "../../utils/roadmapEdges";
import {
  BRANCH_LAYOUT_OPTIONS,
  DEFAULT_BRANCH_LAYOUT,
  isBranchLayout,
  type BranchLayout,
  type RoadmapTask,
} from "../../utils/personalRoadmap";

/** Zoom mínimo absoluto cuando el lienzo obliga a bastante reducción. */
const AUTO_FIT_MIN_ZOOM = 0.04;
/** Zoom relativo más bajo permitido respecto al encaje base (= más alejado). */
const ZOOM_REL_MIN = 0.26;
/** Multiplicador máximo sobre el encaje base (acercar fuerte; puede recortarse la vista). */
const ZOOM_REL_MAX = 14;
/** Paso multiplicativo con Ctrl+rueda / botones. */
const ZOOM_WHEEL_STEP = 1.12;
/** Márgenes dentro del lienzo antes de calcular escala */
const VIEWPORT_FIT_PADDING = 20;

type Handlers = {
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onBranchLayoutChange: (id: string, layout: BranchLayout) => void;
};

/** Conector en L con tronco horizontal a altura fija (evita “escaleras” cuando los hijos están alineados). */
function elbowPathBus(x1: number, y1: number, x2: number, y2: number, busY: number): string {
  return `M ${x1} ${y1} L ${x1} ${busY} L ${x2} ${busY} L ${x2} ${y2}`;
}

function elbowPathMid(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return elbowPathBus(x1, y1, x2, y2, midY);
}

/** Agrupa aristas hijas por “fila visual” cuando el padre hace wrap (classic/grid). */
const CHILD_ROW_BUCKET_PX_LOCAL = 40;
/** Altura del tronco horizontal respecto al hueco padre→hijo (mayor → más pegado abajo del padre). */
const SHARED_BUS_DEPTH_FRAC = 0.52;

/** Evita paths distintos por fluctuaciones subpíxel (layout / zoom). */
function quantize(n: number): number {
  return Math.round(n * 4) / 4;
}

function TaskNodeCard({
  task,
  handlers,
  joinFromAbove,
}: {
  task: RoadmapTask;
  handlers: Handlers;
  joinFromAbove: boolean;
}) {
  const register = useRegisterRoadmapNode(task.id);
  const { onToggle, onTitleChange, onRemove, onAddChild, onBranchLayoutChange } = handlers;

  return (
    <div className="relative isolate z-[1] flex flex-col items-center pb-3">
      <div
        ref={register}
        data-roadmap-node
        className={[
          "relative z-[3] w-[min(100%,18rem)] rounded-xl border-2 bg-neutral-950/95 px-3 py-2.5 shadow-[0_10px_36px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(212,175,55,0.1)] light:bg-white",
          task.done ? "border-goi-gold/25 opacity-[0.92]" : "border-goi-gold/45",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {joinFromAbove ? (
          <div
            className="absolute -top-px left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-goi-gold/50 bg-neutral-950 light:bg-white"
            aria-hidden
          />
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <label className="flex shrink-0 cursor-pointer items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task.id)}
              className="size-4 rounded border-neutral-600 text-goi-gold focus:ring-goi-gold/40 light:border-zinc-400"
              aria-label={task.done ? "Marcar como pendiente" : "Marcar como hecha"}
            />
            <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-neutral-500 sm:inline light:text-zinc-500">
              {task.done ? "Hecho" : "Pend."}
            </span>
          </label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onTitleChange(task.id, e.target.value)}
            className={[
              "goi-field w-full min-w-0 flex-1 py-1.5 text-sm md:text-[15px]",
              task.done ? "text-neutral-500 line-through light:text-zinc-500" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            placeholder="Etiqueta del nodo"
            aria-label="Texto del nodo"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-neutral-800/90 pt-2 light:border-zinc-200">
          <Button
            type="button"
            variant="secondary"
            className="!mt-0 px-2 py-1 text-[11px]"
            onClick={() => onAddChild(task.id)}
          >
            + Rama
          </Button>
          <Button
            type="button"
            variant="danger"
            className="!mt-0 px-2 py-1 text-[11px]"
            onClick={() => {
              if (window.confirm("¿Eliminar este nodo y todo lo que cuelga de él?")) onRemove(task.id);
            }}
          >
            Quitar
          </Button>
        </div>
        {task.children.length >= 2 ? (
          <div className="mt-2 border-t border-neutral-800/90 pt-2 light:border-zinc-200">
            <label
              htmlFor={`branch-layout-${task.id}`}
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-500 light:text-zinc-600"
            >
              Tipo de ramas
            </label>
            <select
              id={`branch-layout-${task.id}`}
              value={task.branchLayout ?? DEFAULT_BRANCH_LAYOUT}
              onChange={(e) => {
                const v = e.target.value;
                if (isBranchLayout(v)) onBranchLayoutChange(task.id, v);
              }}
              className="goi-field w-full rounded-md border px-2 py-1.5 text-xs text-neutral-200 light:text-zinc-900"
              aria-label="Distribución de las ramas hijas"
            >
              {BRANCH_LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Ancho mínimo de columna ≈ tarjeta (18rem) para que flex no la aplaste y se superpongan nodos. */
const BRANCH_LANE_CLASS = "flex w-max max-w-none flex-shrink-0 flex-col items-center";

/** Rejilla: columnas nunca más estrechas que una tarjeta. */
const BRANCH_GRID_STYLE: CSSProperties = {
  gridTemplateColumns: "repeat(auto-fit, minmax(19rem, 1fr))",
};

function branchOuterWrapperClass(layout: BranchLayout): string {
  switch (layout) {
    case "horizontal":
      return "w-full min-w-0 flex justify-center py-3 md:py-4";
    default:
      return "w-full min-w-0";
  }
}

function branchInnerContainerClass(layout: BranchLayout): string {
  switch (layout) {
    case "vertical":
      return "flex w-max max-w-none flex-col items-center gap-y-14 pt-6 md:gap-y-[4.25rem]";
    case "horizontal":
      return "flex w-max min-w-max flex-row flex-nowrap items-start gap-x-16 px-6 md:gap-x-[4.75rem]";
    case "grid":
      return [
        "mx-auto grid w-full max-w-[min(96vw,90rem)] justify-items-stretch gap-x-12 gap-y-16 pt-6",
        "md:gap-x-14 md:gap-y-[4.5rem] md:pt-8",
      ].join(" ");
    case "classic":
    default:
      return [
        "flex w-max max-w-none min-w-[min(100vw-2rem,78rem)] flex-wrap items-start justify-center gap-x-10 gap-y-14 pt-6",
        "md:gap-x-[3.75rem] md:gap-y-16 md:pt-8",
      ].join(" ");
  }
}

/**
 * Hijo de un nodo con varias ramas: en rejilla/classic el subárbol puede ser muy ancho;
 * si no se limita `min-width`/overflow, el contenido se dibuja encima de las columnas vecinas.
 */
function BranchChildSlot({
  parentLayout,
  child,
  handlers,
  depth,
}: {
  parentLayout: BranchLayout;
  child: RoadmapTask;
  handlers: Handlers;
  depth: number;
}) {
  const lane = (
    <div className={BRANCH_LANE_CLASS}>
      <DiagramSubtree task={child} handlers={handlers} depth={depth} />
    </div>
  );

  if (parentLayout !== "grid" && parentLayout !== "classic") {
    return lane;
  }

  return (
    <div
      className={[
        "roadmap-branch-cell relative z-0 flex min-h-0 max-w-full flex-col items-center self-stretch px-0.5",
        parentLayout === "classic" ? "min-w-[19rem] shrink-0" : "min-w-0 w-full",
      ].join(" ")}
    >
      {lane}
    </div>
  );
}

/** Sin `:` porque el id del nodo también puede ser un UUID; usamos `\|` en la clave compuesta. */
function siblingRowBucket(layout: BranchLayout | null, toId: string, childTopLocalY: number): string {
  if (layout === null) return `one_${toId}`;
  if (layout === "vertical") return `col_${toId}`;
  return `wr_${Math.floor(childTopLocalY / CHILD_ROW_BUCKET_PX_LOCAL)}`;
}

function DiagramSubtree({ task, handlers, depth = 0 }: { task: RoadmapTask; handlers: Handlers; depth?: number }) {
  const hasChildren = task.children.length > 0;
  const multi = task.children.length > 1;
  const layout = task.branchLayout ?? DEFAULT_BRANCH_LAYOUT;

  return (
    <div className="relative isolate z-[0] flex flex-col items-center">
      <TaskNodeCard task={task} handlers={handlers} joinFromAbove={depth > 0} />

      {hasChildren ? (
        <div className="relative z-[2] mt-10 flex w-full min-w-0 flex-col items-center md:mt-14">
          {multi ? (
            <div className={branchOuterWrapperClass(layout)}>
              <div className={branchInnerContainerClass(layout)} style={layout === "grid" ? BRANCH_GRID_STYLE : undefined}>
                {task.children.map((child) => (
                  <BranchChildSlot
                    key={child.id}
                    parentLayout={layout}
                    child={child}
                    handlers={handlers}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col items-center pt-4 md:pt-6">
              <DiagramSubtree task={task.children[0]!} handlers={handlers} depth={depth + 1} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DiagramForest({ tasks, handlers }: { tasks: RoadmapTask[]; handlers: Handlers }) {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-12 gap-y-16 md:gap-x-16 md:gap-y-20">
      {tasks.map((task) => (
        <DiagramSubtree key={task.id} task={task} handlers={handlers} />
      ))}
    </div>
  );
}

type ViewState = { zoom: number; pan: { x: number; y: number } };

type RoadmapDiagramProps = {
  tasks: RoadmapTask[];
  handlers: Handlers;
};

const DIM_EPS = 0.75;

export function RoadmapDiagram({ tasks, handlers }: RoadmapDiagramProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const nodeMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const linesRafRef = useRef(0);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  /** 1 = encaje todo visible; valores mayores acercan más allá de ese encaje (puede recortarse la vista). */
  const [zoomRel, setZoomRel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const recenterNextRef = useRef(true);
  const zoomRelRef = useRef(zoomRel);
  zoomRelRef.current = zoomRel;
  const panRef = useRef(pan);
  panRef.current = pan;

  const [view, setView] = useState<ViewState>({ zoom: 1, pan: { x: 0, y: 0 } });
  const viewRef = useRef(view);
  viewRef.current = view;

  const svgRef = useRef<SVGSVGElement>(null);
  const connectorPathRef = useRef<SVGPathElement>(null);
  const lastSvgDimsRef = useRef({ w: 0, h: 0 });
  const lastPathDRef = useRef("");

  const registerNode = useCallback((id: string, el: HTMLElement | null) => {
    const m = nodeMapRef.current;
    if (el) m.set(id, el);
    else m.delete(id);
  }, []);

  const readCameraMetrics = useCallback(() => {
    const vp = viewportRef.current;
    const inner = innerRef.current;
    const measure = contentMeasureRef.current;
    if (!vp || !inner) return null;
    const rw = Math.max(measure?.offsetWidth ?? inner.scrollWidth, 8);
    const rh = Math.max(measure?.offsetHeight ?? inner.scrollHeight, 8);
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    const pad = VIEWPORT_FIT_PADDING;
    const availW = Math.max(vpW - pad * 2, 48);
    const availH = Math.max(vpH - pad * 2, 48);
    const rawFit = Math.min(availW / rw, availH / rh) * 0.975;
    const zFit = Math.min(rawFit, 1);
    return { vpW, vpH, rw, rh, zFit, pad };
  }, []);

  /** Recalcula zoom; el pan no se acota (cámara libre salvo Encajar / zoom focal). */
  const syncViewportCamera = useCallback(() => {
    const vp = viewportRef.current;
    const inner = innerRef.current;
    if (!vp || !inner) return;

    if (tasks.length === 0) {
      setView((prev) =>
        prev.zoom === 1 && prev.pan.x === 0 && prev.pan.y === 0 ? prev : { zoom: 1, pan: { x: 0, y: 0 } },
      );
      return;
    }

    const m = readCameraMetrics();
    if (!m) return;
    const { vpW, vpH, rw, rh, zFit } = m;

    let z = zFit * zoomRel;
    z = Math.min(Math.max(z, AUTO_FIT_MIN_ZOOM), zFit * ZOOM_REL_MAX);

    let px = pan.x;
    let py = pan.y;
    if (recenterNextRef.current) {
      px = (vpW - rw * z) / 2;
      py = (vpH - rh * z) / 2;
      recenterNextRef.current = false;
    }

    setPan((prev) => (Math.abs(prev.x - px) < 0.25 && Math.abs(prev.y - py) < 0.25 ? prev : { x: px, y: py }));

    setView((prev) => {
      if (
        Math.abs(prev.zoom - z) < 0.002 &&
        Math.abs(prev.pan.x - px) < 0.5 &&
        Math.abs(prev.pan.y - py) < 0.5
      ) {
        return prev;
      }
      return { zoom: z, pan: { x: px, y: py } };
    });
  }, [tasks, zoomRel, pan.x, pan.y, readCameraMetrics]);

  const fitDiagram = useCallback(() => {
    recenterNextRef.current = true;
    setZoomRel(1);
  }, []);

  /**
   * Pinta solo en el DOM del SVG (sin setState): evita re-renders en cascada con ResizeObserver y pan/zoom.
   * Un único elemento path con varios subtrazos reduce churn frente a muchos elementos.
   *
   * El `inner` lleva `transform: scale(zoom)`: `getBoundingClientRect()` está en px de pantalla (ya escalados),
   * pero el SVG usa el sistema local del div (sin escalar). Por eso dividimos diferencias por `zoom` y damos
   * al SVG `offsetWidth`/`offsetHeight`, no el rect visual.
   */
  const recomputeLines = useCallback(() => {
    const inner = innerRef.current;
    const svg = svgRef.current;
    const pathEl = connectorPathRef.current;
    if (!inner || !svg || !pathEl) return;

    const z = Math.max(viewRef.current.zoom, AUTO_FIT_MIN_ZOOM * 0.5);
    const ir = inner.getBoundingClientRect();
    if (ir.width < 1 || ir.height < 1) return;

    const nw = Math.round(inner.offsetWidth);
    const nh = Math.round(inner.offsetHeight);
    if (nw < 1 || nh < 1) return;

    const prevDim = lastSvgDimsRef.current;
    if (
      Math.abs(prevDim.w - nw) >= DIM_EPS ||
      Math.abs(prevDim.h - nh) >= DIM_EPS ||
      prevDim.w === 0
    ) {
      svg.setAttribute("width", String(nw));
      svg.setAttribute("height", String(nh));
      lastSvgDimsRef.current = { w: nw, h: nh };
    }

    const detailedEdges = collectRoadmapEdgesDetailed(tasksRef.current);
    const nodeMap = nodeMapRef.current;

    type EdgeGeom = {
      groupKey: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };

    const prepared: EdgeGeom[] = [];
    for (const edge of detailedEdges) {
      const a = nodeMap.get(edge.from);
      const b = nodeMap.get(edge.to);
      if (!a || !b) continue;
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const x1 = quantize((ar.left + ar.width / 2 - ir.left) / z);
      const y1 = quantize((ar.bottom - ir.top) / z);
      const x2 = quantize((br.left + br.width / 2 - ir.left) / z);
      const y2 = quantize((br.top - ir.top) / z);
      const rowBucket = siblingRowBucket(edge.parentMultiLayout, edge.to, y2);
      const groupKey = `${edge.from}|${rowBucket}|${edge.parentMultiLayout ?? "chain"}`;
      prepared.push({ groupKey, x1, y1, x2, y2 });
    }

    const byGroup = new Map<string, EdgeGeom[]>();
    for (const seg of prepared) {
      const list = byGroup.get(seg.groupKey);
      if (list) list.push(seg);
      else byGroup.set(seg.groupKey, [seg]);
    }

    const segments: string[] = [];
    for (const group of byGroup.values()) {
      if (group.length === 0) continue;
      const ref = group[0]!;
      const minTop = Math.min(...group.map((g) => g.y2));

      /** Tronco compartido en la misma “fila” de hijos (horizontal / classic / grid); columna vertical: cada arista aparte. */
      const layoutTok = ref.groupKey.split("|")[2];
      const multiLayout =
        layoutTok !== undefined && layoutTok !== "chain" && isBranchLayout(layoutTok) ? layoutTok : null;

      const useSharedBus =
        group.length >= 2 && multiLayout !== null && multiLayout !== "vertical";

      const busY = quantize(ref.y1 + Math.max(minTop - ref.y1, 1) * SHARED_BUS_DEPTH_FRAC);
      for (const g of group) {
        if (useSharedBus) segments.push(elbowPathBus(g.x1, g.y1, g.x2, g.y2, busY));
        else segments.push(elbowPathMid(g.x1, g.y1, g.x2, g.y2));
      }
    }
    const nextD = segments.join(" ");
    if (nextD !== lastPathDRef.current) {
      pathEl.setAttribute("d", nextD);
      lastPathDRef.current = nextD;
    }
  }, []);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines, tasks, view.zoom, view.pan]);

  /** Cámara limitada: escala y posición según viewport (siempre cabe el organigrama completo). */
  useLayoutEffect(() => {
    syncViewportCamera();
  }, [syncViewportCamera]);

  const syncViewportCameraRef = useRef(syncViewportCamera);
  syncViewportCameraRef.current = syncViewportCamera;

  /** Tras mutar el árbol (no en cada fotograma de arrastre), medidas tras un frame. */
  useLayoutEffect(() => {
    let id = 0;
    id = window.requestAnimationFrame(() => syncViewportCameraRef.current());
    return () => window.cancelAnimationFrame(id);
  }, [tasks]);

  /** Redibujado de aristas + cámara al redimensionar. */
  useEffect(() => {
    const vp = viewportRef.current;
    const inner = innerRef.current;
    if (!vp) return;

    const scheduleLines = () => {
      if (linesRafRef.current) cancelAnimationFrame(linesRafRef.current);
      linesRafRef.current = requestAnimationFrame(() => {
        linesRafRef.current = 0;
        recomputeLines();
      });
    };

    const bump = () => {
      syncViewportCamera();
      scheduleLines();
    };

    let rafBump = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafBump);
      rafBump = requestAnimationFrame(bump);
    });

    ro.observe(vp);
    if (inner) ro.observe(inner);
    window.addEventListener("resize", bump);

    bump();

    return () => {
      cancelAnimationFrame(rafBump);
      ro.disconnect();
      window.removeEventListener("resize", bump);
      if (linesRafRef.current) cancelAnimationFrame(linesRafRef.current);
    };
  }, [syncViewportCamera, recomputeLines]);

  const panDragRef = useRef(pan);
  panDragRef.current = pan;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheelBlock = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener("wheel", onWheelBlock, { passive: false });
    return () => el.removeEventListener("wheel", onWheelBlock);
  }, []);

  const applyWheelZoom = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const vp = viewportRef.current;
      if (!vp || tasks.length === 0) return;
      const m = readCameraMetrics();
      if (!m) return;
      const { zFit } = m;
      const factor = e.deltaY > 0 ? 1 / ZOOM_WHEEL_STEP : ZOOM_WHEEL_STEP;
      const rOld = zoomRelRef.current;
      const rNew = Math.min(ZOOM_REL_MAX, Math.max(ZOOM_REL_MIN, rOld * factor));
      if (Math.abs(rNew - rOld) < 1e-6) return;
      const zOld = Math.min(Math.max(zFit * rOld, AUTO_FIT_MIN_ZOOM), zFit * ZOOM_REL_MAX);
      const zNew = Math.min(Math.max(zFit * rNew, AUTO_FIT_MIN_ZOOM), zFit * ZOOM_REL_MAX);
      const vr = vp.getBoundingClientRect();
      const lx = (e.clientX - vr.left - panRef.current.x) / zOld;
      const ly = (e.clientY - vr.top - panRef.current.y) / zOld;
      setZoomRel(rNew);
      setPan({ x: e.clientX - vr.left - lx * zNew, y: e.clientY - vr.top - ly * zNew });
    },
    [readCameraMetrics, tasks.length],
  );

  const startPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const middle = e.button === 1;
    if (!middle && e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (!middle) {
      if (t.closest("[data-roadmap-node]")) return;
      if (t.closest("button, a, input, textarea, select, label")) return;
    } else {
      e.preventDefault();
    }
    const p = panDragRef.current;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: p.x, py: p.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const movePan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setPan({ x: d.px + e.clientX - d.sx, y: d.py + e.clientY - d.sy });
  }, []);

  const endPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const zoomByRel = useCallback(
    (factor: number) => {
      const m = readCameraMetrics();
      if (!m || tasks.length === 0) return;
      const { vpW, vpH, zFit } = m;
      const rOld = zoomRelRef.current;
      const rNew = Math.min(ZOOM_REL_MAX, Math.max(ZOOM_REL_MIN, rOld * factor));
      if (Math.abs(rNew - rOld) < 1e-6) return;
      const zOld = Math.min(Math.max(zFit * rOld, AUTO_FIT_MIN_ZOOM), zFit * ZOOM_REL_MAX);
      const zNew = Math.min(Math.max(zFit * rNew, AUTO_FIT_MIN_ZOOM), zFit * ZOOM_REL_MAX);
      const cx = vpW / 2;
      const cy = vpH / 2;
      const lx = (cx - panRef.current.x) / zOld;
      const ly = (cy - panRef.current.y) / zOld;
      setZoomRel(rNew);
      setPan({ x: cx - lx * zNew, y: cy - ly * zNew });
    },
    [readCameraMetrics, tasks.length],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 light:text-zinc-600">
        <span className="hidden sm:inline">
          <strong className="font-medium text-neutral-400 light:text-zinc-700">Ctrl + rueda</strong> zoom; arrastra el fondo vacío para mover la cámara sin límites (también puedes dejar el diagrama fuera del marco).{" "}
          <strong className="font-medium text-neutral-400 light:text-zinc-700">Botón central</strong> arrastra desde cualquier sitio. <strong className="font-medium text-neutral-400 light:text-zinc-700">Encajar</strong> centra el encaje completo.
        </span>
        <span className="sm:hidden">
          Ctrl+rueda · Arrastra fondo · Rueda central=mover · Encajar.
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <Button type="button" variant="secondary" className="!mt-0 px-2 py-1 text-xs" onClick={() => zoomByRel(1 / ZOOM_WHEEL_STEP)}>
            −
          </Button>
          <Button type="button" variant="secondary" className="!mt-0 px-2 py-1 text-xs" onClick={() => zoomByRel(ZOOM_WHEEL_STEP)}>
            +
          </Button>
          <Button type="button" variant="secondary" className="!mt-0 px-2 py-1 text-xs" onClick={fitDiagram}>
            Encajar
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="roadmap-diagram-viewport relative max-h-[min(78vh,900px)] min-h-[320px] touch-none overflow-hidden rounded-xl border border-neutral-800 bg-black/20 light:border-zinc-300 light:bg-zinc-100/50"
        onWheel={applyWheelZoom}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <RoadmapRegistryContext.Provider value={registerNode}>
          <div
            ref={innerRef}
            className="relative z-10 inline-block min-w-max origin-top-left p-8 md:p-12"
            style={{
              transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})`,
            }}
          >
            <svg
              ref={svgRef}
              className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
              aria-hidden
            >
              <path
                ref={connectorPathRef}
                fill="none"
                stroke="rgba(212, 175, 55, 0.55)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="light:stroke-[rgba(184,146,42,0.65)]"
              />
            </svg>
            <div ref={contentMeasureRef} className="relative z-10">
              <DiagramForest tasks={tasks} handlers={handlers} />
            </div>
          </div>
        </RoadmapRegistryContext.Provider>
      </div>
    </div>
  );
}
