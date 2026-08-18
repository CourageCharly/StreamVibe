"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { backdropUrl } from "@/lib/media";
import {
  getLikes,
  getMyList,
  toggleLike,
  toggleMyList,
} from "@/lib/user-lists";
import type { Movie, TrailerClip } from "@/lib/types";
import Button from "@/components/ui/Button";
import SliderControls from "@/components/SliderControls";
import FastTrailerPlayer from "@/components/FastTrailerPlayer";

/**
 * Movies hero only — balanced pace (not too fast / not too slow).
 * ~6s per slide with a soft crossfade for seamless transitions.
 */
const AUTO_SLIDE_MS = 6000;
const FADE_MS = 1000;

type Props = {
  movies: Movie[];
  trailers?: TrailerClip[];
};

export default function MoviesHero({ movies, trailers = [] }: Props) {
  const slides = useMemo(
    () =>
      movies.filter((m) => m.backdrop_path).slice(0, 6).length
        ? movies.filter((m) => m.backdrop_path).slice(0, 6)
        : movies.slice(0, 6),
    [movies],
  );

  const trailerById = useMemo(() => {
    const map = new Map<number, TrailerClip>();
    for (const t of trailers) map.set(t.id, t);
    return map;
  }, [trailers]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [myList, setMyList] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate list / likes from localStorage only after mount (SSR-safe)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    setMyList(getMyList());
    setLikes(getLikes());
  }, []);

  const movie = slides[index] ?? null;
  const movieId = movie?.id;
  const title = movie?.title || movie?.name || "Featured Title";
  const overview =
    movie?.overview ||
    "Discover blockbuster movies and exclusive shows. Stream anytime, anywhere on StreamVibe.";
  const progress = slides.length > 1 ? index / (slides.length - 1) : 0;
  const activeTrailer = movie ? trailerById.get(movie.id) : undefined;
  // Only reflect localStorage after hydrate so aria-pressed matches SSR
  const inMyList = hydrated && movieId != null && myList.includes(movieId);
  const isLiked = hydrated && movieId != null && likes.includes(movieId);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!slides.length) return;
      setIndex((i) => (i + dir + slides.length) % slides.length);
    },
    [slides.length],
  );

  const onManual = useCallback(
    (dir: -1 | 1) => {
      go(dir);
      setPaused(true);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => setPaused(false), AUTO_SLIDE_MS);
    },
    [go],
  );

  const onToggleList = () => {
    if (movieId == null) return;
    setMyList(toggleMyList(movieId, title));
  };

  const onToggleLike = () => {
    if (movieId == null) return;
    setLikes(toggleLike(movieId, "movie", title));
  };

  // Always auto-advance to the next slide (even while a trailer plays)
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => go(1), AUTO_SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length, paused, go, index]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  /** Icon buttons: container always #0F0F0F + #262626 — only the glyph turns red when selected */
  const actionBtn =
    "flex h-12 w-12 items-center justify-center rounded-lg border border-[#262626] bg-[#0F0F0F] transition hover:border-[#404040]";

  /** Icon-only recolor via mask (active = #E50000 glyph, container unchanged) */
  const IconMask = ({
    src,
    active,
  }: {
    src: string;
    active: boolean;
  }) => (
    <span
      className={`block h-6 w-6 shrink-0 transition-colors ${
        active ? "bg-cta" : "bg-white"
      }`}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
      aria-hidden
    />
  );

  return (
    <section
      className="relative w-full min-w-0 overflow-hidden rounded-xl bg-black sm:rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {/* Same stage as the mobile play screen — image covers the box including the top */}
      <div className="relative h-[min(88vw,460px)] w-full overflow-hidden sm:h-[480px] lg:h-[560px]">
        {slides.map((slide, i) => {
          const slideTitle = slide.title || slide.name || "Featured";
          const slideBg = backdropUrl(slide.backdrop_path, "w1280");
          const active = i === index;
          const clip = trailerById.get(slide.id);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 h-full w-full overflow-hidden transition-opacity ease-in-out ${
                active
                  ? "z-[1] opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={!active}
            >
              {/* Backdrop fills the hero container edge-to-edge */}
              {slideBg ? (
                <Image
                  src={slideBg}
                  alt={slideTitle}
                  fill
                  priority={i === 0 || i === (index + 1) % Math.max(slides.length, 1)}
                  className="h-full w-full object-cover object-center"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 h-full w-full bg-[#1A1A1A]" />
              )}

              {/* Trailers fill the hero box edge-to-edge (cover, never letterbox) */}
              {active && clip ? (
                <div className="absolute inset-0 z-[1] h-full w-full overflow-hidden">
                  <FastTrailerPlayer
                    clip={clip}
                    playbackRate={1}
                    loop={false}
                    muted={muted}
                    objectFit="cover"
                    className="!absolute !inset-0 !h-full !w-full !min-h-full !min-w-full"
                    onEnded={() => go(1)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
        {!slides.length ? (
          <div className="absolute inset-0 bg-[#1A1A1A]" />
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full bg-gradient-to-t from-[#141414] via-[#141414]/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full bg-gradient-to-r from-[#141414]/70 via-transparent to-transparent" />

        <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-6 pt-20 text-center sm:px-8 sm:pb-8 lg:pb-10">
          <h1
            key={`title-${index}`}
            className="max-w-3xl text-[clamp(1.25rem,3.5vw,1.875rem)] font-semibold text-white transition-opacity ease-in-out"
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            {title}
          </h1>
          {/* Description: web only — hidden on mobile */}
          <p
            key={`overview-${index}`}
            className="mt-2.5 hidden max-w-2xl text-[14px] leading-relaxed text-[#999999] transition-opacity ease-in-out sm:mt-3 sm:text-[16px] sm:line-clamp-2 sm:block"
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            {overview}
          </p>

          <div className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 sm:w-auto sm:max-w-none">
            <Button
              href={movieId != null ? `/movies/${movieId}` : "/movies"}
              className="!w-full max-w-2xl gap-2 px-8 sm:!w-auto sm:min-w-[140px] sm:max-w-none sm:px-6"
            >
              <FaPlay className="h-3 w-3" />
              Play Now
            </Button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleList}
                disabled={movieId == null}
                className={actionBtn}
                aria-label={inMyList ? "Remove from My List" : "Add to My List"}
                aria-pressed={inMyList}
                title={inMyList ? "Remove from My List" : "Add to My List"}
              >
                <IconMask src="/Icons/Plus.svg" active={inMyList} />
              </button>
              <button
                type="button"
                onClick={onToggleLike}
                disabled={movieId == null}
                className={actionBtn}
                aria-label={isLiked ? "Unlike" : "Like"}
                aria-pressed={isLiked}
                title={isLiked ? "Unlike" : "Like"}
              >
                <IconMask src="/Icons/hand.svg" active={isLiked} />
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                disabled={!activeTrailer}
                className={`${actionBtn} disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label={muted ? "Unmute trailer" : "Mute trailer"}
                aria-pressed={!muted}
                title={
                  activeTrailer
                    ? muted
                      ? "Unmute"
                      : "Mute"
                    : "No trailer playing"
                }
              >
                <span className="relative inline-flex h-6 w-6 items-center justify-center">
                  {/* Unmuted = red icon only; muted = white icon + slash */}
                  <IconMask src="/Icons/Sound.svg" active={!muted} />
                  {muted ? (
                    <span
                      className="pointer-events-none absolute left-1/2 top-1/2 block h-[2px] w-[26px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-full bg-white shadow-[0_0_0_1px_rgba(15,15,15,0.85)]"
                      aria-hidden
                    />
                  ) : null}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop only — no hero slider on mobile; rows below keep theirs */}
          {slides.length > 1 ? (
            <div className="mt-8 hidden w-full px-1 sm:block sm:px-2">
              <SliderControls
                variant="hero"
                onPrev={() => onManual(-1)}
                onNext={() => onManual(1)}
                progress={progress}
                segments={slides.length}
                activeIndex={index}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
