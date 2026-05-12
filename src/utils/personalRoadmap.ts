/** Distribución de hijos cuando hay varias ramas (organigrama). */
export const BRANCH_LAYOUT_IDS = ["classic", "vertical", "horizontal", "grid"] as const;
export type BranchLayout = (typeof BRANCH_LAYOUT_IDS)[number];

export const DEFAULT_BRANCH_LAYOUT: BranchLayout = "classic";

/** Opciones preset para el selector en el diagrama (organigramas típicos). */
export const BRANCH_LAYOUT_OPTIONS: readonly { id: BranchLayout; label: string }[] = [
  { id: "classic", label: "Filas centradas — lo más habitual" },
  { id: "vertical", label: "Columna vertical" },
  { id: "horizontal", label: "Fila horizontal continua (desliza si no cabe)" },
  { id: "grid", label: "Rejilla que se adapta" },
] as const;

export function isBranchLayout(x: unknown): x is BranchLayout {
  return typeof x === "string" && (BRANCH_LAYOUT_IDS as readonly string[]).includes(x);
}

export type RoadmapTask = {
  id: string;
  title: string;
  done: boolean;
  /** Cómo ordenar hijos si hay más de uno. Sin valor → `classic`. */
  branchLayout?: BranchLayout;
  children: RoadmapTask[];
};

export const PERSONAL_ROADMAP_STORAGE_KEY = "goi:personalRoadmap:v1";

export function newRoadmapTask(title: string): RoadmapTask {
  return {
    id: crypto.randomUUID(),
    title,
    done: false,
    children: [],
  };
}

export function loadRoadmap(): RoadmapTask[] {
  try {
    const raw = localStorage.getItem(PERSONAL_ROADMAP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRoadmapTaskNode);
  } catch {
    return [];
  }
}

/** Valida y filtra un array de nodos (p. ej. respuesta API). */
export function parseRoadmapTasksPayload(parsed: unknown): RoadmapTask[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isRoadmapTaskNode);
}

function isRoadmapTaskNode(x: unknown): x is RoadmapTask {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.title !== "string" ||
    typeof o.done !== "boolean" ||
    !Array.isArray(o.children) ||
    !o.children.every(isRoadmapTaskNode)
  ) {
    return false;
  }
  if (o.branchLayout !== undefined && !isBranchLayout(o.branchLayout)) return false;
  return true;
}

export function saveRoadmap(tasks: RoadmapTask[]): void {
  try {
    localStorage.setItem(PERSONAL_ROADMAP_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore quota / private mode */
  }
}

export function mapRoadmapTasks(
  tasks: RoadmapTask[],
  id: string,
  fn: (t: RoadmapTask) => RoadmapTask,
): RoadmapTask[] {
  return tasks.map((t) => {
    if (t.id === id) return fn(t);
    return { ...t, children: mapRoadmapTasks(t.children, id, fn) };
  });
}

export function filterRemoveTask(tasks: RoadmapTask[], id: string): RoadmapTask[] {
  return tasks
    .filter((t) => t.id !== id)
    .map((t) => ({ ...t, children: filterRemoveTask(t.children, id) }));
}

export function appendChild(tasks: RoadmapTask[], parentId: string | null, child: RoadmapTask): RoadmapTask[] {
  if (parentId === null) return [...tasks, child];
  return tasks.map((t) =>
    t.id === parentId
      ? { ...t, children: [...t.children, child] }
      : { ...t, children: appendChild(t.children, parentId, child) },
  );
}
