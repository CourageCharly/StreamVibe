"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
import Button from "@/components/ui/Button";
import OtpInput from "@/components/auth/OtpInput";
import PasswordField from "@/components/auth/PasswordField";
import { MESSAGES } from "@/lib/auth/errors";
import { sanitizeReturnTo } from "@/lib/auth/return-to";

type Step = "email" | "otp" | "reset" | "success";

const RESEND_SECONDS = 60;

const fieldChrome =
  "w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#999999] focus:border-[#404040]";

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ForgotPasswordFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = sanitizeReturnTo(params.get("returnTo") || "/login");
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [step, resendIn]);

  async function requestResetCode() {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as {
      message?: string;
    };
    if (!res.ok) {
      throw new Error(data.message || "Unable to send a reset code.");
    }
    setCode("");
    setStep("otp");
    setResendIn(RESEND_SECONDS);
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await requestResetCode();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to send a reset code.";
      if (message === MESSAGES.network || message.includes("fetch")) {
        toast.error(MESSAGES.network);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOtp(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, verifyOnly: true }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "That code is incorrect.");
        return;
      }
      setStep("reset");
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Unable to reset your password.");
        return;
      }
      setStep("success");
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: "Forgot password",
      subtitle: "Enter the email on your account and we will send a reset code.",
    },
    otp: {
      title: "Enter verification code",
      subtitle: `We sent a 6-digit code to ${email}.`,
    },
    reset: {
      title: "Create a new password",
      subtitle: "Choose a new password for your StreamVibe account.",
    },
    success: {
      title: "Password updated",
      subtitle: "Your password has been changed. You can log in with it now.",
    },
  };

  return (
    <div className="w-full min-w-0 bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="flex min-h-[70vh] items-center py-10 sm:py-14">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#262626] bg-[#1A1A1A] p-6 sm:p-8 lg:p-10">
          <h1 className="text-[20px] font-bold text-white sm:text-[28px]">
            {titles[step].title}
          </h1>
          <p
            className={
              step === "otp"
                ? "mt-2 whitespace-nowrap text-[14px] text-[#999999]"
                : "mt-2 text-[14px] text-[#999999] sm:text-[16px]"
            }
          >
            {titles[step].subtitle}
          </p>
          <div className="mt-6">
            {step === "email" ? (
              <form onSubmit={(e) => void sendCode(e)} className="space-y-4" noValidate>
                <div>
                  <label className="mb-2 block text-[13px] font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={fieldChrome}
                    placeholder="you@email.com"
                  />
                </div>
                {error ? <p className="text-[12px] text-cta">{error}</p> : null}
                <Button type="submit" disabled={submitting} className="!w-full">
                  {submitting ? "Continuing…" : "Continue"}
                </Button>
              </form>
            ) : null}

            {step === "otp" ? (
              <form onSubmit={(e) => void confirmOtp(e)} className="space-y-5" noValidate>
                <OtpInput
                  value={code}
                  onChange={(next) => {
                    setCode(next);
                    setError("");
                  }}
                  disabled={submitting}
                />
                {error ? <p className="text-[12px] text-cta">{error}</p> : null}
                <Button type="submit" disabled={submitting} className="!w-full">
                  {submitting ? "Checking…" : "Continue"}
                </Button>
                {resendIn > 0 ? (
                  <p className="w-full text-center text-[13px] tabular-nums text-[#999999]">
                    {formatTimer(resendIn)}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="w-full text-center text-[13px] text-[#999999] hover:text-white disabled:opacity-60"
                    disabled={submitting}
                    onClick={() => {
                      if (submitting) return;
                      setSubmitting(true);
                      setError("");
                      void requestResetCode()
                        .catch((err) => {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Unable to send a reset code.",
                          );
                        })
                        .finally(() => setSubmitting(false));
                    }}
                  >
                    Resend
                  </button>
                )}
              </form>
            ) : null}

            {step === "success" ? (
              <div className="space-y-4">
                <Button
                  type="button"
                  className="!w-full"
                  onClick={() => router.replace(loginHref)}
                >
                  Log In
                </Button>
              </div>
            ) : null}

            {step === "reset" ? (
              <form onSubmit={(e) => void savePassword(e)} className="space-y-4" noValidate>
                <div>
                  <label className="mb-2 block text-[13px] font-medium">
                    New password
                  </label>
                  <PasswordField
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium">
                    Confirm password
                  </label>
                  <PasswordField
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter password"
                  />
                </div>
                {error ? <p className="text-[12px] text-cta">{error}</p> : null}
                <Button type="submit" disabled={submitting} className="!w-full">
                  {submitting ? "Saving…" : "Update password"}
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
