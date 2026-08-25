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
import { rememberAccountProof } from "@/lib/auth/account-proof";
import { NOTICE_EVENT } from "@/lib/notifications";
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
      const data = (await res.json()) as {
        user: AuthUser | null;
        accountProof?: string;
      };
      const next = data.user ?? null;
      setUser(next);
      setStatus(next ? "authenticated" : "anonymous");
      setActiveListUser(next?.id ?? null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(NOTICE_EVENT));
      }
      if (next?.email && data.accountProof) {
        rememberAccountProof(next.email, data.accountProof);
      }
      return next;
    } catch {
      setUser(null);
      setStatus("anonymous");
      setActiveListUser(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(NOTICE_EVENT));
      }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(NOTICE_EVENT));
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: AuthUser | null; accountProof?: string }) => {
        if (cancelled) return;
        const next = data.user ?? null;
        setUser(next);
        setStatus(next ? "authenticated" : "anonymous");
        setActiveListUser(next?.id ?? null);
        window.dispatchEvent(new Event(NOTICE_EVENT));
        if (next?.email && data.accountProof) {
          rememberAccountProof(next.email, data.accountProof);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
        setActiveListUser(null);
        window.dispatchEvent(new Event(NOTICE_EVENT));
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
