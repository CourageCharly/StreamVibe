"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/auth/types";
import { setActiveListUser } from "@/lib/user-lists";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: AuthUser | null };
      const next = data.user ?? null;
      setUser(next);
      setStatus(next ? "authenticated" : "anonymous");
      setActiveListUser(next?.id ?? null);
      return next;
    } catch {
      setUser(null);
      setStatus("anonymous");
      setActiveListUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setStatus("anonymous");
      setActiveListUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: AuthUser | null }) => {
        if (cancelled) return;
        const next = data.user ?? null;
        setUser(next);
        setStatus(next ? "authenticated" : "anonymous");
        setActiveListUser(next?.id ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
        setActiveListUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, status, refresh, logout }),
    [user, status, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
