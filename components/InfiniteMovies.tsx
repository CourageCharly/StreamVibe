"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TrendingMovieCard from "@/components/TrendingMovieCard";
import type { CatalogListResponse, Movie } from "@/lib/types";

type Props = {
  initial: Movie[];
  category?: string;
  query?: string;
  initialPage?: number;
  totalPages?: number;
  /** movies (default) or shows — picks API + same card layout */
  kind?: "movies" | "shows";
  /** Match Trending Now cards (default true for genre pages) */
  showRuntime?: boolean;
  showRating?: boolean;
};

/**
 * Infinite genre/search listing — cards match Trending Now layout.
 * Works for movies (`/api/movies`) and shows (`/api/shows`).
 */
export default function InfiniteMovies({
  initial,
  category,
  query = "",
  initialPage = 1,
  totalPages = 1,
  kind = "movies",
  showRuntime = true,
  showRating = false,
}: Props) {
  const [movies, setMovies] = useState<Movie[]>(initial);
  const [page, setPage] = useState(initialPage);
  const [maxPages, setMaxPages] = useState(totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMovies(initial);
    setPage(initialPage);
    setMaxPages(totalPages);
    setError("");
  }, [initial, initialPage, totalPages, category, query, kind]);

  const loadMore = useCallback(async () => {
    if (loading || page >= maxPages) return;
    setLoading(true);
    setError("");
    try {
      const next = page + 1;
      const params = new URLSearchParams({ page: String(next) });
      if (query && kind === "movies") params.set("q", query);
      else params.set("category", category || "popular");

      const endpoint =
        kind === "shows" ? `/api/shows?${params}` : `/api/movies?${params}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to load more");
      const data = (await res.json()) as CatalogListResponse;

      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const extra = data.results.filter((m) => !seen.has(m.id));
        return [...prev, ...extra];
      });
      setPage(data.page);
      setMaxPages(data.total_pages || maxPages);
    } catch {
      setError("Could not load more titles. Try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, page, maxPages, category, query, kind]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "240px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  if (!movies.length && !loading) {
    return (
      <div className="rounded-xl border border-[#262626] bg-[#0F0F0F] px-6 py-16 text-center">
        <p className="text-[16px] font-medium text-white sm:text-[18px]">
          No Movies/Shows found
        </p>
        <p className="mt-2 text-[14px] text-[#999999]">
          {query
            ? "We couldn't find any movie/show that matches your search."
            : "No titles found."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Same card style as Trending Now — 4 per row; generous row gap */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
        {movies.map((movie) => (
          <TrendingMovieCard
            key={movie.id}
            movie={movie}
            fluid
            showRuntime={showRuntime}
            showRating={showRating}
            mediaKind={kind === "shows" ? "tv" : "movie"}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      <div className="py-8 text-center text-sm text-[#999999]">
        {loading ? "Loading more…" : null}
        {error ? <p className="text-cta">{error}</p> : null}
        {!loading && page >= maxPages && movies.length > 0 ? (
          <p>You&apos;ve reached the end.</p>
        ) : null}
      </div>
    </div>
  );
}
