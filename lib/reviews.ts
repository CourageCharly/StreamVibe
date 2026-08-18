import type { MovieReview } from "@/lib/types";

const KEY = "streamvibe:user-reviews";

type ReviewMap = Record<string, MovieReview[]>;

export function mediaReviewKey(mediaType: "movie" | "tv", id: number) {
  return `${mediaType}:${id}`;
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
  const seen = new Set(local.map((r) => r.id));
  return [...local, ...catalog.filter((r) => !seen.has(r.id))];
}
