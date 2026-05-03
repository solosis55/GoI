const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/api" : "http://localhost:4000/api");
const AUTH_STORAGE_KEY = "fit-social-auth";
const AUTH_EXPIRED_EVENT = "auth:expired";

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function shouldExpireSession(status: number, code: string) {
  return status === 401 || code === "AUTH_UNAUTHORIZED" || code === "AUTH_TOKEN_INVALID";
}

function getStoredToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    const apiError = new ApiError(data.message ?? "Unexpected API error", response.status, data.code ?? "API_ERROR");
    if (shouldExpireSession(apiError.status, apiError.code)) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    throw apiError;
  }

  return data;
}

export { AUTH_EXPIRED_EVENT };
