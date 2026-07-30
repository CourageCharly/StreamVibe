import type { Metadata } from "next";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import MoviesHero from "@/components/MoviesHero";
import MoviesGenres from "@/components/MoviesGenres";
import MediaRow from "@/components/MediaRow";
import InfiniteMovies from "@/components/InfiniteMovies";
import SectionFrame from "@/components/SectionFrame";
import MoviesShowsTabs from "@/components/MoviesShowsTabs";
import BackLink from "@/components/BackLink";
import SectionBack from "@/components/SectionBack";
import RememberListPath from "@/components/RememberListPath";
import { resolveBackFrom } from "@/lib/back-nav";
import {
  fetchMovies,
  fetchMovieCategories,
  fetchPopularMovies,
  fetchSearchMovies,
  fetchShowCategories,
  fetchShows,
  fetchTrailers,
} from "@/lib/api";
import { CATEGORIES, MOVIE_LISTS } from "@/lib/constants";
import { parseMovieCategory } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Movies & Shows",
  description:
    "Browse movies and shows by genre — Action, Adventure, Comedy, Drama, Horror, and more on StreamVibe.",
};

/** Cache browse page — matches home; avoids cold multi-genre TMDB storms */
export const revalidate = 21600;

type Props = {
  searchParams: Promise<{ category?: string; q?: string; from?: string }>;
};

