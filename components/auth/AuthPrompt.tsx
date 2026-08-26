"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import VerifyForm from "@/components/auth/VerifyForm";
import GoogleAuthButton, {
  AuthOrDivider,
} from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { maskEmail } from "@/lib/auth/public";

type Mode = "choice" | "login" | "signup-choose" | "signup-email" | "verify";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  mediaKind?: "movie" | "show";
};

export default function AuthPrompt({
  open,
  onClose,
  onAuthenticated,
  mediaKind = "movie",
}: Props) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("choice");
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verifyFrom, setVerifyFrom] = useState<"login" | "signup">("signup");

  useEffect(() => {
    if (!open) return;
    setMode("choice");
    setEmail("");
    setVerificationId("");
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

  const kindLabel = mediaKind === "show" ? "show" : "movie";
  const browseLabel = mediaKind === "show" ? "shows" : "movies";

  return (
    <div
      className="fixed inset-0 z-[300] overflow-y-auto overflow-x-hidden bg-black/70"
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
      <div className="relative flex min-h-full items-start justify-center px-[5%] py-8 pt-[calc(var(--header-h)+2rem)] sm:items-center sm:px-6 sm:py-10">
      <div className="relative w-full max-w-[640px] rounded-2xl border border-[#262626] bg-[#0F0F0F] p-5 shadow-2xl sm:p-6 md:p-8">
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
              className="pr-8 text-[20px] font-bold text-white sm:text-[28px]"
            >
              Create an account to continue watching
            </h2>
            <p className="text-[14px] leading-relaxed text-[#999999] sm:text-[16px]">
              An account is required to play this {kindLabel}. You can still
              browse {browseLabel} and view details without signing in.
            </p>
            <div className="flex flex-col gap-3 pt-1">
              <Button className="!w-full" onClick={() => setMode("signup-choose")}>
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
            <h1
              id="auth-prompt-title"
              className="pr-8 text-[20px] font-bold text-white sm:text-[28px]"
            >
              Log In
            </h1>
            <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
              Welcome back to StreamVibe.
            </p>
            <div className="mt-6">
              <div className="space-y-5">
                <LoginForm
                  onSuccess={() => void finish()}
                  forgotHref="/forgot-password"
                  onNeedVerify={(nextEmail) => {
                    setEmail(nextEmail);
                    setVerifyFrom("login");
                    setMode("verify");
                  }}
                />
                <AuthOrDivider />
                <GoogleAuthButton
                  label="Continue with Google"
                  onSuccess={() => void finish()}
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-[#999999]">
                New to StreamVibe?{" "}
                <button
                  type="button"
                  className="font-medium text-white outline-none hover:text-cta"
                  onClick={() => setMode("signup-choose")}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        ) : null}

        {mode === "signup-choose" ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode("choice")}
              aria-label="Back"
              className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg text-white outline-none transition hover:bg-[#141414]"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h2
              id="auth-prompt-title"
              className="pr-8 text-[20px] font-bold text-white sm:text-[28px]"
            >
              Sign Up
            </h2>
            <p className="mb-2 text-[14px] text-[#999999] sm:text-[16px]">
              Create an account to start watching.
            </p>
            <Button
              type="button"
              className="!w-full border border-[#999999] !bg-transparent !text-white hover:!bg-transparent"
              onClick={() => setMode("signup-email")}
            >
              Sign up with email
            </Button>
            <AuthOrDivider />
            <GoogleAuthButton
              label="Sign up with Google"
              onSuccess={() => void finish()}
            />
            <p className="pt-1 text-center text-[13px] text-[#999999]">
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

        {mode === "signup-email" ? (
          <div>
            <button
              type="button"
              onClick={() => setMode("signup-choose")}
              aria-label="Back"
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg text-white outline-none transition hover:bg-[#141414]"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h2
              id="auth-prompt-title"
              className="mb-1 pr-8 text-[20px] font-bold text-white sm:text-[28px]"
            >
              Sign Up
            </h2>
            <p className="mb-4 text-[14px] text-[#999999] sm:text-[16px]">
              Create an account to start watching.
            </p>
            <SignupForm
              onSuccess={(result) => {
                setEmail(result.email);
                setVerificationId(result.verificationId ?? "");
                if (result.requiresVerification) {
                  toast.success("Verification email sent.");
                  setVerifyFrom("signup");
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
            <button
              type="button"
              onClick={() =>
                setMode(verifyFrom === "login" ? "login" : "signup-email")
              }
              aria-label="Back"
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg text-white outline-none transition hover:bg-[#141414]"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h2
              id="auth-prompt-title"
              className="mb-1 pr-8 text-[20px] font-bold text-white sm:text-[28px]"
            >
              Verify your email
            </h2>
            <p className="mb-5 overflow-hidden text-ellipsis whitespace-nowrap pr-8 text-[14px] text-[#999999] sm:text-[16px]">
              Enter the 6-digit code we sent to {maskEmail(email)}.
            </p>
            <VerifyForm
              email={email}
              verificationId={verificationId}
              onSuccess={() => void finish()}
            />
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
