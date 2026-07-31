"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "@/components/SectionHeading";
import PosterCard from "@/components/PosterCard";
import GradientOverlay from "@/components/GradientOverlay";
import SliderControls from "@/components/SliderControls";
import { posterUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { MEDIA_CARD_H, MEDIA_CARD_W } from "@/components/MediaRow";
import { useRowSlider } from "@/lib/use-row-slider";

type Props = {
  categoryMovies: Record<string, Movie[]>;
};

/**
 * Homepage categories — same hero-style index / segment matching as Our Genres.
 */
export default function Categories({ categoryMovies }: Props) {
  const itemCount = CATEGORIES.length;
  const { rowRef, progress, go, segments, activeIndex } = useRowSlider(
    itemCount,
    MEDIA_CARD_W + 16,
  );

  return (
    <section
      id="categories"
      className="page-section !pt-1 sm:!pt-[clamp(2rem,4vw,4rem)]"
    >
      <SectionHeading
        title={
          <>
            {/* Mobile: exactly 2 lines · Desktop: one line */}
            <span className="block sm:inline">Explore our wide variety of </span>
            <span className="block sm:inline">categories</span>
          </>
        }
        description={
          <>
            <span className="sm:hidden">
              Whether you&apos;re looking for a comedy to make you laugh,
              <br />
              a drama to make you think, or a documentary to learn
              <br />
              something new
            </span>
            <span className="hidden sm:inline">
              Whether you&apos;re looking for a comedy to make you laugh, a drama
              to make you think, or a documentary to learn something new
            </span>
          </>
        }
        action={
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
        }
      />

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
              href={`/movies?category=${cat.key}&from=categories`}
              className="group flex shrink-0 flex-col overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] p-4"
              style={{ width: MEDIA_CARD_W, height: MEDIA_CARD_H }}
            >
              {/* 2×2 collage — equal cells + full-bleed overlay (iOS + Android) */}
              <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden">
                {collage.map((movie, i) => {
                  const title = movie.title || movie.name || cat.name;
                  const imageUrl = posterUrl(movie.poster_path, "w342");
                  return (
                    <div
                      key={`${movie.id}-${i}`}
                      className="relative h-full min-h-0 min-w-0 w-full overflow-hidden rounded-lg bg-[#1A1A1A] [transform:translateZ(0)]"
                    >
                      <PosterCard
                        title={title}
                        imageUrl={imageUrl}
                        showLabel={false}
                        showOverlays={false}
                        className="!absolute !inset-0 !aspect-auto !h-full !w-full !min-h-full !min-w-full !max-h-none !max-w-none !rounded-lg [&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover [&_img]:!object-center sm:[&_img]:scale-[1.02]"
                        sizes="(max-width: 640px) 40vw, 140px"
                      />
                      <GradientOverlay
                        variant="poster"
                        direction="to bottom"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex shrink-0 items-center justify-between gap-2">
                <span className="truncate text-[16px] font-semibold text-white">
                  {cat.name}
                </span>
                <FiArrowRight className="h-5 w-5 shrink-0 text-white transition group-hover:translate-x-0.5 group-hover:text-cta" />
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
    </section>
  );
}
