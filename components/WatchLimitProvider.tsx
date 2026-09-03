"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import DailyLimitModal from "@/components/DailyLimitModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { canStartWatch, recordWatchStart } from "@/lib/subscription";

type WatchLimitContextValue = {
  tryWatch: (id: number, kind: "movie" | "tv") => boolean;
};

const WatchLimitContext = createContext<WatchLimitContextValue | null>(null);

export function WatchLimitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [limitOpen, setLimitOpen] = useState(false);

  const tryWatch = useCallback(
    (id: number, kind: "movie" | "tv") => {
      if (!canStartWatch(id, kind, userId)) {
        setLimitOpen(true);
        return false;
      }
      recordWatchStart(id, kind, userId);
      return true;
    },
    [userId],
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
