"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import VerifyForm from "@/components/auth/VerifyForm";
import GoogleAuthButton, {
  AuthOrDivider,
} from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import {
  clearReturnTo,
  readReturnTo,
  sanitizeReturnTo,
} from "@/lib/auth/return-to";
import { maskEmail } from "@/lib/auth/public";

export function AuthChoicePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useAuth();
  const returnTo = sanitizeReturnTo(params.get("returnTo") || readReturnTo());

  if (status === "authenticated") {
    clearReturnTo();
    router.replace(returnTo);
    return null;
  }

  return (
    <AuthShell
      title="Create an account to continue watching"
      subtitle="An account is required to play this title. You can still browse movies and view details without signing in."
    >
      <div className="flex flex-col gap-3">
        <Link
          href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex h-[49px] w-full items-center justify-center rounded-lg bg-[#E50000] text-[14px] font-semibold text-white"
        >
          Sign Up
        </Link>
        <Link
          href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex h-[49px] w-full items-center justify-center rounded-lg border border-[#262626] bg-[#141414] text-[14px] font-semibold text-white"
        >
          Log In
        </Link>
      </div>
    </AuthShell>
  );
}

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, status } = useAuth();
  const returnTo = sanitizeReturnTo(params.get("returnTo") || readReturnTo());

  if (status === "authenticated") {
    clearReturnTo();
    router.replace(returnTo);
    return null;
  }

  async function done() {
    await refresh();
    clearReturnTo();
    router.replace(returnTo);
  }

  return (
    <AuthShell title="Log In" subtitle="Welcome back to StreamVibe.">
      <div className="space-y-5">
        <LoginForm
          onSuccess={() => void done()}
          forgotHref={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`}
          onNeedVerify={(email) => {
            router.replace(
              `/verify?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`,
            );
          }}
        />
        <AuthOrDivider />
        <GoogleAuthButton
          label="Continue with Google"
          onSuccess={() => void done()}
        />
      </div>
      <SwitchLink
        prompt="New to StreamVibe?"
        href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
        label="Sign Up"
      />
    </AuthShell>
  );
}

export function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, status } = useAuth();
  const returnTo = sanitizeReturnTo(params.get("returnTo") || readReturnTo());
  const [method, setMethod] = useState<"choose" | "email">("choose");

  if (status === "authenticated") {
    clearReturnTo();
    router.replace("/");
    return null;
  }

  async function signedIn() {
    await refresh();
    clearReturnTo();
    router.replace("/");
  }

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Create an account to start watching."
      onBack={method === "email" ? () => setMethod("choose") : undefined}
    >
      {method === "choose" ? (
        <div className="space-y-3">
          <Button
            type="button"
            className="!w-full border border-[#999999] !bg-transparent !text-white hover:!bg-transparent"
            onClick={() => setMethod("email")}
          >
            Sign up with email
          </Button>
          <AuthOrDivider />
          <GoogleAuthButton
            label="Sign up with Google"
            onSuccess={() => void signedIn()}
          />
        </div>
      ) : (
        <SignupForm
          onSuccess={(result) => {
            if (result.requiresVerification) {
              toast.success("Verification email sent.");
              const qs = new URLSearchParams({
                email: result.email,
                returnTo,
              });
              if (result.verificationId) qs.set("vid", result.verificationId);
              router.replace(`/verify?${qs.toString()}`);
              return;
            }
            void signedIn();
          }}
        />
      )}
      <SwitchLink
        prompt="Already have an account?"
        href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        label="Log In"
      />
    </AuthShell>
  );
}

export function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, status } = useAuth();
  const email = (params.get("email") ?? "").trim();
  const [missing] = useState(!email);

  if (status === "authenticated") {
    clearReturnTo();
    router.replace("/");
    return null;
  }

  if (missing) {
    router.replace("/signup");
    return null;
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${maskEmail(email)}.`}
      subtitleClassName="overflow-hidden text-ellipsis whitespace-nowrap"
    >
      <VerifyForm
        email={email}
        verificationId={params.get("vid") ?? undefined}
        onSuccess={() => {
          void refresh().then(() => {
            clearReturnTo();
            router.replace("/");
          });
        }}
      />
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
  onBack,
  subtitleClassName = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  subtitleClassName?: string;
}) {
  return (
    <div className="w-full min-w-0 bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-[#262626] bg-[#0F0F0F] p-5 sm:p-6 md:p-8">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg text-white outline-none transition hover:bg-[#141414] focus-visible:ring-2 focus-visible:ring-cta/60"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="text-[20px] font-bold text-white sm:text-[28px]">{title}</h1>
          <p
            className={`mt-2 min-w-0 text-[14px] text-[#999999] sm:text-[16px] ${subtitleClassName}`}
          >
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SwitchLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-4 text-center text-[13px] text-[#999999]">
      {prompt}{" "}
      <a href={href} className="font-medium text-white hover:text-cta">
        {label}
      </a>
    </p>
  );
}
