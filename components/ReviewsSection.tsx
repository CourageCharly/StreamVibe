"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import ReviewsBlock from "@/components/ReviewsBlock";
import ReviewForm from "@/components/ReviewForm";
import ReviewSuccessModal from "@/components/ReviewSuccessModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { NOTICE_EVENT } from "@/lib/notifications";
import {
  getLocalReviews,
  mediaReviewHref,
  mediaReviewKey,
  mediaReviewWriteHref,
  mergeReviews,
  takeReviewSuccess,
} from "@/lib/reviews";
import type { MovieReview } from "@/lib/types";

type Props = {
  reviews: MovieReview[];
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
};

/**
 * Reviews section shell — shared by movie/show detail + watch.
 * Mobile: Add Review opens a page. Web: overlay modal (bg does not scroll).
 */
export default function ReviewsSection({
  reviews,
  mediaId,
  mediaType,
  title,
}: Props) {
  const router = useRouter();
  const { status } = useAuth();
  const loggedIn = status === "authenticated";
  const [formOpen, setFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const reviewKey = mediaReviewKey(mediaType, mediaId);
  const href = mediaReviewHref(mediaType, mediaId);
  const all = mergeReviews(reviews, getLocalReviews(reviewKey));
  void tick;

  useEffect(() => {
    if (takeReviewSuccess(href)) setSuccessOpen(true);
  }, [href]);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener(NOTICE_EVENT, refresh);
    return () => window.removeEventListener(NOTICE_EVENT, refresh);
  }, []);

  function openReview() {
    if (!loggedIn) return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      router.push(mediaReviewWriteHref(mediaType, mediaId));
      return;
    }
    setFormOpen(true);
  }

  return (
    <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
        <h2 className="shrink-0 text-[13px] font-medium text-[#999999] sm:text-[14px]">
          Reviews
        </h2>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <button
            type="button"
            disabled={!loggedIn}
            aria-disabled={!loggedIn}
            onClick={openReview}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#262626] bg-[#141414] px-2.5 py-1.5 text-[14px] font-semibold text-white outline-none transition hover:border-[#404040] disabled:cursor-not-allowed disabled:opacity-45 sm:px-3 sm:py-2"
          >
            <FaPlus className="h-3 w-3 text-white" />
            <span className="whitespace-nowrap font-normal">
              Add Your Review
            </span>
          </button>
          {!loggedIn ? (
            <p className="text-[11px] text-[#999999]">
              Log in to share your review.
            </p>
          ) : null}
        </div>
      </div>
      <ReviewsBlock reviews={all} />
      <ReviewForm
        open={formOpen}
        mediaId={mediaId}
        mediaType={mediaType}
        title={title}
        onClose={() => setFormOpen(false)}
        onCreated={() => setTick((n) => n + 1)}
      />
      <ReviewSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </section>
  );
}
