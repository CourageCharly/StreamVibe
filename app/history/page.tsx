"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import AccountCatalogSkeleton from "@/components/skeletons/AccountCatalogSkeleton";
import EmptyCatalog from "@/components/EmptyCatalog";
import AccountBack from "@/components/AccountBack";
import MoviesShowsTabs from "@/components/MoviesShowsTabs";
import SectionFrame from "@/components/SectionFrame";
import CatalogPosterGrid, {
  CatalogPosterSkeletonGrid,
} from "@/components/CatalogPosterGrid";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LISTS_EVENT,
  getWatchHistory,
  historyKind,
  setActiveListUser,
} from "@/lib/user-lists";
import type { Movie } from "@/lib/types";

type Bucket = { movies: Movie[]; shows: Movie[] };

async function fetchItem(id: number, kind: "movie" | "tv"): Promise<Movie | null> {
  const path = kind === "tv" ? `/api/shows/${id}` : `/api/movies/${id}`;
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as Movie;
  } catch {
    return null;
  }
}

export default function HistoryPage() {
  return (
    <RequireAuth fallback={<AccountCatalogSkeleton />}>
      <HistoryInner />
    </RequireAuth>
  );
}

function HistoryInner() {
  const { user } = useAuth();
  const [bucket, setBucket] = useState<Bucket>({ movies: [], shows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) setActiveListUser(user.id);
    let cancelled = false;

    function load() {
      const rows = getWatchHistory();
      if (!rows.length) {
        setBucket({ movies: [], shows: [] });
        setLoading(false);
        return;
      }
      Promise.all(
        rows.map(async (item) => ({
          kind: historyKind(item),
          movie: await fetchItem(item.id, historyKind(item)),
        })),
      ).then((loaded) => {
        if (cancelled) return;
        const movies: Movie[] = [];
        const shows: Movie[] = [];
        for (const row of loaded) {
          if (!row.movie) continue;
          if (row.kind === "tv") shows.push(row.movie);
          else movies.push(row.movie);
        }
        setBucket({ movies, shows });
        setLoading(false);
      });
    }

    load();
    window.addEventListener(LISTS_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(LISTS_EVENT, load);
    };
  }, [user?.id]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div>
          <AccountBack />
          <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
            Watch History
          </h1>
          <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
            Movies you have played and shows you have played.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16">
          <MoviesShowsTabs
            skeleton={loading}
            movies={
              <SectionFrame tag="Movies" skeleton={loading}>
                {loading ? (
                  <CatalogPosterSkeletonGrid />
                ) : bucket.movies.length === 0 ? (
                  <EmptyCatalog
                    title="No Movies found"
                    message="Movies you play will appear here."
                  />
                ) : (
                  <CatalogPosterGrid movies={bucket.movies} kind="movie" />
                )}
              </SectionFrame>
            }
            shows={
              <SectionFrame tag="Shows" skeleton={loading}>
                {loading ? (
                  <CatalogPosterSkeletonGrid />
                ) : bucket.shows.length === 0 ? (
                  <EmptyCatalog
                    title="No Shows found"
                    message="Shows you play will appear here."
                  />
                ) : (
                  <CatalogPosterGrid movies={bucket.shows} kind="tv" />
                )}
              </SectionFrame>
            }
          />
        </div>
      </div>
    </div>
  );
}
