/** Client-side My List / Likes / History (localStorage), scoped per account. */

export type MediaKind = "movie" | "tv";

export type CatalogRef = {
  id: number;
  kind: MediaKind;
};

export const LISTS_EVENT = "streamvibe:lists";

const MY_LIST_KEY = "streamvibe:my-list";
const LIKES_KEY = "streamvibe:likes";
const HISTORY_KEY = "streamvibe:watch-history";
const ACTIVE_USER_KEY = "streamvibe:active-user";

function emitLists() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LISTS_EVENT));
}

/** Bind list/history storage to the signed-in account. New users start at 0. */
export function setActiveListUser(userId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (userId) localStorage.setItem(ACTIVE_USER_KEY, userId);
    else localStorage.removeItem(ACTIVE_USER_KEY);
  } catch {
    /* private mode */
  }
  emitLists();
}

function scopedKey(base: string) {
  if (typeof window === "undefined") return `${base}:anon`;
  const id = localStorage.getItem(ACTIVE_USER_KEY)?.trim() || "anon";
  return `${base}:${id}`;
}

function readRefs(key: string): CatalogRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(key));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): CatalogRef | null => {
        if (typeof item === "number") return { id: item, kind: "movie" };
        if (
          item &&
          typeof item === "object" &&
          typeof (item as CatalogRef).id === "number"
        ) {
          const kind =
            (item as CatalogRef).kind === "tv" ? "tv" : "movie";
          return { id: (item as CatalogRef).id, kind };
        }
        return null;
      })
      .filter((item): item is CatalogRef => item !== null);
  } catch {
    return [];
  }
}

function writeRefs(key: string, refs: CatalogRef[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(refs));
    emitLists();
  } catch {
    /* quota / private mode */
  }
}

function sameRef(a: CatalogRef, b: CatalogRef) {
  return a.id === b.id && a.kind === b.kind;
}

export function getMyList(): number[] {
  return readRefs(MY_LIST_KEY).map((r) => r.id);
}

export function getMyListRefs(): CatalogRef[] {
  return readRefs(MY_LIST_KEY);
}

export function getLikes(): number[] {
  return readRefs(LIKES_KEY).map((r) => r.id);
}

export function getLikeRefs(): CatalogRef[] {
  return readRefs(LIKES_KEY);
}

export type HistoryItem = {
  id: number;
  title: string;
  path: string;
  at: number;
};

export function historyKind(item: HistoryItem): MediaKind {
  return item.path.includes("/shows") ? "tv" : "movie";
}

export function getWatchHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(HISTORY_KEY));
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
    localStorage.setItem(scopedKey(HISTORY_KEY), JSON.stringify(next));
    emitLists();
  } catch {
    /* quota */
  }
}

export function toggleMyList(
  id: number,
  title?: string,
  kind: MediaKind = "movie",
): number[] {
  const current = readRefs(MY_LIST_KEY);
  const ref: CatalogRef = { id, kind };
  const adding = !current.some((row) => sameRef(row, ref));
  const next = adding
    ? [...current, ref]
    : current.filter((row) => !sameRef(row, ref));
  writeRefs(MY_LIST_KEY, next);
  if (adding && typeof window !== "undefined") {
    const label = title?.trim() || (kind === "tv" ? "A show" : "A movie");
    void import("@/lib/notifications").then(({ addMovieNotice }) => {
      addMovieNotice({
        title: "Added to your list",
        body: `${label} was saved to My List.`,
        href: "/list",
        kind: "watchlist",
      });
    });
  }
  return next.map((row) => row.id);
}

export function toggleLike(
  id: number,
  kind: MediaKind = "movie",
  title?: string,
): number[] {
  const current = readRefs(LIKES_KEY);
  const ref: CatalogRef = { id, kind };
  const adding = !current.some((row) => sameRef(row, ref));
  const next = adding
    ? [...current, ref]
    : current.filter((row) => !sameRef(row, ref));
  writeRefs(LIKES_KEY, next);
  if (adding && typeof window !== "undefined") {
    const label = title?.trim() || (kind === "tv" ? "A show" : "A movie");
    const href = kind === "tv" ? `/shows/${id}` : `/movies/${id}`;
    void import("@/lib/notifications").then(({ addMovieNotice }) => {
      addMovieNotice({
        title: "You liked this title",
        body: `${label} was added to your likes.`,
        href,
        kind: "like",
      });
    });
  }
  return next.map((row) => row.id);
}
