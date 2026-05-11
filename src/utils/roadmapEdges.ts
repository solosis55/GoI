import { DEFAULT_BRANCH_LAYOUT, type BranchLayout, type RoadmapTask } from "./personalRoadmap";

/** Aristas padre → hijo para dibujar conectores SVG. */
export function collectRoadmapEdges(tasks: RoadmapTask[]): { from: string; to: string }[] {
  return collectRoadmapEdgesDetailed(tasks).map(({ from, to }) => ({ from, to }));
}

export type RoadmapEdgeDetailed = {
  from: string;
  to: string;
  /** `null` cuando el padre solo tiene un hijo (cadena vertical). */
  parentMultiLayout: BranchLayout | null;
};

/** Incluye distribución del padre si tiene varios hijos (para trazo de líneas agrupadas). */
export function collectRoadmapEdgesDetailed(tasks: RoadmapTask[]): RoadmapEdgeDetailed[] {
  const edges: RoadmapEdgeDetailed[] = [];

  function walk(node: RoadmapTask) {
    const multi = node.children.length >= 2;
    const lay: BranchLayout | null = multi ? (node.branchLayout ?? DEFAULT_BRANCH_LAYOUT) : null;

    for (const c of node.children) {
      edges.push({
        from: node.id,
        to: c.id,
        parentMultiLayout: lay,
      });
      walk(c);
    }
  }

  for (const t of tasks) walk(t);
  return edges;
}
