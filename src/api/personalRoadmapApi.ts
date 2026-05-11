import { apiFetch } from "./client";
import { parseRoadmapTasksPayload, type RoadmapTask } from "../utils/personalRoadmap";

export type PersonalRoadmapResponse = {
  tasks: RoadmapTask[];
};

/** Última copia persistida en `server/data/personal-roadmap.json` cuando el backend está en marcha. */
export async function fetchPersonalRoadmap(): Promise<RoadmapTask[] | null> {
  try {
    const data = await apiFetch<PersonalRoadmapResponse>("/personal-roadmap");
    return parseRoadmapTasksPayload(data.tasks);
  } catch {
    return null;
  }
}

export async function savePersonalRoadmap(tasks: RoadmapTask[]): Promise<boolean> {
  try {
    await apiFetch<PersonalRoadmapResponse>("/personal-roadmap", {
      method: "PUT",
      body: JSON.stringify({ tasks }),
    });
    return true;
  } catch {
    return false;
  }
}
