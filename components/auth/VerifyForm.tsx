"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import OtpInput from "@/components/auth/OtpInput";
import { MESSAGES } from "@/lib/auth/errors";
import { fusionAuthApplicationIdSafe } from "@/lib/auth/public";
import { cn } from "@/lib";

type Props = {
  email: string;
  verificationId?: string;
  onSuccess?: () => void;
  className?: string;
};

export default function VerifyForm({
  email,
  verificationId,
  onSuccess,
  className,
}: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [activeVerificationId, setActiveVerificationId] = useState(
    verificationId ?? "",
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/user/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          oneTimeCode: code.trim(),
          verificationId: activeVerificationId || undefined,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || MESSAGES.verifyFailed);
        toast.error(data.message || MESSAGES.verifyFailed);
        return;
      }
      toast.success("Your email is verified.");
      onSuccess?.();
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (resending) return;
    setResending(true);
    try {
      const qs = new URLSearchParams({
        applicationId: fusionAuthApplicationIdSafe(),
        email,
      });
      const res = await fetch(`/api/user/verify-registration?${qs.toString()}`, {
        method: "PUT",
      });
      const data = (await res.json()) as {
        message?: string;
        verificationId?: string;
      };
      if (!res.ok) {
        toast.error(data.message || MESSAGES.resendFailed);
        return;
      }
      if (data.verificationId) setActiveVerificationId(data.verificationId);
      setCode("");
      toast.success("A new code was sent.");
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-5", className)} noValidate>
      <div>
        <OtpInput
          id="verify-otp"
          value={code}
          onChange={(next) => {
            setCode(next);
            if (next.length === 6) setError("");
          }}
          disabled={submitting}
        />
        {touched && error ? (
          <p className="mt-2 text-[12px] text-cta">{error}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting} className="!w-full">
        {submitting ? "Verifying…" : "Verify"}
      </Button>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={resending}
        className="w-full text-center text-[13px] text-[#999999] outline-none transition hover:text-white disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
    </form>
  );
}
