export type MovieNotice = {
  id: string;
  title: string;
  body: string;
  at: string;
  unread: boolean;
  href: string;
  kind:
    | "episode"
    | "watchlist"
    | "coming"
    | "continue"
    | "trailer"
    | "recommend"
    | "review"
    | "like";
};

const READ_KEY = "streamvibe:notice-read";
const USER_KEY = "streamvibe:user-notices";
const DELETED_KEY = "streamvibe:notice-deleted";
export const NOTICE_EVENT = "streamvibe:notices";

export const MOVIE_NOTICES: MovieNotice[] = [
  {
    id: "n1",
    title: "New episode available",
    body: "The latest episode of a series on your list is ready to watch.",
    at: "2h ago",
    unread: true,
    href: "/movies",
    kind: "episode",
  },
  {
    id: "n2",
    title: "Continue watching",
    body: "Pick up where you left off. You have 28 minutes remaining.",
    at: "5h ago",
    unread: true,
    href: "/history",
    kind: "continue",
  },
  {
    id: "n3",
    title: "On your list — now streaming",
    body: "A title you saved is available to play.",
    at: "Yesterday",
    unread: true,
    href: "/list",
    kind: "watchlist",
  },
  {
    id: "n4",
    title: "Coming this week",
    body: "A new release you may like premieres Friday.",
    at: "Yesterday",
    unread: false,
    href: "/movies?category=upcoming",
    kind: "coming",
  },
  {
    id: "n5",
    title: "New trailer",
    body: "A trailer dropped for a title similar to what you watch.",
    at: "2d ago",
    unread: false,
    href: "/movies?category=popular",
    kind: "trailer",
  },
  {
    id: "n6",
    title: "Recommended for you",
    body: "Based on your recent watches, we found something new.",
    at: "3d ago",
    unread: false,
    href: "/movies?category=top_rated",
    kind: "recommend",
  },
];

function emitNotices() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTICE_EVENT));
}

function readUserNotices(): MovieNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MovieNotice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getReadNoticeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function getDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function getAllNotices(): MovieNotice[] {
  const read = new Set(getReadNoticeIds());
  const deleted = new Set(getDeletedIds());
  return [...readUserNotices(), ...MOVIE_NOTICES]
    .filter((n) => !deleted.has(n.id))
    .map((n) => ({
      ...n,
      unread: !read.has(n.id) && n.unread,
    }));
}

export function addMovieNotice(input: {
  title: string;
  body: string;
  href: string;
  kind?: MovieNotice["kind"];
}) {
  if (typeof window === "undefined") return;
  const notice: MovieNotice = {
    id: `u-${Date.now()}`,
    title: input.title,
    body: input.body,
    href: input.href,
    kind: input.kind ?? "watchlist",
    unread: true,
    at: "Just now",
  };
  try {
    const next = [notice, ...readUserNotices()].slice(0, 40);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function markNoticeRead(id: string) {
  const next = Array.from(new Set([...getReadNoticeIds(), id]));
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function markAllNoticesRead(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function deleteNotice(id: string) {
  if (typeof window === "undefined") return;
  try {
    const user = readUserNotices().filter((n) => n.id !== id);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    const deleted = Array.from(new Set([...getDeletedIds(), id]));
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function getUnreadNoticeCount(): number {
  return getAllNotices().filter((n) => n.unread).length;
}
