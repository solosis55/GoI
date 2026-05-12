import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const DEFAULT_JWT_SECRET = "dev-jwt-secret-change-in-production";

type AuthTokenPayload = {
  sub: string;
};

/**
 * En Vercel (`VERCEL`), si no defines `JWT_SECRET` en el dashboard, usamos un secreto
 * derivado de variables que Vercel inyecta (`VERCEL_URL`, etc.) para que el login funcione
 * en demos Hobby. **No sustituye** definir `JWT_SECRET` para datos reales o dominio propio.
 */
function vercelAutoJwtSecret(): string {
  const url = process.env.VERCEL_URL ?? "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
  return `goi-vercel-auto|${url}|${sha}`;
}

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.VERCEL) return vercelAutoJwtSecret();
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return DEFAULT_JWT_SECRET;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(userId: string) {
  return jwt.sign({ sub: userId } satisfies AuthTokenPayload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  return payload.sub;
}

