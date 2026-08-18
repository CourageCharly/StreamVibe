"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import type { MovieReview } from "@/lib/types";
import {
  REVIEW_APPROVE_MS,
  mediaReviewHref,
  mediaReviewKey,
  saveLocalReview,
} from "@/lib/reviews";

type Props = {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  onPosted: () => void;
};

export default function ReviewComposer({
  mediaId,
  mediaType,
  title,
  onPosted,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; content?: string }>(
    {},
  );
  const [touched, setTouched] = useState<{
    rating?: boolean;
    content?: boolean;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(nextRating = rating, nextContent = content) {
    const next: { rating?: string; content?: string } = {};
    if (nextRating < 1) next.rating = "Please choose a rating.";
    if (nextContent.trim().length < 10) {
      next.content = "Please write at least 10 characters.";
    }
    return next;
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
      const href = mediaReviewHref(mediaType, mediaId);
      saveLocalReview(mediaReviewKey(mediaType, mediaId), {
        ...data.review,
        status: "pending",
        mediaTitle: title,
        mediaHref: href,
        approveAt: Date.now() + REVIEW_APPROVE_MS,
      });
      onPosted();
    } catch {
      toast.error("Unable to save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                  src={active ? "/Icons/Star.svg" : "/Icons/Empty Star.svg"}
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
  );
}
