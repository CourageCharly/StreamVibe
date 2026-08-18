"use client";

import MoviesShowsTabs from "@/components/MoviesShowsTabs";
import SectionFrame from "@/components/SectionFrame";
import { CatalogPosterSkeletonGrid } from "@/components/CatalogPosterGrid";

/** Same chrome as list / history / ratings — tabs + poster grid. */
export default function AccountCatalogSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div>
          <div className="mb-2 h-4 w-16 animate-pulse rounded bg-[#1A1A1A]" />
          <div className="h-7 w-52 animate-pulse rounded bg-[#1A1A1A] sm:h-8" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#1A1A1A] sm:w-96" />
        </div>
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <MoviesShowsTabs
            skeleton
            movies={
              <SectionFrame tag="Movies" skeleton>
                <CatalogPosterSkeletonGrid />
              </SectionFrame>
            }
            shows={
              <SectionFrame tag="Shows" skeleton>
                <CatalogPosterSkeletonGrid />
              </SectionFrame>
            }
          />
        </div>
      </div>
    </div>
  );
}
