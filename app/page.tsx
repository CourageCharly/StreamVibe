import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Devices from "@/components/Devices";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import {
  fetchMovieCategories,
  fetchPopularMovies,
  fetchTrailers,
  fetchTrendingMovies,
} from "@/lib/api";

export default async function HomePage() {
  const [popular, trending, { categories }] = await Promise.all([
    fetchPopularMovies(),
    fetchTrendingMovies(),
    fetchMovieCategories(),
  ]);

  const heroPosters = [...trending, ...popular].slice(0, 24);
  const bannerPosters = popular.slice(0, 12);
  const trailers = await fetchTrailers(heroPosters, 8);

  return (
    <div
      className="relative w-full min-w-0 max-w-full overflow-x-hidden"
      style={{ overflowX: "hidden", maxWidth: "100%" }}
    >
      <Hero posters={heroPosters} trailers={trailers} />
      <Categories categoryMovies={categories} />
      <Devices />
      <FAQ askHref="/support?from=faq#contact" />
      <Pricing
        choosePlanHref="/subscriptions?from=pricing"
        trialHref="/movies?from=pricing"
      />
      <FreeTrialBanner
        posters={bannerPosters}
        ctaHref="/movies?from=free-trial"
      />
    </div>
  );
}
