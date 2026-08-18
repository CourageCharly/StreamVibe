"use client";

import Button from "@/components/ui/Button";
import { useLockBodyScroll } from "@/lib/use-lock-body";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReviewSuccessModal({ open, onClose }: Props) {
  useLockBodyScroll(open);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 p-[5%] sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="review-success-title"
      aria-describedby="review-success-body"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#262626] bg-[#1A1A1A] p-6 text-center shadow-2xl sm:p-8">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/15"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-[#22c55e]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2
          id="review-success-title"
          className="mt-4 text-[20px] font-semibold text-white sm:text-[22px]"
        >
          Success
        </h2>
        <p
          id="review-success-body"
          className="mt-2 text-[14px] leading-relaxed text-[#999999] sm:text-[16px]"
        >
          Your review is pending approval. You will get a notification once it
          is approved.
        </p>
        <Button type="button" className="mt-6 !w-full" onClick={onClose}>
          OK
        </Button>
      </div>
    </div>
  );
}
