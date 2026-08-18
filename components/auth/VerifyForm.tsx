"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { MESSAGES } from "@/lib/auth/errors";
import { fusionAuthApplicationIdSafe } from "@/lib/auth/public";
import { cn } from "@/lib";

type Props = {
  email: string;
  verificationId?: string;
  developmentCode?: string;
  onSuccess?: () => void;
  className?: string;
};

const fieldChrome =
  "w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#999999] focus:border-[#404040]";

export default function VerifyForm({
  email,
  verificationId,
  developmentCode,
  onSuccess,
  className,
}: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState(developmentCode ?? "");
  const [activeVerificationId, setActiveVerificationId] = useState(
    verificationId ?? "",
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!code.trim() && !activeVerificationId) {
      setError("Enter the verification code from your email.");
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
          oneTimeCode: code.trim() || undefined,
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
        developmentCode?: string;
        verificationId?: string;
      };
      if (!res.ok) {
        toast.error(data.message || MESSAGES.resendFailed);
        return;
      }
      if (data.developmentCode) setDevCode(data.developmentCode);
      if (data.verificationId) setActiveVerificationId(data.verificationId);
      toast.success("Verification email sent.");
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
      <p className="text-[14px] leading-relaxed text-[#999999] sm:text-[16px]">
        We sent a verification code to{" "}
        <span className="font-medium text-white">{email}</span>. Enter it below
        to finish creating your account.
      </p>
      {devCode ? (
        <p className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-2 text-[12px] text-[#999999]">
          Local development code:{" "}
          <span className="font-medium text-white">{devCode}</span>
        </p>
      ) : null}
      <div>
        <label htmlFor="verify-code" className="mb-2 block text-[13px] font-medium">
          Verification code
        </label>
        <input
          id="verify-code"
          name="code"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (touched && e.target.value.trim()) setError("");
          }}
          onBlur={() => setTouched(true)}
          className={fieldChrome}
          placeholder="6-digit code"
        />
        {touched && error ? (
          <p className="mt-1.5 text-[12px] text-cta">{error}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting} className="!w-full">
        {submitting ? "Verifying…" : "Verify email"}
      </Button>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={resending}
        className="w-full text-center text-[13px] text-[#999999] outline-none transition hover:text-white disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
