/** Client-side My List / Likes (localStorage). */

const MY_LIST_KEY = "streamvibe:my-list";
const LIKES_KEY = "streamvibe:likes";

function readIds(key: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

export function getMyList(): number[] {
  return readIds(MY_LIST_KEY);
}

export function getLikes(): number[] {
  return readIds(LIKES_KEY);
}

/** Returns new list after toggle */
export function toggleMyList(id: number): number[] {
  const current = getMyList();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  writeIds(MY_LIST_KEY, next);
  return next;
}

export function toggleLike(id: number): number[] {
  const current = getLikes();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  writeIds(LIKES_KEY, next);
  return next;
}
