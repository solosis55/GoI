import { Request, Response } from "express";

export function getHealth(_req: Request, res: Response) {
  res.json({
    ok: true,
    service: "social-sport-backend",
    timestamp: new Date().toISOString(),
  });
}
