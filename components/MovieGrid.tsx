import Link from "next/link";
import MoviePoster from "./MoviePoster";
import type { Movie } from "@/lib/types";

type Props = {
  movies: Movie[];
  emptyMessage?: string;
};

export default function MovieGrid({
  movies,
  emptyMessage = "No titles found. Check your TMDB token in .env.local.",
}: Props) {
  if (!movies.length) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-subtext">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => {
        const title = movie.title || movie.name || "Untitled";
        const year = (movie.release_date || movie.first_air_date || "").slice(
          0,
          4,
        );

        return (
          <article
            key={movie.id}
            className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition hover:border-cta/40"
          >
            <div className="relative aspect-[2/3] w-full">
              <MoviePoster
                movie={movie}
                className="absolute inset-0 h-full w-full"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="p-3">
              <h3 className="truncate text-sm font-semibold text-white">
                {title}
              </h3>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-subtext">
                <span className="tabular-nums">{year || "—"}</span>
                {movie.vote_average > 0 ? (
                  <span className="shrink-0 tabular-nums text-white/80">
                    ★ {movie.vote_average.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function CategoryPills({
  categories,
  active,
  basePath,
}: {
  categories: { key: string; name: string }[];
  active: string;
  basePath: string;
}) {
  return (
    <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible">
      {categories.map((cat) => {
        const isActive = active === cat.key;
        return (
          <Link
            key={cat.key}
            href={`${basePath}?category=${cat.key}`}
            className={`shrink-0 rounded-lg border px-4 py-2 text-[14px] font-semibold whitespace-nowrap transition ${
              isActive
                ? "border-border bg-pill-active text-white"
                : "border-border bg-navbar text-subtext hover:text-white"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
