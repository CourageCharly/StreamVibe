"use client";

import MoviesShowsTabs from "@/components/MoviesShowsTabs";
import SectionFrame from "@/components/SectionFrame";
import { CatalogPosterSkeletonGrid } from "@/components/CatalogPosterGrid";

/** Same chrome as list / history / ratings — tabs + poster grid. */
export default function AccountCatalogSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-8 py-8 sm:space-y-10 sm:py-10">
        <div>
          <div className="mb-2 h-4 w-16 animate-pulse rounded bg-[#1A1A1A]" />
          <div className="h-7 w-52 animate-pulse rounded bg-[#1A1A1A] sm:h-8" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#1A1A1A] sm:w-96" />
        </div>
        <MoviesShowsTabs
          movies={
            <SectionFrame tag="Movies">
              <CatalogPosterSkeletonGrid />
            </SectionFrame>
          }
          shows={
            <SectionFrame tag="Shows">
              <CatalogPosterSkeletonGrid />
            </SectionFrame>
          }
        />
      </div>
    </div>
  );
}
