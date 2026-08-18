"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import MovieGrid from "@/components/MovieGrid";
import { getLikes, getMyList } from "@/lib/user-lists";
import type { Movie } from "@/lib/types";

export default function ListPage() {
  return (
    <RequireAuth>
      <ListInner />
    </RequireAuth>
  );
}

function ListInner() {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = Array.from(new Set([...getMyList(), ...getLikes()]));
    if (!ids.length) {
      setLoading(false);
      return;
    }
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
  }, []);

  return (
    <div className="w-full bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="py-8 sm:py-12">
        <h1 className="text-[28px] font-semibold text-white">
          My List / Favorites
        </h1>
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-xl bg-[#1A1A1A]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-4 max-w-md text-[14px] text-[#999999]">
            Titles you add to your list will appear here.{" "}
            <Link href="/movies" className="text-white hover:text-cta">
              Browse movies
            </Link>
          </p>
        ) : (
          <div className="mt-6">
            <MovieGrid movies={items} emptyMessage="No saved titles yet." />
          </div>
        )}
      </PageWrapper>
    </div>
  );
}
