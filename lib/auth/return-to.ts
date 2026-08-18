const KEY = "sv:return-to";

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
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
