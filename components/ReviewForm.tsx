"use client";

import { FormEvent, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import type { MovieReview } from "@/lib/types";
import { mediaReviewKey, saveLocalReview } from "@/lib/reviews";

type Props = {
  open: boolean;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  onClose: () => void;
  onCreated: (review: MovieReview) => void;
};

export default function ReviewForm({
  open,
  mediaId,
  mediaType,
  title,
  onClose,
  onCreated,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; content?: string }>(
    {},
  );
  const [touched, setTouched] = useState<{ rating?: boolean; content?: boolean }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function validate(nextRating = rating, nextContent = content) {
    const next: { rating?: string; content?: string } = {};
    if (nextRating < 1) next.rating = "Please choose a rating.";
    if (nextContent.trim().length < 10) {
      next.content = "Please write at least 10 characters.";
    }
    return next;
  }

  function reset() {
    setRating(0);
    setHover(0);
    setReviewTitle("");
    setContent("");
    setErrors({});
    setTouched({});
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setTouched({ rating: true, content: true });
    setErrors(next);
    if (Object.keys(next).length || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaType,
          rating,
          title: reviewTitle,
          content,
        }),
      });
      const data = (await res.json()) as {
        review?: MovieReview;
        message?: string;
        fieldErrors?: { rating?: string; content?: string };
      };
      if (!res.ok || !data.review) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || "Unable to save your review.");
        return;
      }
      saveLocalReview(mediaReviewKey(mediaType, mediaId), data.review);
      toast.success("Your review has been posted.");
      reset();
      onCreated(data.review);
      onClose();
    } catch {
      toast.error("Unable to save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-[5%] sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close review form"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-form-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#999999] outline-none hover:bg-[#141414] hover:text-white"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>
        <h2
          id="review-form-title"
          className="pr-8 text-[20px] font-semibold text-white"
        >
          Add Your Review
        </h2>
        <p className="mt-1 text-[13px] text-[#999999]">{title}</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <p className="mb-2 text-[13px] font-medium">Your rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                const active = (hover || rating) >= value;
                return (
                  <button
                    key={value}
                    type="button"
                    className="outline-none"
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => {
                      setRating(value);
                      setTouched((t) => ({ ...t, rating: true }));
                      setErrors(validate(value, content));
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        active ? "/Icons/Star.svg" : "/Icons/Empty Star.svg"
                      }
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7"
                    />
                  </button>
                );
              })}
            </div>
            {touched.rating && errors.rating ? (
              <p className="mt-1.5 text-[12px] text-cta">{errors.rating}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium">
              Headline <span className="text-[#666]">(optional)</span>
            </label>
            <input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] outline-none placeholder:text-[#999999] focus:border-[#404040]"
              placeholder="Sum up your review"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium">Review</label>
            <textarea
              value={content}
              rows={5}
              onChange={(e) => {
                setContent(e.target.value);
                if (touched.content) setErrors(validate(rating, e.target.value));
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, content: true }));
                setErrors(validate());
              }}
              className="w-full resize-y rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] outline-none placeholder:text-[#999999] focus:border-[#404040]"
              placeholder="What did you think?"
            />
            {touched.content && errors.content ? (
              <p className="mt-1.5 text-[12px] text-cta">{errors.content}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={submitting} className="!w-full">
            {submitting ? "Posting…" : "Submit review"}
          </Button>
        </form>
      </div>
    </div>
  );
}
