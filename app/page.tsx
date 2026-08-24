import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import {
  fetchMovieCategories,
  fetchPopularMovies,
  fetchTrailers,
  fetchTrendingMovies,
} from "@/lib/api";

/** Cache home data — fewer cold TMDB hits, faster navigations */
export const revalidate = 21600;

/* Below-the-fold: load after hero so first paint is faster */
const Devices = dynamic(() => import("@/components/Devices"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Pricing = dynamic(() => import("@/components/Pricing"));
const FreeTrialBanner = dynamic(() => import("@/components/FreeTrialBanner"));

export default async function HomePage() {
  // Faster home: 1 page per genre (not 3) + fewer trailer lookups
  const [popular, trending, { categories }] = await Promise.all([
    fetchPopularMovies(),
    fetchTrendingMovies(),
    fetchMovieCategories(4, 1),
  ]);

  const heroPosters = [...trending, ...popular].slice(0, 16);
  const bannerPosters = popular.slice(0, 12);
  const trailers = await fetchTrailers(heroPosters, 4);

  return (
    <div
      className="relative w-full min-w-0 max-w-full overflow-x-hidden"
      style={{ overflowX: "hidden", maxWidth: "100%" }}
    >
      <Hero posters={heroPosters} trailers={trailers} />
      <Categories categoryMovies={categories} />
      <Devices className="sm:mt-[120px] mt-3" />
      <FAQ askHref="/support?from=faq#contact" className="sm:mt-[120px] mt-3" />
      <Pricing
        choosePlanHref="/subscriptions?from=pricing"
        trialHref="/movies?from=pricing"
        className="sm:mt-[120px] mt-3"
      />
      <FreeTrialBanner
        posters={bannerPosters}
        ctaHref="/movies?from=free-trial"
        className="!pt-3 !pb-3"
      />
    </div>
  );
}
