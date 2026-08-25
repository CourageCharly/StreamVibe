"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Button from "@/components/ui/Button";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import VerifyForm from "@/components/auth/VerifyForm";
import { useAuth } from "@/components/auth/AuthProvider";

type Mode = "choice" | "login" | "signup" | "verify";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
};

export default function AuthPrompt({ open, onClose, onAuthenticated }: Props) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("choice");
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  async function finish() {
    await refresh();
    onAuthenticated();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-[5%] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[820px] rounded-2xl border border-[#262626] bg-[#0F0F0F] p-5 shadow-2xl sm:p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#999999] outline-none transition hover:bg-[#141414] hover:text-white"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>

        {mode === "choice" ? (
          <div className="space-y-4">
            <h2
              id="auth-prompt-title"
              className="pr-8 text-[20px] font-semibold text-white"
            >
              Create an account to continue watching
            </h2>
            <p className="min-w-0 text-[14px] leading-relaxed text-[#999999] sm:min-w-[min(100%,400px)] sm:text-[16px]">
              An account is required to play this title. You can still browse
              movies and view details without signing in.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Button className="!w-full" onClick={() => setMode("signup")}>
                Sign Up
              </Button>
              <Button
                variant="secondary"
                className="!w-full"
                onClick={() => setMode("login")}
              >
                Log In
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "login" ? (
          <div>
            <h2
              id="auth-prompt-title"
              className="mb-1 pr-8 text-[20px] font-semibold text-white"
            >
              Log In
            </h2>
            <p className="mb-4 text-[14px] text-[#999999] sm:text-[16px]">
              Welcome back. Sign in to start watching.
            </p>
            <LoginForm
              onSuccess={() => void finish()}
              onNeedVerify={(nextEmail) => {
                setEmail(nextEmail);
                setMode("verify");
              }}
            />
            <p className="mt-4 text-center text-[13px] text-[#999999]">
              New to StreamVibe?{" "}
              <button
                type="button"
                className="font-medium text-white outline-none hover:text-cta"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </p>
          </div>
        ) : null}

        {mode === "signup" ? (
          <div>
            <h2
              id="auth-prompt-title"
              className="mb-1 pr-8 text-[20px] font-semibold text-white"
            >
              Sign Up
            </h2>
            <p className="mb-4 text-[14px] text-[#999999] sm:text-[16px]">
              Create your account to start watching.
            </p>
            <SignupForm
              onSuccess={(result) => {
                setEmail(result.email);
                setVerificationId(result.verificationId ?? "");
                if (result.requiresVerification) {
                  toastVerifySent();
                  setMode("verify");
                  return;
                }
                void finish();
              }}
            />
            <p className="mt-4 text-center text-[13px] text-[#999999]">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-white outline-none hover:text-cta"
                onClick={() => setMode("login")}
              >
                Log In
              </button>
            </p>
          </div>
        ) : null}

        {mode === "verify" ? (
          <div>
            <h2
              id="auth-prompt-title"
              className="mb-1 pr-8 text-[20px] font-semibold text-white"
            >
              Verify your email
            </h2>
            <VerifyForm
              email={email}
              verificationId={verificationId}
              onSuccess={() => void finish()}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function toastVerifySent() {
  void import("sonner").then(({ toast }) => {
    toast.success("Verification email sent.");
  });
}
