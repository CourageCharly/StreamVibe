import type { MovieReview } from "@/lib/types";
import { addMovieNotice } from "@/lib/notifications";

const KEY = "streamvibe:user-reviews";
const SUCCESS_KEY = "streamvibe:review-success";
/** Demo approval delay so users can see pending → approved + bell notice */
export const REVIEW_APPROVE_MS = 10000;

type ReviewMap = Record<string, MovieReview[]>;

export function mediaReviewKey(mediaType: "movie" | "tv", id: number) {
  return `${mediaType}:${id}`;
}

export function mediaReviewHref(mediaType: "movie" | "tv", id: number) {
  return mediaType === "tv" ? `/shows/${id}` : `/movies/${id}`;
}

export function mediaReviewWriteHref(mediaType: "movie" | "tv", id: number) {
  return `${mediaReviewHref(mediaType, id)}/review`;
}

/** One-shot flag: success is not a history entry, so browser back skips it. */
export function markReviewSuccess(href: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SUCCESS_KEY, href);
  } catch {
    /* ignore */
  }
}

export function takeReviewSuccess(href: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = sessionStorage.getItem(SUCCESS_KEY);
    if (stored !== href) return false;
    sessionStorage.removeItem(SUCCESS_KEY);
    return true;
  } catch {
    return false;
  }
}

function readAll(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReviewMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: ReviewMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function getLocalReviews(key: string): MovieReview[] {
  return readAll()[key] ?? [];
}

export function getVisibleLocalReviews(key: string): MovieReview[] {
  return getLocalReviews(key).filter((r) => r.status !== "pending");
}

export function saveLocalReview(key: string, review: MovieReview): MovieReview[] {
  const all = readAll();
  const next = [review, ...(all[key] ?? [])];
  all[key] = next;
  writeAll(all);
  return next;
}

export function mergeReviews(
  catalog: MovieReview[],
  local: MovieReview[],
): MovieReview[] {
  const visible = local.filter((r) => r.status !== "pending");
  const seen = new Set(visible.map((r) => r.id));
  return [...visible, ...catalog.filter((r) => !seen.has(r.id))];
}

export function approveDueReviews() {
  if (typeof window === "undefined") return;
  const all = readAll();
  const now = Date.now();
  let changed = false;
  for (const key of Object.keys(all)) {
    all[key] = (all[key] ?? []).map((review) => {
      if (review.status !== "pending") return review;
      if ((review.approveAt ?? 0) > now) return review;
      changed = true;
      addMovieNotice({
        title: "Review approved",
        body: `Your review for ${review.mediaTitle || "a title"} is now live.`,
        href: review.mediaHref || "/movies",
        kind: "review",
      });
      return { ...review, status: "approved" as const };
    });
  }
  if (changed) writeAll(all);
}
