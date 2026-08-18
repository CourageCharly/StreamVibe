import TrendingMovieCard from "@/components/TrendingMovieCard";
import type { Movie } from "@/lib/types";
import type { MediaKind } from "@/lib/user-lists";

export function CatalogCardSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0F0F0F]"
        style={{ aspectRatio: "285 / 317" }}
      >
        <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-8 sm:p-3 sm:pt-10">
          <div className="h-3 w-3/4 animate-pulse rounded bg-[#262626]" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#262626]" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#262626]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogPosterSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <CatalogCardSkeleton key={i} />
      ))}
    </div>
  );
}

type Props = {
  movies: Movie[];
  kind: MediaKind;
  showRating?: boolean;
};

export default function CatalogPosterGrid({
  movies,
  kind,
  showRating = false,
}: Props) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
      {movies.map((movie) => (
        <TrendingMovieCard
          key={`${kind}-${movie.id}`}
          movie={movie}
          fluid
          showRuntime
          showRating={showRating}
          mediaKind={kind}
        />
      ))}
    </div>
  );
}
