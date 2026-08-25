const KEY = "streamvibe:account-proofs";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export function rememberAccountProof(email: string, proof: string) {
  if (typeof window === "undefined" || !email || !proof) return;
  try {
    const next = readMap();
    next[email.trim().toLowerCase()] = proof;
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function getAccountProof(email: string): string | null {
  if (typeof window === "undefined" || !email) return null;
  return readMap()[email.trim().toLowerCase()] || null;
}
