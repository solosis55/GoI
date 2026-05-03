import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const DEFAULT_JWT_SECRET = "dev-jwt-secret-change-in-production";

type AuthTokenPayload = {
  sub: string;
};

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
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

