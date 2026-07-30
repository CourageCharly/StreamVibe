/**
 * In-app navigation memory.
 * Detail “back” returns to the exact page + scroll the user came from
 * (browse row, genre list, home, etc.).
 */

const RETURN_KEY = "sv-return-to";
const SCROLL_PREFIX = "sv-scroll:";
const LIST_KEY = "sv-last-list";
const RESTORE_KEY = "sv-should-restore-scroll";
const TAB_KEY = "sv-movies-shows-tab";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private / quota */
  }
}

export function currentPath(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

/** Movie or show detail / watch routes */
export function isDetailOrWatchPath(pathname: string): boolean {
  return /^\/(movies|shows)\/\d+/.test(pathname);
}

/** Catalog, home, support, subscriptions — valid “list” return targets */
function isListPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/movies" ||
    pathname === "/shows" ||
    pathname === "/support" ||
    pathname === "/subscriptions"
  ) {
    return true;
  }
  // Genre / search query pages share the same pathnames
  return false;
}

/** Save scroll for a path (when leaving for a detail page). */
export function saveScrollFor(path: string, y?: number): void {
  if (typeof window === "undefined") return;
  const top = y ?? window.scrollY ?? window.pageYOffset ?? 0;
  safeSet(SCROLL_PREFIX + path, String(Math.max(0, Math.round(top))));
}

export function getSavedScroll(path: string): number | null {
  const raw = safeGet(SCROLL_PREFIX + path);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Remember where detail-page back should go
 * (page the user was on when they opened a title).
 */
export function rememberReturnTo(path?: string): void {
  const full = path ?? currentPath();
  if (!full) return;
  const pathname = full.split("?")[0] || full;
  if (isDetailOrWatchPath(pathname) || pathname.includes("/watch")) return;

  safeSet(RETURN_KEY, full);
  if (isListPath(pathname)) {
    safeSet(LIST_KEY, full);
  }
}

/** Exact return path for detail back, or fallback. */
export function getReturnTo(fallback: string): string {
  const stored = safeGet(RETURN_KEY);
  if (!stored) return getLastListPath(fallback);

  const pathname = stored.split("?")[0] || stored;
  if (isDetailOrWatchPath(pathname) || pathname.includes("/watch")) {
    return getLastListPath(fallback);
  }
  return stored;
}

/** Call on catalog list pages. */
export function rememberListPath(fullPath?: string): void {
  const path = fullPath ?? currentPath();
  const pathname = path.split("?")[0] || path;
  if (!isListPath(pathname) || pathname.includes("/watch")) return;
  safeSet(LIST_KEY, path);
}

export function getLastListPath(fallback: string): string {
  const stored = safeGet(LIST_KEY);
  if (!stored) return fallback;
  const pathname = stored.split("?")[0] || stored;
  if (!isListPath(pathname)) return fallback;
  return stored;
}

/**
 * Before navigating to a detail page: save return path + scroll.
 * Capture-phase click handler calls this when the target is a title link.
 */
export function prepareLeaveForDetail(detailPathname?: string): void {
  if (typeof window === "undefined") return;

  const path = currentPath();
  rememberReturnTo(path);
  saveScrollFor(path);

  // Remember Movies / Shows tab when opening from catalog
  try {
    if (detailPathname?.startsWith("/shows/")) {
      sessionStorage.setItem(TAB_KEY, "shows");
    } else if (
      detailPathname?.startsWith("/movies/") &&
      window.location.pathname.startsWith("/movies")
    ) {
      sessionStorage.setItem(TAB_KEY, "movies");
    }
  } catch {
    /* ignore */
  }
}

/** Next list-page mount should restore scroll (detail back). */
export function markScrollRestore(): void {
  safeSet(RESTORE_KEY, "1");
}

export function shouldRestoreScroll(): boolean {
  return safeGet(RESTORE_KEY) === "1";
}

export function clearScrollRestore(): void {
  safeSet(RESTORE_KEY, "0");
}

/** Restore scroll after returning to a list/section page. */
export function restoreScrollFor(path: string): void {
  if (typeof window === "undefined") return;
  const y = getSavedScroll(path);
  if (y == null) return;

  const apply = () => window.scrollTo({ top: y, left: 0, behavior: "auto" });
  apply();
  requestAnimationFrame(apply);
  window.setTimeout(apply, 50);
  window.setTimeout(apply, 200);
  window.setTimeout(apply, 400);
}
