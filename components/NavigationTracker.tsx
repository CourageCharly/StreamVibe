"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  clearScrollRestore,
  currentPath,
  isDetailOrWatchPath,
  prepareLeaveForDetail,
  rememberListPath,
  restoreScrollFor,
  shouldRestoreScroll,
} from "@/lib/nav-history";

/**
 * Tracks in-app navigation:
 * - Remembers page + scroll before opening a movie/show detail
 * - Restores that scroll when returning via detail back
 */
function TrackerInner() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const full = search ? `${pathname}?${search}` : pathname;

  // Capture clicks to detail pages before Next.js navigates
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = e.target;
      if (!(el instanceof Element)) return;
      const a = el.closest("a");
      if (!a) return;

      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#")) return;

      try {
        const url = new URL(a.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (!isDetailOrWatchPath(url.pathname)) return;
        if (!isDetailOrWatchPath(window.location.pathname)) {
          prepareLeaveForDetail(url.pathname);
        }
      } catch {
        /* ignore */
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // List pages: remember path; restore scroll after detail back
  useEffect(() => {
    if (isDetailOrWatchPath(pathname)) return;

    rememberListPath(full);

    if (!shouldRestoreScroll()) return;

    const delays = [0, 80, 200, 450];
    const ids = delays.map((ms, i) =>
      window.setTimeout(() => {
        restoreScrollFor(full);
        if (i === delays.length - 1) clearScrollRestore();
      }, ms),
    );

    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [full, pathname]);

  useEffect(() => {
    if (!isDetailOrWatchPath(pathname)) {
      rememberListPath(currentPath());
    }
  }, [pathname, search]);

  return null;
}

export default function NavigationTracker() {
  return <TrackerInner />;
}
