"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
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
          className="inline-flex h-[49px] w-full items-center justify-center rounded-lg bg-cta text-[14px] font-semibold text-white"
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
        <GoogleAuthButton
          label="Continue with Google"
          onSuccess={() => void done()}
        />
        <AuthOrDivider />
        <LoginForm
          onSuccess={() => void done()}
          forgotHref={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`}
          onNeedVerify={(email) => {
            router.replace(
              `/verify?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`,
            );
          }}
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
    router.replace(returnTo);
    return null;
  }

  async function signedIn() {
    await refresh();
    clearReturnTo();
    router.replace(returnTo);
  }

  return (
    <AuthShell title="Sign Up" subtitle="Create an account to start watching.">
      {method === "choose" ? (
        <div className="space-y-3">
          <GoogleAuthButton
            label="Sign up with Google"
            onSuccess={() => void signedIn()}
          />
          <AuthOrDivider />
          <Button
            type="button"
            className="!w-full"
            onClick={() => setMethod("email")}
          >
            Sign up with email
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            className="text-[13px] font-medium text-[#999999] hover:text-white"
            onClick={() => setMethod("choose")}
          >
            ← Back
          </button>
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
        </div>
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
  const email = params.get("email") ?? "";
  const returnTo = sanitizeReturnTo(params.get("returnTo") || readReturnTo());
  const [missing] = useState(!email);

  if (status === "authenticated") {
    clearReturnTo();
    router.replace(returnTo);
    return null;
  }

  if (missing) {
    router.replace("/signup");
    return null;
  }

  return (
    <AuthShell title="Verify your email" subtitle="Check your inbox to continue.">
      <VerifyForm
        email={email}
        verificationId={params.get("vid") ?? undefined}
        onSuccess={() => {
          void refresh().then(() => {
            clearReturnTo();
            router.replace(returnTo);
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
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0 bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="flex min-h-[70vh] items-center py-10 sm:py-14">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#262626] bg-[#1A1A1A] p-6 sm:p-8 lg:p-10">
          <h1 className="text-[20px] font-bold text-white sm:text-[28px]">{title}</h1>
          <p className="mt-2 min-w-0 text-[14px] text-[#999999] sm:min-w-[min(100%,400px)] sm:text-[16px]">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </PageWrapper>
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
