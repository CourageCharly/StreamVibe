export type MovieNotice = {
  id: string;
  title: string;
  body: string;
  at: number;
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

import { storageUserId } from "@/lib/user-lists";

const READ_KEY = "streamvibe:notice-read";
const USER_KEY = "streamvibe:user-notices";
const DELETED_KEY = "streamvibe:notice-deleted";
export const NOTICE_EVENT = "streamvibe:notices";

function scoped(base: string) {
  return `${base}:${storageUserId()}`;
}

/** Only notices created by a real user action (list, like, review). */

function emitNotices() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTICE_EVENT));
}

function readUserNotices(): MovieNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scoped(USER_KEY));
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
    const raw = localStorage.getItem(scoped(READ_KEY));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function getDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scoped(DELETED_KEY));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function getAllNotices(): MovieNotice[] {
  const read = new Set(getReadNoticeIds());
  const deleted = new Set(getDeletedIds());
  return readUserNotices()
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
  const kind = input.kind ?? "watchlist";
  const current = readUserNotices();
  const already = current.some(
    (n) => n.kind === kind && n.href === input.href && n.title === input.title,
  );
  if (already) return;
  const notice: MovieNotice = {
    id: `u-${Date.now()}`,
    title: input.title,
    body: input.body,
    href: input.href,
    kind,
    unread: true,
    at: Date.now(),
  };
  try {
    localStorage.setItem(
      scoped(USER_KEY),
      JSON.stringify([notice, ...current].slice(0, 40)),
    );
  } catch {
    /* quota */
  }
  emitNotices();
}

export function markNoticeRead(id: string) {
  const next = Array.from(new Set([...getReadNoticeIds(), id]));
  try {
    localStorage.setItem(scoped(READ_KEY), JSON.stringify(next));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function markAllNoticesRead(ids: string[]) {
  try {
    localStorage.setItem(
      scoped(READ_KEY),
      JSON.stringify(Array.from(new Set(ids))),
    );
  } catch {
    /* quota */
  }
  emitNotices();
}

export function deleteNotice(id: string) {
  if (typeof window === "undefined") return;
  try {
    const user = readUserNotices().filter((n) => n.id !== id);
    localStorage.setItem(scoped(USER_KEY), JSON.stringify(user));
    const deleted = Array.from(new Set([...getDeletedIds(), id]));
    localStorage.setItem(scoped(DELETED_KEY), JSON.stringify(deleted));
  } catch {
    /* quota */
  }
  emitNotices();
}

export function getUnreadNoticeCount(): number {
  return getAllNotices().filter((n) => n.unread).length;
}
