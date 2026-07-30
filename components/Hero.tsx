"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import PosterGrid, {
  HERO_COLS,
  HERO_GAP,
  HERO_ROWS,
  HERO_TILE_COUNT,
  HERO_TILE_H,
  HERO_TILE_RADIUS,
  HERO_TILE_W,
  MOBILE_HERO_TILE_COUNT,
  MOBILE_HERO_TILE_RADIUS,
} from "@/components/PosterGrid";
import HeroMobileCollage from "@/components/HeroMobileCollage";
import FastTrailerPlayer from "@/components/FastTrailerPlayer";
import AbstractMediaControl from "@/components/icons/AbstractMediaControl";
import Button from "@/components/ui/Button";
import type { Movie, TrailerClip } from "@/lib/types";

type Props = {
  posters: Movie[];
  trailers?: TrailerClip[];
};

/**
 * Homepage hero — initial stacking: media at negative z so Header (absolute)
 * sits on top of the collage. Mobile keeps 3×4 / 134×143 cards.
 */
export default function Hero({ posters, trailers = [] }: Props) {
  const [playing, setPlaying] = useState(false);
  /** Avoid mounting 36 desktop YT players on mobile (blocks mobile trailers) */
  const [isSmUp, setIsSmUp] = useState(false);

  const onControlClick = useCallback(() => {
    if (trailers.length === 0) return;
    setPlaying((prev) => !prev);
  }, [trailers.length]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setIsSmUp(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlaying(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  const trailerTiles: TrailerClip[] = [];
  if (trailers.length > 0) {
    while (trailerTiles.length < HERO_TILE_COUNT) {
      trailerTiles.push(...trailers);
    }
  }
  const playGrid = trailerTiles.slice(0, HERO_TILE_COUNT);

  const gridW = HERO_COLS * HERO_TILE_W + (HERO_COLS - 1) * HERO_GAP;
  const gridH = HERO_ROWS * HERO_TILE_H + (HERO_ROWS - 1) * HERO_GAP;

  return (
    <section className="group/hero relative w-full min-w-0 max-w-full overflow-hidden">
      {/*
        Full-bleed collage from the top of the section (viewport top).
        Absolute header (z-100) sits on the images — same as web.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden"
        aria-hidden={!playing}
      >
        {playing && playGrid.length > 0 ? (
          <>
            {/* Mobile only — 12 players; real pixel layout (no scale) so YT can play */}
            {!isSmUp ? (
              <HeroMobileCollage>
                {playGrid.slice(0, MOBILE_HERO_TILE_COUNT).map((clip, index) => (
                  <div
                    key={`mp-${clip.key}-${index}`}
                    className="relative h-full min-h-0 min-w-0 w-full overflow-hidden bg-black"
                    style={{
                      borderRadius: MOBILE_HERO_TILE_RADIUS,
                      boxSizing: "border-box",
                    }}
                  >
                    <FastTrailerPlayer
                      clip={clip}
                      objectFit="cover"
                      playbackRate={1}
                      className="!inset-0 !h-full !w-full !max-w-none"
                    />
                  </div>
                ))}
              </HeroMobileCollage>
            ) : (
              <div
                className="absolute left-1/2 top-1/2 grid"
                style={{
                  width: gridW,
                  height: gridH,
                  gap: HERO_GAP,
                  gridTemplateColumns: `repeat(${HERO_COLS}, ${HERO_TILE_W}px)`,
                  gridTemplateRows: `repeat(${HERO_ROWS}, ${HERO_TILE_H}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {playGrid.map((clip, index) => (
                  <div
                    key={`dp-${clip.key}-${index}`}
                    className="relative overflow-hidden bg-black"
                    style={{
                      width: HERO_TILE_W,
                      height: HERO_TILE_H,
                      borderRadius: HERO_TILE_RADIUS,
                    }}
                  >
                    <FastTrailerPlayer
                      clip={clip}
                      objectFit="cover"
                      className="!inset-0 !h-full !w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <PosterGrid posters={posters} count={HERO_TILE_COUNT} />
        )}
      </div>

      {/* Dim overlays — under content; header stays above on the images */}
      {/* Linear: top 35% / mid 50% — same on mobile + web */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(20,20,20,0.35), rgba(20,20,20,0.5), #141414)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,#141414_72%)]" />

      {/* Content below header; absolute header sits on the collage */}
      <div
        className={[
          "page-container relative z-[2] flex min-w-0 flex-col items-center text-center",
          "h-[min(100svh,680px)] justify-center",
          /* Mobile: tight bottom gap before Explore; sm+ keeps page-section rhythm */
          "pt-[calc(var(--header-h)+clamp(2rem,4vw,4rem))] pb-0 sm:pb-[clamp(2rem,4vw,4rem)]",
          "sm:h-auto sm:min-h-[min(100dvh,880px)] sm:justify-end",
        ].join(" ")}
      >
        {/* Play → title: mb-8 matches SectionHeading bottom spacing */}
        <div className="mb-8 flex h-[min(42vw,168px)] w-[min(42vw,168px)] shrink-0 items-center justify-center sm:h-[160px] sm:w-[160px] md:h-[200px] md:w-[200px] lg:h-[220px] lg:w-[220px]">
          <button
            type="button"
            onClick={onControlClick}
            disabled={trailers.length === 0}
            className={[
              "relative flex h-full w-full cursor-pointer items-center justify-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta disabled:cursor-not-allowed",
              // While playing: keep hit-area for toggle, never show pause icon over the movies
              playing
                ? "opacity-0"
                : "opacity-100 hover:scale-[1.03]",
            ].join(" ")}
            aria-label={playing ? "Pause trailers" : "Play trailers muted"}
            aria-pressed={playing}
          >
            {/* Icon only when idle — movies play without a pause overlay */}
            {!playing ? (
              <AbstractMediaControl
                mode="play"
                className="h-full w-full drop-shadow-[0_0_40px_rgba(255,255,255,0.08)]"
              />
            ) : null}
          </button>
        </div>

        {/* Title — same 28px bold scale as section headings */}
        <h1 className="w-full max-w-3xl text-balance text-[clamp(1.25rem,3.5vw,28px)] font-bold leading-tight tracking-tight text-white sm:text-[clamp(1.75rem,6vw,48px)] sm:leading-[1.15]">
          <span className="sm:hidden">
            The Best Streaming
            <br />
            Experience
          </span>
          <span className="hidden sm:inline">The Best Streaming Experience</span>
        </h1>

        {/* Subtext — same 14px / mt-2 as SectionHeading description */}
        <p className="mx-auto mt-2 max-w-3xl text-pretty text-[14px] font-normal leading-relaxed text-subtext sm:line-clamp-2">
          <span className="sm:hidden">
            StreamVibe is the best streaming experience for watching your
            favorite movies and shows on demand, anytime, anywhere.
          </span>
          <span className="hidden sm:inline">
            StreamVibe is the best streaming experience for watching your favorite
            movies and shows on demand, anytime, anywhere. With StreamVibe, you can
            enjoy a wide variety of content, including the latest blockbusters,
            classic movies, popular TV shows, and more.
          </span>
        </p>

        {/* CTA — mt-6 matches plan / section action spacing */}
        <Button
          href="/movies"
          className="mt-6 !h-[49px] !w-[min(100%,209px)] sm:!h-[52px] sm:!w-[200px] md:!w-[210px]"
        >
          <FaPlay className="h-3 w-3 shrink-0" />
          Start Watching Now
        </Button>
      </div>
    </section>
  );
}
