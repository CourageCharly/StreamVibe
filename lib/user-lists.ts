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

export type HistoryItem = {
  id: number;
  title: string;
  path: string;
  at: number;
};

const HISTORY_KEY = "streamvibe:watch-history";

export function getWatchHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HistoryItem =>
        item &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.title === "string" &&
        typeof item.path === "string",
    );
  } catch {
    return [];
  }
}

export function addWatchHistory(item: Omit<HistoryItem, "at">) {
  if (typeof window === "undefined") return;
  try {
    const current = getWatchHistory().filter(
      (row) => row.id !== item.id || row.path !== item.path,
    );
    const next = [{ ...item, at: Date.now() }, ...current].slice(0, 40);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

/** Returns new list after toggle */
export function toggleMyList(id: number, title?: string): number[] {
  const current = getMyList();
  const adding = !current.includes(id);
  const next = adding
    ? [...current, id]
    : current.filter((x) => x !== id);
  writeIds(MY_LIST_KEY, next);
  if (adding && typeof window !== "undefined") {
    const label = title?.trim() || "A title";
    void import("@/lib/notifications").then(({ addMovieNotice }) => {
      addMovieNotice({
        title: "Added to your list",
        body: `${label} was saved to My List.`,
        href: "/list",
        kind: "watchlist",
      });
    });
  }
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
