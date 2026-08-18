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
    | "recommend";
};

const KEY = "streamvibe:notice-read";

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

export function getReadNoticeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markNoticeRead(id: string) {
  const next = Array.from(new Set([...getReadNoticeIds(), id]));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function markAllNoticesRead(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* quota */
  }
}

export function getUnreadNoticeCount(): number {
  const read = getReadNoticeIds();
  return MOVIE_NOTICES.filter((n) => n.unread && !read.includes(n.id)).length;
}
