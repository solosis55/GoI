import { useCallback, useContext } from "react";
import { RoadmapRegistryContext } from "../components/roadmap/roadmapRegistryContext";

/** Ref callback estable por `task.id` para registrar cada tarjeta en el contexto del diagrama. */
export function useRegisterRoadmapNode(id: string) {
  const register = useContext(RoadmapRegistryContext);
  return useCallback((el: HTMLElement | null) => register(id, el), [id, register]);
}
