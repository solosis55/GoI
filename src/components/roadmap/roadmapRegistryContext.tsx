import { createContext } from "react";

/** Registra nodos del DOM para calcular conectores SVG entre tareas del roadmap. */
export type RoadmapNodeRegistry = (id: string, el: HTMLElement | null) => void;

export const RoadmapRegistryContext = createContext<RoadmapNodeRegistry>(() => {});
