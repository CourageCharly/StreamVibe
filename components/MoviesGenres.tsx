"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SliderControls from "@/components/SliderControls";
import { posterUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { MEDIA_CARD_H, MEDIA_CARD_W } from "@/components/MediaRow";
import { useRowSlider } from "@/lib/use-row-slider";

type Props = {
  categoryMovies: Record<string, Movie[]>;
  basePath?: string;
};

const GAP = 6;
const PAD = 16;
const TITLE_BLOCK = 40;

/** Solid bottom fade — always covers full image frame */
const TILE_OVERLAY =
  "linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.35) 42%, rgba(26,26,26,0.88) 78%, #1A1A1A 100%)";

function GenreTile({
  movie,
  fallbackTitle,
  fixed,
  cellW,
  cellH,
}: {
  movie: Movie;
  fallbackTitle: string;
  fixed?: boolean;
  cellW?: number;
  cellH?: number;
}) {
  const title = movie.title || movie.name || fallbackTitle;
  const imageUrl = posterUrl(movie.poster_path, "w342");

  return (
    <div
      className={[
        "relative overflow-hidden rounded-lg bg-[#1A1A1A]",
        fixed ? "" : "min-h-0 min-w-0 h-full w-full",
      ].join(" ")}
      style={
        fixed && cellW && cellH
          ? { width: cellW, height: cellH, flex: "none" }
          : undefined
      }
    >
      {imageUrl ? (
        fixed && cellW && cellH ? (
          <Image
            src={imageUrl}
            alt={title}
            width={cellW}
            height={cellH}
            className="block h-full w-full object-cover object-center"
            sizes={`${cellW}px`}
          />
        ) : (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="40vw"
          />
        )
      ) : (
        <div
          className={fixed ? "h-full w-full" : "absolute inset-0"}
          style={{
            background: `linear-gradient(145deg, hsl(${(movie.id * 47) % 360} 32% 18%), hsl(${(movie.id * 47) % 360} 40% 8%)`,
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: TILE_OVERLAY }}
        aria-hidden
      />
    </div>
  );
}

/**
 * Our Genres — segment count = genre card count.
 * Web: integer-pixel 2×2 collage so overlay covers every frame edge (no bottom gap).
 */
export default function MoviesGenres({
  categoryMovies,
  basePath = "/movies",
}: Props) {
  const itemCount = CATEGORIES.length;
  const { rowRef, progress, go, segments, activeIndex } = useRowSlider(
    itemCount,
    MEDIA_CARD_W + 16,
  );

  const collageH = MEDIA_CARD_H - PAD * 2 - TITLE_BLOCK;
  const cellH = Math.floor((collageH - GAP) / 2);
  const cellW = Math.floor((MEDIA_CARD_W - PAD * 2 - GAP) / 2);
  const collageW = cellW * 2 + GAP;
  const collageExactH = cellH * 2 + GAP;

  return (
    <div className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-[20px] font-bold text-white sm:text-[22px]">
          Our Genres
        </h2>
        <SliderControls
          variant="row"
          placement="header"
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          progress={progress}
          segments={segments}
          activeIndex={activeIndex}
          className="shrink-0"
        />
      </div>

      <div
        ref={rowRef}
        className="media-scroll-row flex gap-4 overflow-x-auto overflow-y-hidden pb-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {CATEGORIES.map((cat) => {
          const movies = categoryMovies[cat.key] ?? [];
          const collage: Movie[] = movies.length
            ? movies.slice(0, 4)
            : Array.from({ length: 4 }, (_, i) => ({
                id: (cat.genreId ?? 1) * 10 + i,
                title: cat.name,
                overview: "",
                poster_path: null,
                backdrop_path: null,
                vote_average: 0,
              }));

          return (
            <Link
              key={cat.key}
              href={`${basePath}?category=${cat.key}`}
              className="group flex shrink-0 flex-col overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] p-4"
              style={{ width: MEDIA_CARD_W, height: MEDIA_CARD_H }}
            >
              {/* Mobile: fluid 2×2 */}
              <div
                className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 overflow-hidden sm:hidden"
                style={{ gap: GAP }}
              >
                {collage.map((movie, i) => (
                  <GenreTile
                    key={`m-${movie.id}-${i}`}
                    movie={movie}
                    fallbackTitle={cat.name}
                  />
                ))}
              </div>

              {/* Web: fixed integer-pixel 2×2 — full frame cover, no bottom gap */}
              <div
                className="hidden shrink-0 overflow-hidden sm:grid"
                style={{
                  width: collageW,
                  height: collageExactH,
                  gap: GAP,
                  gridTemplateColumns: `${cellW}px ${cellW}px`,
                  gridTemplateRows: `${cellH}px ${cellH}px`,
                }}
              >
                {collage.map((movie, i) => (
                  <GenreTile
                    key={`d-${movie.id}-${i}`}
                    movie={movie}
                    fallbackTitle={cat.name}
                    fixed
                    cellW={cellW}
                    cellH={cellH}
                  />
                ))}
              </div>

              <div className="mt-auto flex shrink-0 items-center justify-between gap-2 pt-3">
                <span className="truncate text-[16px] font-semibold text-white">
                  {cat.name}
                </span>
                <FiArrowRight className="h-5 w-5 shrink-0 text-white group-hover:text-cta" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <SliderControls
          variant="row"
          placement="footer"
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          progress={progress}
          segments={segments}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  );
}
