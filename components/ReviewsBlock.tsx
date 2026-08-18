"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import type { MovieReview } from "@/lib/types";

/** Cast / review arrows: fill #141414, stroke #262626, icon #999999 */
const arrowBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#999999] transition hover:text-white sm:h-10 sm:w-10";

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  const stars = Math.min(max, Math.max(0, Math.round(value)));
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={i < stars ? "/Icons/Star.svg" : "/Icons/Empty Star.svg"}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden
        />
      ))}
      <span className="ml-1 text-xs font-medium tabular-nums text-white">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

type Props = {
  reviews: MovieReview[];
};

/**
 * Reviews carousel — same on detail + watch.
 * Mobile: 1 card at a time (not stacked). Web: 2 cards side by side.
 */
export default function ReviewsBlock({ reviews }: Props) {
  const [page, setPage] = useState(0);
  /** Mobile: 1 card (no stack). sm+: 2 columns */
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setPerPage(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const totalPages = Math.max(1, Math.ceil(reviews.length / Math.max(1, perPage)));
  const safePage = Math.min(page, totalPages - 1);
  const slice = reviews.slice(
    safePage * perPage,
    safePage * perPage + perPage,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  if (!reviews.length) {
    return <p className="text-[13px] text-[#999999]">No reviews yet.</p>;
  }

  return (
    <div className="min-w-0">
      {/*
        Mobile: single card (not stacked).
        sm+: 2-column grid.
      */}
      <div
        className={[
          "grid min-w-0 gap-3 sm:gap-4",
          perPage === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        ].join(" ")}
      >
        {slice.map((r) => {
          const rating = r.rating != null ? r.rating / 2 : 0;
          return (
            <article
              key={r.id}
              className="min-w-0 rounded-xl border border-[#262626] bg-[#141414] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-white sm:text-[13px]">
                    {r.author}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#999999]">
                    {r.location ?? "From USA"}
                  </p>
                </div>
                <div className="shrink-0 rounded-full border border-[#262626] bg-[#0F0F0F] px-2.5 py-1">
                  <StarRow value={rating} />
                </div>
              </div>
              <p className="mt-3 line-clamp-4 text-[13px] font-normal leading-relaxed text-[#999999]">
                {r.content}
              </p>
            </article>
          );
        })}
        {/* Keep 2-col shape on web when last page has one card */}
        {slice.length === 1 && perPage === 2 ? (
          <div className="hidden sm:block" aria-hidden />
        ) : null}
      </div>

      {/* Left / right arrows + red segments */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() =>
            setPage((p) => (p - 1 + totalPages) % totalPages)
          }
          className={arrowBtnClass}
          aria-label="Previous reviews"
        >
          <FiArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className="h-[3px] rounded-full"
              style={{
                width: i === safePage ? 18 : 8,
                backgroundColor: i === safePage ? "#E50000" : "#333",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => (p + 1) % totalPages)}
          className={arrowBtnClass}
          aria-label="Next reviews"
        >
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
