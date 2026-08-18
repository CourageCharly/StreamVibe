"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { toast } from "sonner";
import { backdropUrl, profileUrl } from "@/lib/media";
import type { MovieDetails, MoviePerson } from "@/lib/types";
import Button from "@/components/ui/Button";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import BackLink from "@/components/BackLink";
import ReviewsSection from "@/components/ReviewsSection";
import AuthPrompt from "@/components/auth/AuthPrompt";
import { useAuth } from "@/components/auth/AuthProvider";
import { rememberReturnTo } from "@/lib/auth/return-to";
import { useIsMobile } from "@/lib/use-mobile";
import type { Movie } from "@/lib/types";
import {
  getLikes,
  getMyList,
  toggleLike,
  toggleMyList,
} from "@/lib/user-lists";
import { getReturnTo } from "@/lib/nav-history";

type Props = {
  movie: MovieDetails;
  relatedPosters?: Movie[];
};

/** Always renders a face area — TMDB photo or initials */
function PersonAvatar({
  path,
  name,
}: {
  path: string | null | undefined;
  name: string;
}) {
  const src = profileUrl(path, "w185");
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="44px"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#999999]">
          {(name || "?").slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  const stars = Math.min(max, Math.max(0, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={i < stars ? "/Icons/Star.svg" : "/Icons/Empty Star.svg"}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5"
          aria-hidden
        />
      ))}
      <span className="ml-1 text-xs font-medium text-white">{value.toFixed(1)}</span>
    </span>
  );
}