export default async function MoviesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const hasCategory = Boolean(params.category);
  const from = params.from ?? null;
  const category = parseMovieCategory(params.category, "trending");

  // ——— Search or genre listing (infinite load) ———
  if (q || hasCategory) {
    const [list, popular] = await Promise.all([
      q ? fetchSearchMovies(q, 1) : fetchMovies(category, 1),
      fetchPopularMovies(),
    ]);
    const label = q
      ? `Results for “${q}”`
      : `${MOVIE_LISTS.find((c) => c.key === category)?.name ?? "Movies"}`;

    // Live total from this search (TMDB total_results) — not a fixed number
    const matchCount = Math.max(
      0,
      Number(list.total_results) || list.count || list.results.length || 0,
    );
    const matchCountLabel = matchCount.toLocaleString("en-US");

    // From Explore categories → /#categories; else Movies & Shows browse
    const sectionBack = resolveBackFrom(from, {
      allowed: ["categories"],
      legacyHomeAs: "categories",
    });
    const backHref = sectionBack?.href ?? "/movies";
    const backLabel = sectionBack?.label ?? "Movies & Shows";
    const backAria =
      sectionBack?.ariaLabel ?? "Back to Movies & Shows";

    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
        <RememberListPath />
        <div className="page-container py-8 sm:py-10">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <BackLink
                href={backHref}
                fallbackHref={backHref}
                aria-label={backAria}
              />
              <p className="text-sm font-medium text-cta">{backLabel}</p>
            </div>
            <h1 className="text-[28px] font-bold leading-tight text-white">
              {label}
            </h1>
            <p className="mt-2 text-[14px] text-[#999999]">
              {q
                ? matchCount === 0
                  ? "No Movie/Show found."
                  : `We found ${matchCountLabel} matching ${matchCount === 1 ? "title" : "titles"}. Scroll to load more.`
                : "All titles in this genre. Keep scrolling to load more."}
            </p>
          </div>
          <div className="mt-10">
            <InfiniteMovies
              initial={list.results}
              category={q ? undefined : category}
              query={q || undefined}
              initialPage={list.page}
              totalPages={list.total_pages}
            />
          </div>
        </div>
        <FreeTrialBanner posters={popular.slice(0, 12)} />
      </div>
    );
  }

  // ——— Full Movies & Shows browse page (design) ———
  // Fast path: 1 TMDB page per genre (not 3) + fewer hero trailers
  const [
    { categories },
    { categories: showCategories },
    trendingRes,
    upcomingRes,
    popularRes,
    topRated,
    showsTrendingRes,
    showsPopularRes,
    showsOnAirRes,
    showsTop,
  ] = await Promise.all([
    fetchMovieCategories(4, 1),
    fetchShowCategories(4, 1),
    fetchMovies("trending", 1),
    fetchMovies("upcoming", 1),
    fetchMovies("popular", 1),
    fetchMovies("top_rated", 1),
    fetchShows("trending", 1),
    fetchShows("popular", 1),
    fetchShows("on_the_air", 1),
    fetchShows("top_rated", 1),
  ]);

  const trending = trendingRes.results;
  const upcoming = upcomingRes.results;
  const popular = popularRes.results;
  const showsTrending = showsTrendingRes.results;
  const showsPopular = showsPopularRes.results;
  const showsOnAir = showsOnAirRes.results;

  const heroMovies = [...trending, ...popular].filter(
    (m, i, arr) =>
      m.backdrop_path && arr.findIndex((x) => x.id === m.id) === i,
  );

  // Fewer slides/trailers = fewer /videos requests after the main batch
  const heroSlides = (heroMovies.length ? heroMovies : trending).slice(0, 4);
  const heroTrailers = await fetchTrailers(heroSlides, 3);

  /**
   * Popular Top 10 In Genres — one collage card per genre (same set as Our Genres).
   * Slider segment count = CATEGORIES.length.
   */
  const moviesTop10 = CATEGORIES.map((cat) => ({
    name: cat.name,
    key: cat.key,
    movies: (categories[cat.key] ?? []).slice(0, 4),
  }));

  // Shows Top 10 — real TV titles per genre (not movie posters)
  const showsTop10 = CATEGORIES.map((cat) => ({
    name: cat.name,
    key: cat.key,
    movies: (showCategories[cat.key] ?? []).slice(0, 4),
  })).filter((g) => g.movies.length > 0);

  /** Trending / Popular / New Releases row size (must-watch stays at 12) */
  const ROW_SIZE = 18;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <RememberListPath />
      {/* Back only from home free-trial / pricing CTAs */}
      <SectionBack
        allowed={["free-trial", "pricing"]}
        legacyHomeAs="free-trial"
        wrapperClassName="page-container pt-6 sm:pt-8"
      />

      <div className="page-container space-y-8 py-5 sm:space-y-10 sm:py-7">
        <MoviesHero movies={heroSlides} trailers={heroTrailers} />

        {/* Web only: more space between hero and Movies section */}
        <div className="mt-0 sm:mt-12 lg:mt-16">
        {/* Mobile: Movies / Shows tabs right under hero · Desktop: both sections */}
        <MoviesShowsTabs
          movies={
            <SectionFrame tag="Movies">
              <div className="space-y-7 sm:space-y-8">
                <MoviesGenres categoryMovies={categories} basePath="/movies" />

                <MediaRow
                  title="Popular Top 10 In Genres"
                  movies={moviesTop10.flatMap((g) => g.movies)}
                  top10Items={moviesTop10}
                  top10Label
                  showRuntime={false}
                  basePath="/movies"
                />

                <MediaRow
                  title="Trending Now"
                  movies={trending.slice(0, ROW_SIZE)}
                  showRuntime
                />

                <MediaRow
                  title="Popular Movies"
                  movies={popular.slice(0, ROW_SIZE)}
                  showRuntime
                />

                <MediaRow
                  title="New Releases"
                  movies={upcoming.slice(0, ROW_SIZE)}
                  showDate
                  showRuntime
                />

                <MediaRow
                  title="Must - Watch Movies"
                  movies={topRated.results.slice(0, 12)}
                  showRuntime
                  showRating
                />
              </div>
            </SectionFrame>
          }
          shows={
            <SectionFrame tag="Shows">
              <div className="space-y-7 sm:space-y-8">
                <MoviesGenres
                  categoryMovies={showCategories}
                  basePath="/shows"
                />

                <MediaRow
                  title="Popular Top 10 In Genres"
                  movies={showsTop10.flatMap((g) => g.movies)}
                  top10Items={showsTop10}
                  top10Label
                  showRuntime={false}
                  basePath="/shows"
                />

                <MediaRow
                  title="Trending Shows Now"
                  movies={showsTrending.slice(0, ROW_SIZE)}
                  showRuntime
                  mediaKind="tv"
                />

                <MediaRow
                  title="Popular Shows"
                  movies={showsPopular.slice(0, ROW_SIZE)}
                  showRuntime
                  mediaKind="tv"
                />

                <MediaRow
                  title="New Released Shows"
                  movies={showsOnAir.slice(0, ROW_SIZE)}
                  showRuntime
                  mediaKind="tv"
                />

                <MediaRow
                  title="Must - Watch Shows"
                  movies={showsTop.results.slice(0, 12)}
                  showRuntime
                  showRating
                  mediaKind="tv"
                />
              </div>
            </SectionFrame>
          }
        />
        </div>
      </div>

      <FreeTrialBanner posters={popular.slice(0, 12)} />
    </div>
  );
}
