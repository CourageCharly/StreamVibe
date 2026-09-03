"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useLockBodyScroll } from "@/lib/use-lock-body";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatResetRemaining,
  watchLimitResetAt,
} from "@/lib/subscription";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DailyLimitModal({ open, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [remaining, setRemaining] = useState("");
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const ms = watchLimitResetAt(user?.id) - Date.now();
      setRemaining(formatResetRemaining(ms));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open, user?.id]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 p-[5%] sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="daily-limit-title"
      aria-describedby="daily-limit-body"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#262626] bg-[#1A1A1A] p-6 shadow-2xl sm:p-8">
        <h2
          id="daily-limit-title"
          className="text-[20px] font-semibold text-white sm:text-[22px]"
        >
          Daily Viewing Limit Reached
        </h2>
        <p
          id="daily-limit-body"
          className="mt-3 text-[14px] leading-relaxed text-[#999999] sm:text-[16px]"
        >
          You&apos;ve reached your daily limit of 10 movies and shows. Upgrade
          your plan to continue enjoying more movies and shows.
        </p>
        {remaining ? (
          <p className="mt-2 text-[14px] leading-relaxed text-[#999999] sm:text-[16px]">
            Resets in {remaining}.
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className="!w-full"
            onClick={() => {
              onClose();
              router.push("/subscriptions");
            }}
          >
            Upgrade Plan
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="!w-full"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
