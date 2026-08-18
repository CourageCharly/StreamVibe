"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import AccountCatalogSkeleton from "@/components/skeletons/AccountCatalogSkeleton";
import EmptyCatalog from "@/components/EmptyCatalog";
import AccountBack from "@/components/AccountBack";
import MoviesShowsTabs from "@/components/MoviesShowsTabs";
import SectionFrame from "@/components/SectionFrame";
import CatalogPosterGrid, {
  CatalogPosterSkeletonGrid,
} from "@/components/CatalogPosterGrid";
import {
  getLikeRefs,
  getMyListRefs,
  type CatalogRef,
} from "@/lib/user-lists";
import type { Movie } from "@/lib/types";

type Bucket = { movies: Movie[]; shows: Movie[] };

export default function ListPage() {
  return (
    <RequireAuth fallback={<AccountCatalogSkeleton />}>
      <Suspense fallback={<AccountCatalogSkeleton />}>
        <ListInner />
      </Suspense>
    </RequireAuth>
  );
}

async function fetchRef(ref: CatalogRef): Promise<Movie | null> {
  const path = ref.kind === "tv" ? `/api/shows/${ref.id}` : `/api/movies/${ref.id}`;
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as Movie;
  } catch {
    return null;
  }
}

function ListInner() {
  const ratingsOnly = useSearchParams().get("view") === "ratings";
  const [bucket, setBucket] = useState<Bucket>({ movies: [], shows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refs = ratingsOnly ? getLikeRefs() : getMyListRefs();
    if (!refs.length) {
      setBucket({ movies: [], shows: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      refs.map(async (ref) => ({ ref, movie: await fetchRef(ref) })),
    ).then((rows) => {
      const movies: Movie[] = [];
      const shows: Movie[] = [];
      for (const row of rows) {
        if (!row.movie) continue;
        if (row.ref.kind === "tv") shows.push(row.movie);
        else movies.push(row.movie);
      }
      setBucket({ movies, shows });
      setLoading(false);
    });
  }, [ratingsOnly]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-8 py-8 sm:space-y-10 sm:py-10">
        <div>
          <AccountBack />
          <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
            {ratingsOnly ? "Ratings" : "My List / Favorites"}
          </h1>
          <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
            {ratingsOnly
              ? "Movies you have rated and shows you have rated."
              : "Movies you save and shows you save."}
          </p>
        </div>

        <MoviesShowsTabs
          movies={
            <SectionFrame tag="Movies">
              {loading ? (
                <CatalogPosterSkeletonGrid />
              ) : bucket.movies.length === 0 ? (
                <EmptyCatalog
                  title="No Movies found"
                  message={
                    ratingsOnly
                      ? "Rate a movie and it will show up here."
                      : "Movies you save will appear here."
                  }
                />
              ) : (
                <CatalogPosterGrid
                  movies={bucket.movies}
                  kind="movie"
                  showRating={ratingsOnly}
                />
              )}
            </SectionFrame>
          }
          shows={
            <SectionFrame tag="Shows">
              {loading ? (
                <CatalogPosterSkeletonGrid />
              ) : bucket.shows.length === 0 ? (
                <EmptyCatalog
                  title="No Shows found"
                  message={
                    ratingsOnly
                      ? "Rate a show and it will show up here."
                      : "Shows you save will appear here."
                  }
                />
              ) : (
                <CatalogPosterGrid
                  movies={bucket.shows}
                  kind="tv"
                  showRating={ratingsOnly}
                />
              )}
            </SectionFrame>
          }
        />
      </div>
    </div>
  );
}
