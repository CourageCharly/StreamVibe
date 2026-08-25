const KEY = "sv:return-to";

const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify",
  "/auth",
];

/** Account screens are not a post-login resume target — Home is the default. */
const ACCOUNT_PREFIXES = [
  "/notifications",
  "/profile",
  "/settings",
  "/list",
  "/history",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isAuthPath(pathname: string) {
  return matchesPrefix(pathname, AUTH_PREFIXES);
}

function isAccountPath(pathname: string) {
  return matchesPrefix(pathname, ACCOUNT_PREFIXES);
}

/**
 * Safe in-app path to resume after login/signup.
 * Drops auth/account pages (Home is the default first screen) and unwraps
 * nested ?returnTo= so the query cannot stack. Movie/show/watch paths resume.
 */
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return "/";

  let current = value;
  for (let i = 0; i < 8; i++) {
    if (!current.startsWith("/") || current.startsWith("//")) return "/";

    const q = current.indexOf("?");
    const pathname = q === -1 ? current : current.slice(0, q);
    const search = q === -1 ? "" : current.slice(q + 1);

    if (isAccountPath(pathname)) return "/";

    if (!isAuthPath(pathname)) {
      return current.length > 2048 ? pathname : current;
    }

    const inner = new URLSearchParams(search).get("returnTo");
    if (!inner || inner === current) return "/";
    current = inner;
  }

  return "/";
}

export function rememberReturnTo(path: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, sanitizeReturnTo(path));
  } catch {
    /* private mode */
  }
}

export function readReturnTo(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  try {
    return sanitizeReturnTo(sessionStorage.getItem(KEY) ?? fallback);
  } catch {
    return fallback;
  }
}

export function clearReturnTo() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const LOGOUT_HOME_KEY = "sv:logout-home";

/** After logout, protected pages must send the user Home — not Login. */
export function markLoggedOutHome() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LOGOUT_HOME_KEY, String(Date.now()));
    sessionStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}

export function consumeLoggedOutHome() {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(LOGOUT_HOME_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(LOGOUT_HOME_KEY);
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < 4000;
  } catch {
    return false;
  }
}
