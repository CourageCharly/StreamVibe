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
      className="fixed inset-0 z-[320] flex items-end justify-center bg-black/70 p-[5%] sm:items-center sm:p-6"
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 shadow-2xl sm:p-6">
        <h2
          id="review-success-title"
          className="text-[20px] font-semibold text-white"
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
