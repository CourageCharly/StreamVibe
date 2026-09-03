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
import DailyLimitModal from "@/components/DailyLimitModal";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DAILY_WATCH_LIMIT,
  getWatchLog,
  hasActiveSubscription,
  recordWatchStart,
} from "@/lib/subscription";

type WatchLimitContextValue = {
  tryWatch: (id: number, kind: "movie" | "tv") => boolean;
};

const WatchLimitContext = createContext<WatchLimitContextValue | null>(null);

const DAY_MS = 24 * 60 * 60 * 1000;

export function WatchLimitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [limitOpen, setLimitOpen] = useState(false);
  const [played, setPlayed] = useState<string[]>([]);
  const [resetAt, setResetAt] = useState(0);

  useEffect(() => {
    const log = getWatchLog(userId);
    setPlayed(log.ids);
    setResetAt(log.resetAt);
  }, [userId]);

  const tryWatch = useCallback(
    (id: number, kind: "movie" | "tv") => {
      if (hasActiveSubscription(userId)) return true;
      const key = `${kind}:${id}`;
      const now = Date.now();
      const list = resetAt > now ? played : [];
      if (list.includes(key)) return true;
      if (list.length >= DAILY_WATCH_LIMIT) {
        setLimitOpen(true);
        return false;
      }
      const nextReset = list.length === 0 ? now + DAY_MS : resetAt;
      const next = [...list, key];
      setPlayed(next);
      setResetAt(nextReset);
      recordWatchStart(id, kind, userId);
      return true;
    },
    [userId, played, resetAt],
  );

  const value = useMemo(() => ({ tryWatch }), [tryWatch]);

  return (
    <WatchLimitContext.Provider value={value}>
      {children}
      <DailyLimitModal open={limitOpen} onClose={() => setLimitOpen(false)} />
    </WatchLimitContext.Provider>
  );
}

export function useWatchLimit() {
  const ctx = useContext(WatchLimitContext);
  if (!ctx) {
    throw new Error("useWatchLimit must be used within WatchLimitProvider");
  }
  return ctx;
}
