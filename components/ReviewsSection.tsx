"use client";

import { FaPlus } from "react-icons/fa";
import ReviewsBlock from "@/components/ReviewsBlock";
import type { MovieReview } from "@/lib/types";

type Props = {
  reviews: MovieReview[];
};

/**
 * Reviews section shell — shared by movie/show detail + watch.
 * Guarantees identical mobile + web layout (title, Add Review, cards, arrows).
 */
export default function ReviewsSection({ reviews }: Props) {
  return (
    <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
      {/* One row on mobile — same as detail open page */}
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
        <h2 className="shrink-0 text-[13px] font-medium text-[#999999] sm:text-[14px]">
          Reviews
        </h2>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#262626] bg-[#141414] px-2.5 py-1.5 text-[12px] font-normal text-white transition hover:border-[#404040] sm:px-3 sm:py-2 sm:text-[13px]"
        >
          <FaPlus className="h-3 w-3 text-white" />
          <span className="whitespace-nowrap font-normal">Add Your Review</span>
        </button>
      </div>
      <ReviewsBlock reviews={reviews} />
    </section>
  );
}