/** Card containers below hero: fill #1A1A1A, stroke #262626 */
function InfoCard({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
      {title || action ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
          {title ? (
            <h2 className="text-[13px] font-medium text-[#999999] sm:text-[14px]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Field labels under hero: #999999.
 * iconSrc = custom SVG (masked #999999); icon = react-icon component.
 */
function FieldLabel({
  iconSrc,
  icon: Icon,
  children,
}: {
  iconSrc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#999999]">
      {iconSrc ? (
        <span
          className="block h-4 w-4 shrink-0 bg-[#999999]"
          style={{
            maskImage: `url("${iconSrc}")`,
            WebkitMaskImage: `url("${iconSrc}")`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          aria-hidden
        />
      ) : Icon ? (
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#999999]" />
      ) : null}
      {children}
    </div>
  );
}

/** Cast / review arrows: fill #141414, stroke #262626, icon #999999 */
const arrowBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#999999] transition hover:text-white sm:h-10 sm:w-10";

/** Pills / inner cards: fill #141414, stroke #262626 */
const pillClass =
  "rounded-md border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs font-medium text-white";
const innerCardClass =
  "flex items-center gap-3 rounded-lg border border-[#262626] bg-[#141414] p-3";

function CastRow({
  cast,
  scrollRef,
}: {
  cast: MoviePerson[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!cast.length) {
    return (
      <p className="text-[13px] text-[#999999]">Cast information unavailable.</p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {cast.map((person) => {
        const src = profileUrl(person.profile_path);
        return (
          <div
            key={`${person.id}-${person.character}`}
            className="w-[72px] shrink-0 text-center"
          >
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-[#262626] bg-[#141414]">
              {src ? (
                <Image
                  src={src}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#666]">
                  {person.name.slice(0, 1)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-[11px] font-medium text-white">
              {person.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CastSection({ cast }: { cast: MoviePerson[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <InfoCard
      title="Cast"
      action={
        cast.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className={arrowBtnClass}
              aria-label="Previous cast"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className={arrowBtnClass}
              aria-label="Next cast"
            >
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null
      }
    >
      <CastRow cast={cast} scrollRef={ref} />
    </InfoCard>
  );
}

/**
 * Movies open/detail page — layout from Movies Page Open - Laptop.png
 */
export default function MovieDetailView({ movie, relatedPosters = [] }: Props) {
  const [muted, setMuted] = useState(true);
  const [myList, setMyList] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);

  const [hydrated, setHydrated] = useState(false);
  /** Page/section the user opened this title from (genre, row, home, …) */
  const [returnHref, setReturnHref] = useState("/movies");
  const [authOpen, setAuthOpen] = useState(false);
  const router = useRouter();
  const { status } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    setHydrated(true);
    setMyList(getMyList());
    setLikes(getLikes());
  }, []);

  // Always land on the hero (top) when opening/returning to this detail page
  // — avoids restored scroll from the info grid after leaving the watch page
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [movie.id]);

  // Match SSR (false) until client has hydrated from localStorage
  const inList = hydrated && myList.includes(movie.id);
  const liked = hydrated && likes.includes(movie.id);
  const bg = backdropUrl(movie.backdrop_path, "w1280");
  const year = movie.release_date?.slice(0, 4) || "—";
  const isShow = movie.mediaType === "tv";
  const basePath = isShow ? "/shows" : "/movies";
  const watchHref = `${basePath}/${movie.id}/watch`;

  // Origin section (trending row, genre list, home, …) for detail back
  useEffect(() => {
    setReturnHref(getReturnTo(isShow ? "/movies" : basePath));
  }, [movie.id, basePath, isShow]);
  const languages = movie.spoken_languages.length
    ? movie.spoken_languages
    : [{ english_name: "English", iso_639_1: "en" }];
  // Prefer crew with a real profile photo so Director image always shows when TMDB has one
  const withPhoto = (c: MoviePerson) => Boolean(c.profile_path);
  const director =
    movie.crew.find((c) => c.job === "Director" && withPhoto(c)) ??
    movie.crew.find((c) => c.job === "Director") ??
    movie.crew.find((c) => c.job === "Executive Producer" && withPhoto(c)) ??
    movie.crew.find((c) => c.job === "Executive Producer") ??
    movie.crew.find((c) => c.job === "Creator" && withPhoto(c)) ??
    movie.crew.find(withPhoto) ??
    movie.crew[0] ??
    null;
  const music =
    movie.crew.find(
      (c) =>
        (c.job === "Original Music Composer" ||
          c.job === "Music" ||
          c.job === "Composer") &&
        withPhoto(c),
    ) ??
    movie.crew.find(
      (c) =>
        c.job === "Original Music Composer" ||
        c.job === "Music" ||
        c.job === "Composer",
    ) ??
    null;
  const streamRating = Math.min(5, Math.max(1, Math.round(movie.vote_average) / 2));
  const imdbRating = Math.min(5, Math.max(1, movie.vote_average / 2));

  const actionBtn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#0F0F0F] text-white transition hover:border-[#404040] sm:h-12 sm:w-12";

  const IconMask = useCallback(
    ({ src, active }: { src: string; active: boolean }) => (
      <span
        className={`block h-6 w-6 shrink-0 ${active ? "bg-cta" : "bg-white"}`}
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
    ),
    [],
  );

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-5 py-4 sm:space-y-8 sm:py-6 md:space-y-10 md:py-8">
        {/* Breadcrumb — back + Movies & Shows only */}
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-[12px] font-medium sm:text-[13px]"
        >
          <BackLink
            preferHistory
            fallbackHref={returnHref}
            aria-label="Go back"
          />
          <Link
            href="/movies"
            className="truncate text-cta transition hover:text-white"
          >
            Movies & Shows
          </Link>
        </nav>

        {/* Hero — matches Movies & Shows hero (taller mobile, lighter title, full-width CTA) */}
        <section
          id="hero"
          className="cinema-frame"
        >
          {bg ? (
            <Image
              src={bg}
              alt={movie.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-[#1A1A1A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

          <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-6 pt-20 text-center sm:px-6 sm:pb-8 md:px-8 lg:pb-10">
            <h1 className="max-w-3xl break-words text-[clamp(1.25rem,3.5vw,1.875rem)] font-semibold leading-tight text-white sm:text-[clamp(1.35rem,4vw,2.25rem)]">
              {movie.title}
            </h1>
            {/* Description: web only — hidden on mobile */}
            <p className="subtext-wide mt-2.5 hidden max-w-2xl text-[14px] leading-relaxed text-[#999999] sm:mt-3 sm:text-[16px] sm:line-clamp-2 sm:block">
              {movie.overview || "No description available."}
            </p>
            <div className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-6 sm:w-auto sm:max-w-none sm:gap-3">
              <Button
                className="!h-[49px] !w-full max-w-2xl gap-2 px-8 text-[14px] sm:!h-[49px] sm:!w-auto sm:min-w-[140px] sm:max-w-none sm:px-6"
                onClick={() => {
                  if (status === "authenticated") {
                    router.push(watchHref);
                    return;
                  }
                  rememberReturnTo(watchHref);
                  if (isMobile) {
                    router.push(
                      `/auth?returnTo=${encodeURIComponent(watchHref)}`,
                    );
                    return;
                  }
                  setAuthOpen(true);
                }}
              >
                <FaPlay className="h-3 w-3" />
                Play Now
              </Button>
              <button
                type="button"
                className={actionBtn}
                aria-label={inList ? "Remove from list" : "Add to list"}
                aria-pressed={inList}
                onClick={() => {
                  const next = toggleMyList(
                    movie.id,
                    movie.title,
                    movie.mediaType === "tv" ? "tv" : "movie",
                  );
                  setMyList(next);
                  toast.success(
                    next.includes(movie.id)
                      ? "Added to My List."
                      : "Removed from My List.",
                  );
                }}
              >
                <IconMask src="/Icons/Plus.svg" active={inList} />
              </button>
              <button
                type="button"
                className={actionBtn}
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
                onClick={() =>
                  setLikes(
                    toggleLike(
                      movie.id,
                      movie.mediaType === "tv" ? "tv" : "movie",
                      movie.title,
                    ),
                  )
                }
              >
                <IconMask src="/Icons/hand.svg" active={liked} />
              </button>
              <button
                type="button"
                className={actionBtn}
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => setMuted((m) => !m)}
              >
                {muted ? (
                  <FaVolumeMute className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <FaVolumeUp className="h-3.5 w-3.5 text-cta sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Info grid — description, cast, reviews only (watch/episodes on Play Now) */}
        <div className="grid min-w-0 grid-cols-1 gap-4 bg-[#141414] sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2">
            <InfoCard title="Description">
              <p className="text-[12px] font-normal leading-relaxed text-white sm:text-[13px]">
                {movie.overview || "No description available for this title."}
              </p>
            </InfoCard>

            <CastSection cast={movie.cast} />

            <ReviewsSection
              reviews={movie.reviews}
              mediaId={movie.id}
              mediaType={isShow ? "tv" : "movie"}
              title={movie.title}
            />
          </div>

          <aside className="min-w-0 space-y-4 sm:space-y-5">
            <InfoCard>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <FieldLabel icon={FiCalendar}>Released Year</FieldLabel>
                  <p className="text-base font-medium text-white">{year}</p>
                </div>

                <div>
                  <FieldLabel iconSrc="/Icons/Avalible Language.svg">
                    Available Languages
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang.iso_639_1 || lang.english_name}
                        className={pillClass}
                      >
                        {lang.english_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Ratings</FieldLabel>
                  {/* Full width of sidebar — same span as Director / Music cards */}
                  <div className="grid w-full grid-cols-2 gap-3">
                    <div className="min-w-0 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                      <p className="mb-1 text-[11px] font-medium text-[#999999]">
                        IMDb
                      </p>
                      <StarRow value={imdbRating} />
                    </div>
                    <div className="min-w-0 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                      <p className="mb-1 text-[11px] font-medium text-[#999999]">
                        StreamVibe
                      </p>
                      <StarRow value={streamRating} />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel iconSrc="/Icons/Genres.svg">Genres</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {(movie.genres.length
                      ? movie.genres
                      : [{ id: 0, name: "Drama" }]
                    ).map((g) => (
                      <span key={g.id || g.name} className={pillClass}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>

                {director ? (
                  <div>
                    <FieldLabel>Director</FieldLabel>
                    <div className={innerCardClass}>
                      <PersonAvatar
                        path={director.profile_path}
                        name={director.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {director.name}
                        </p>
                        <p className="text-xs text-[#999999]">
                          {director.job === "Director"
                            ? "From the crew"
                            : director.job || "From the crew"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {music ? (
                  <div>
                    <FieldLabel>Music</FieldLabel>
                    <div className={innerCardClass}>
                      <PersonAvatar
                        path={music.profile_path}
                        name={music.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {music.name}
                        </p>
                        <p className="text-xs text-[#999999]">
                          {music.job || "Music"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </InfoCard>
          </aside>
        </div>
      </div>

      <FreeTrialBanner posters={relatedPosters.slice(0, 12)} />
      <AuthPrompt
        key={authOpen ? "auth-open" : "auth-closed"}
        open={!isMobile && authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={() => {
          setAuthOpen(false);
          router.replace(watchHref);
        }}
      />
    </div>
  );
}
