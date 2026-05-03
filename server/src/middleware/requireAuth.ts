import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../services/auth.js";
import { sendError } from "../services/http.js";

function getBearerToken(authHeader: string | undefined) {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    sendError(res, 401, "AUTH_HEADER_INVALID", "missing or invalid authorization header");
    return;
  }

  try {
    res.locals.authUserId = verifyAuthToken(token);
    next();
  } catch {
    sendError(res, 401, "AUTH_TOKEN_INVALID", "invalid or expired token");
  }
}

