"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import ReviewComposer from "@/components/ReviewComposer";
import ReviewSuccessModal from "@/components/ReviewSuccessModal";
import { useLockBodyScroll } from "@/lib/use-lock-body";

type Props = {
  open: boolean;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function ReviewForm({
  open,
  mediaId,
  mediaType,
  title,
  onClose,
  onCreated,
}: Props) {
  const [success, setSuccess] = useState(false);
  useLockBodyScroll(open && !success);

  useEffect(() => {
    if (!open) setSuccess(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open && !success) return null;

  return (
    <>
      {open && !success ? (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-[5%] sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
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
            <div className="mt-5">
              <ReviewComposer
                mediaId={mediaId}
                mediaType={mediaType}
                title={title}
                onPosted={() => {
                  onCreated();
                  setSuccess(true);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      <ReviewSuccessModal
        open={success}
        onClose={() => {
          setSuccess(false);
          onClose();
        }}
      />
    </>
  );
}
