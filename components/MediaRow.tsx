"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SliderControls from "@/components/SliderControls";
import TrendingMovieCard from "@/components/TrendingMovieCard";
import { cardImageUrl, fillPosterCollage } from "@/lib/media";
import type { Movie } from "@/lib/types";
import { useRowSlider } from "@/lib/use-row-slider";

/** Design card size: 285 × 317, 4 visible in a row */
export const MEDIA_CARD_W = 285;
export const MEDIA_CARD_H = 317;
/** Popular Top 10 — slightly taller for stacked Top 10 In + genre name */
const TOP10_CARD_H = 348;

const COLLAGE_GAP = 6;
const CARD_PAD = 16;
/** Genre name row — 18px semibold */
const GENRE_TITLE_H = 40;
/** Top 10 In (16px) above genre name */
const TOP10_TITLE_H = 60;

const TILE_OVERLAY =
  "linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.35) 42%, rgba(26,26,26,0.88) 78%, #1A1A1A 100%)";

function collageMetrics(titleBlock: number, cardH = MEDIA_CARD_H) {
  const collageH = cardH - CARD_PAD * 2 - titleBlock;
  const cellH = Math.floor((collageH - COLLAGE_GAP) / 2);
  const cellW = Math.floor((MEDIA_CARD_W - CARD_PAD * 2 - COLLAGE_GAP) / 2);
  return {
    cellW,
    cellH,
    collageW: cellW * 2 + COLLAGE_GAP,
    collageH: cellH * 2 + COLLAGE_GAP,
  };
}

export type Top10GenreItem = {
  name: string;
  key: string;
  /** Up to 4 unique posters for the collage */
  movies: Movie[];
};

type MediaRowProps = {
  title: string;
  movies: Movie[];
  showRuntime?: boolean;
  showDate?: boolean;
  showRating?: boolean;
  /** Popular Top 10 — genre collage structure like Our Genres */
  top10Label?: boolean;
  /** Genre names when top10 (aligned with movies array) — prefer top10Items */
  genreNames?: string[];
  /** Preferred: each genre card with its own 4 distinct posters */
  top10Items?: Top10GenreItem[];
  basePath?: string;
  /** Links cards to movie or show detail routes */
  mediaKind?: "movie" | "tv";
};

export default function MediaRow({
  title,
  movies,
  showRuntime = true,
  showDate = false,
  showRating = false,
  top10Label = false,
  genreNames = [],
  top10Items,
  basePath = "/movies",
  mediaKind = "movie",
}: MediaRowProps) {
  const top10Cards: Top10GenreItem[] = top10Label
    ? top10Items?.length
      ? top10Items
      : movies.map((movie, index) => ({
          name: genreNames[index] || movie.title || movie.name || "Genre",
          key: (genreNames[index] || "popular").toLowerCase(),
          movies: [movie],
        }))
    : [];

  /** Same as MoviesHero: segment count = item count */
  const itemCount = top10Label ? top10Cards.length : movies.length;
  const { rowRef, progress, go, segments, activeIndex } = useRowSlider(
    itemCount,
    MEDIA_CARD_W + 16,
  );

  if (!movies.length && !top10Cards.length) return null;

  const { cellW, cellH, collageW, collageH } = collageMetrics(
    top10Label ? TOP10_TITLE_H : GENRE_TITLE_H,
    top10Label ? TOP10_CARD_H : MEDIA_CARD_H,
  );

  return (
    <div className="min-w-0">
      {/* Web: arrows + segments (manual only) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-[20px] font-bold text-white sm:text-[22px]">
          {title}
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
        {top10Label
          ? top10Cards.map((item) => {
              const collage = fillPosterCollage(item.movies, 4);
              if (!collage.length) return null;
              return (
                <Link
                  key={`top10-${item.key}`}
                  href={`${basePath}?category=${item.key}`}
                  className="group flex shrink-0 flex-col overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] p-4"
                  style={{ width: MEDIA_CARD_W, height: TOP10_CARD_H }}
                >
                  {/* Fixed integer 2×2 — full overlay cover on mobile + web */}
                  <div
                    className="shrink-0 overflow-hidden"
                    style={{
                      width: collageW,
                      height: collageH,
                      display: "grid",
                      gap: COLLAGE_GAP,
                      gridTemplateColumns: `${cellW}px ${cellW}px`,
                      gridTemplateRows: `${cellH}px ${cellH}px`,
                    }}
                  >
                    {collage.map((m, i) => {
                      const name = m.title || m.name || item.name;
                      const imageUrl = cardImageUrl(m, "w342");
                      return (
                        <div
                          key={`${item.key}-${m.id}-${i}`}
                          className="relative overflow-hidden rounded-lg bg-[#1A1A1A]"
                          style={{ width: cellW, height: cellH }}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={name}
                              width={cellW}
                              height={cellH}
                              className="block h-full w-full object-cover object-center"
                              sizes={`${cellW}px`}
                            />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{
                                background: `linear-gradient(145deg, hsl(${(m.id * 47) % 360} 32% 18%), hsl(${(m.id * 47) % 360} 40% 8%)`,
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
                    })}
                  </div>
                  <div className="mt-2 flex shrink-0 flex-col gap-1">
                    <span className="w-fit rounded bg-cta px-2 py-0.5 text-[16px] font-semibold leading-none text-white">
                      Top 10 In
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[18px] font-semibold leading-none text-white">
                        {item.name}
                      </span>
                      <FiArrowRight className="h-5 w-5 shrink-0 text-white group-hover:text-cta" />
                    </div>
                  </div>
                </Link>
              );
            })
          : movies.map((movie) => (
              <TrendingMovieCard
                key={movie.id}
                movie={movie}
                showRuntime={showRuntime}
                showDate={showDate}
                showRating={showRating}
                mediaKind={mediaKind}
              />
            ))}
      </div>

      {/* Mobile: progress follows same index as web segments (hero-style) */}
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
