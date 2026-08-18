import type { Metadata } from "next";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import InfiniteMovies from "@/components/InfiniteMovies";
import BackLink from "@/components/BackLink";
import RememberListPath from "@/components/RememberListPath";
import { SHOW_CATEGORIES } from "@/lib/constants";
import { fetchPopularMovies, fetchShows } from "@/lib/api";
import { parseShowCategory } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "TV Shows",
  description:
    "Browse TV shows by genre — Action, Comedy, Drama, Sci-Fi, and more on StreamVibe.",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

/**
 * Shows genre / list page.
 * Back → Movies & Shows browse (Shows tab remembered via nav history).
 */
export default async function ShowsPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasCategory = Boolean(params.category);
  const category = parseShowCategory(params.category, "trending");

  const [list, popular] = await Promise.all([
    fetchShows(category, 1),
    fetchPopularMovies(),
  ]);

  const label =
    SHOW_CATEGORIES.find((c) => c.key === category)?.name ?? "Shows";

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <RememberListPath />
      <div className="page-container py-8 sm:py-10">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <BackLink
              href="/movies"
              fallbackHref="/movies"
              aria-label="Back to Movies & Shows"
            />
            <p className="text-sm font-medium text-cta">Movies & Shows</p>
          </div>
          <h1 className="text-[28px] font-bold leading-tight text-white">
            {label}
          </h1>
          <p className="mt-2 text-[16px] text-[#999999]">
            {hasCategory
              ? "All shows in this genre. Keep scrolling to load more."
              : "Browse shows. Keep scrolling to load more."}
          </p>
        </div>
        <div className="mt-10">
          <InfiniteMovies
            initial={list.results}
            kind="shows"
            category={category}
            initialPage={list.page}
            totalPages={list.total_pages}
          />
        </div>
      </div>
      <FreeTrialBanner posters={popular.slice(0, 12)} />
    </div>
  );
}
