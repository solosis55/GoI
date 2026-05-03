import type { Response } from "express";

export type ErrorBody = {
  code: string;
  message: string;
};

export function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ code, message } satisfies ErrorBody);
}

