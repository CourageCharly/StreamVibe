const KEY = "sv:return-to";

const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify",
  "/auth",
];

function isAuthPath(pathname: string) {
  return AUTH_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Safe in-app path to resume after login/signup.
 * Drops auth pages and unwraps nested ?returnTo= so the query cannot stack.
 */
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return "/";

  let current = value;
  for (let i = 0; i < 8; i++) {
    if (!current.startsWith("/") || current.startsWith("//")) return "/";

    const q = current.indexOf("?");
    const pathname = q === -1 ? current : current.slice(0, q);
    const search = q === -1 ? "" : current.slice(q + 1);

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
