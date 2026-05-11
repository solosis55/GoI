import type { Request, Response } from "express";
import { readPersonalRoadmapFileRaw, writePersonalRoadmapFileRaw } from "../services/personalRoadmapFile.js";

const BRANCH_LAYOUT_IDS = ["classic", "vertical", "horizontal", "grid"] as const;

function isBranchLayout(x: unknown): x is (typeof BRANCH_LAYOUT_IDS)[number] {
  return typeof x === "string" && (BRANCH_LAYOUT_IDS as readonly string[]).includes(x);
}

type RoadmapTaskNode = {
  id: string;
  title: string;
  done: boolean;
  branchLayout?: (typeof BRANCH_LAYOUT_IDS)[number];
  children: RoadmapTaskNode[];
};

function isRoadmapTaskNode(x: unknown): x is RoadmapTaskNode {
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

function sanitizeTasks(input: unknown): RoadmapTaskNode[] | null {
  if (!Array.isArray(input)) return null;
  const out = input.filter(isRoadmapTaskNode);
  return out.length === input.length ? out : null;
}

/** GET /api/personal-roadmap — lectura para el diagrama del roadmap personal (sin auth). */
export function getPersonalRoadmap(_req: Request, res: Response) {
  const raw = readPersonalRoadmapFileRaw();
  if (!raw) {
    res.json({ tasks: [] });
    return;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object") {
      res.json({ tasks: [] });
      return;
    }
    const tasks = (parsed as { tasks?: unknown }).tasks;
    const loose = Array.isArray(tasks) ? tasks.filter(isRoadmapTaskNode) : [];
    res.json({ tasks: loose });
  } catch {
    res.status(500).json({ code: "ROADMAP_CORRUPT", message: "No se pudo leer el archivo del roadmap." });
  }
}

/** PUT /api/personal-roadmap — guardado en disco del proyecto (desarrollo local). */
export function putPersonalRoadmap(req: Request, res: Response) {
  const body = req.body as { tasks?: unknown };
  const sanitized = sanitizeTasks(body?.tasks);
  if (sanitized === null) {
    res.status(400).json({
      code: "ROADMAP_INVALID",
      message: "El cuerpo debe ser un JSON { tasks: [...] } con nodos válidos.",
    });
    return;
  }

  try {
    const json = JSON.stringify({ tasks: sanitized }, null, 2);
    writePersonalRoadmapFileRaw(json);
    res.json({ ok: true, tasks: sanitized });
  } catch {
    res.status(500).json({ code: "ROADMAP_WRITE_FAILED", message: "No se pudo escribir el archivo del roadmap." });
  }
}
