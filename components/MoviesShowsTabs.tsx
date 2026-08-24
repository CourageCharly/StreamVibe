"use client";

import { useEffect, useState } from "react";
import {
  restoreScrollFor,
  shouldRestoreScroll,
} from "@/lib/nav-history";

type Tab = "movies" | "shows";

/** Keep in sync with prepareLeaveForDetail in lib/nav-history.ts */
const TAB_KEY = "sv-movies-shows-tab";

type Props = {
  movies: React.ReactNode;
  shows: React.ReactNode;
  /** Pulse the Movies / Shows switcher instead of live labels */
  skeleton?: boolean;
};

function readTab(): Tab {
  if (typeof window === "undefined") return "movies";
  try {
    const v = sessionStorage.getItem(TAB_KEY);
    return v === "shows" ? "shows" : "movies";
  } catch {
    return "movies";
  }
}

/**
 * Mobile: full-width Movies / Shows switcher (matches frame width).
 * Desktop: both sections always visible; tabs hidden.
 * Active tab is remembered so detail "back" returns to the same section.
 */
export default function MoviesShowsTabs({
  movies,
  shows,
  skeleton = false,
}: Props) {
  const [tab, setTab] = useState<Tab>("movies");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTab(readTab());
    setReady(true);
  }, []);

  // After Movies/Shows tab paints, re-apply section scroll (detail back)
  useEffect(() => {
    if (!ready || !shouldRestoreScroll()) return;
    const path = `${window.location.pathname}${window.location.search}`;
    const ids = [0, 100, 280].map((ms) =>
      window.setTimeout(() => restoreScrollFor(path), ms),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [ready, tab]);

  const select = (next: Tab) => {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Avoid flashing wrong tab on mobile before session restore
  const active = ready ? tab : "movies";

  return (
    <div className="movies-section-stack flex w-full min-w-0 flex-col gap-14 sm:gap-16 lg:gap-[120px]">
      <div className="w-full lg:hidden">
        {skeleton ? (
          <div
            className="flex w-full items-center gap-1 rounded-xl border-[3px] border-[#1F1F1F] bg-navbar p-1"
            aria-hidden
          >
            <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-[#1A1A1A]" />
            <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-[#1A1A1A]" />
          </div>
        ) : (
          <div
            className="flex w-full items-center rounded-xl border-[3px] border-[#1F1F1F] bg-navbar p-1"
            role="tablist"
            aria-label="Movies or Shows"
          >
            {(
              [
                { id: "movies", label: "Movies" },
                { id: "shows", label: "Shows" },
              ] as const
            ).map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => select(item.id)}
                  className={`min-w-0 flex-1 cursor-pointer rounded-lg py-2 text-center text-[14px] font-semibold transition-colors sm:py-2.5 ${
                    isActive
                      ? "bg-pill-active text-white"
                      : "text-[#999999] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile: active tab only · Desktop: both always shown, with extra gap between Movies & Shows */}
      <div
        className={`w-full min-w-0 ${active === "movies" ? "block" : "hidden lg:block"}`}
      >
        {movies}
      </div>
      <div
        className={`w-full min-w-0 ${active === "shows" ? "block" : "hidden lg:block"}`}
      >
        {shows}
      </div>
    </div>
  );
}
