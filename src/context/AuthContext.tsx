import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AUTH_EXPIRED_EVENT } from "../api/client";
import type { SafeUser } from "../types/auth";

type AuthState = {
  token: string | null;
  user: SafeUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: SafeUser) => void;
  updateUser: (user: SafeUser) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "fit-social-auth";

const AuthContext = createContext<AuthState | undefined>(undefined);

function getStoredAuth(): { token: string | null; user: SafeUser | null } {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };

    const parsed = JSON.parse(raw) as { token: string; user: SafeUser };
    if (!parsed?.token || !parsed?.user) return { token: null, user: null };

    return { token: parsed.token, user: parsed.user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = getStoredAuth();
  const [token, setToken] = useState<string | null>(stored.token);
  const [user, setUser] = useState<SafeUser | null>(stored.user);

  useEffect(() => {
    function handleAuthExpired() {
      setToken(null);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      setAuth(nextToken, nextUser) {
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
      },
      updateUser(nextUser) {
        setUser(nextUser);
        if (token) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: nextUser }));
        }
      },
      logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
