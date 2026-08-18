"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import TrendingMovieCard from "@/components/TrendingMovieCard";
import EmptyCatalog from "@/components/EmptyCatalog";
import AccountBack from "@/components/AccountBack";
import { getLikes, getMyList } from "@/lib/user-lists";
import type { Movie } from "@/lib/types";

export default function ListPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <ListInner />
      </Suspense>
    </RequireAuth>
  );
}

function ListInner() {
  const view = useSearchParams().get("view");
  const ratingsOnly = view === "ratings";
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = ratingsOnly ? getLikes() : getMyList();
    if (!ids.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/movies/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    ).then((rows) => {
      setItems(rows.filter(Boolean) as Movie[]);
      setLoading(false);
    });
  }, [ratingsOnly]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <AccountBack />
        <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          {ratingsOnly ? "Ratings" : "My List / Favorites"}
        </h1>
        <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
          {ratingsOnly
            ? "Titles you have rated."
            : "Titles you save to watch later."}
        </p>
        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-[#1A1A1A]"
                style={{ aspectRatio: "285 / 317" }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyCatalog
            message={
              ratingsOnly
                ? "Rate a title and it will show up here."
                : "Add movies and shows to your list and they will appear here."
            }
          />
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
            {items.map((movie) => (
              <TrendingMovieCard
                key={movie.id}
                movie={movie}
                fluid
                showRuntime
                showRating={ratingsOnly}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
