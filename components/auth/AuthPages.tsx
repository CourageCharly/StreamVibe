"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import VerifyForm from "@/components/auth/VerifyForm";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  clearReturnTo,
  readReturnTo,
  sanitizeReturnTo,
} from "@/lib/auth/return-to";

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
      <LoginForm
        onSuccess={() => void done()}
        onNeedVerify={(email) => {
          router.replace(
            `/verify?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`,
          );
        }}
      />
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

  if (status === "authenticated") {
    clearReturnTo();
    router.replace(returnTo);
    return null;
  }

  return (
    <AuthShell title="Sign Up" subtitle="Create an account to start watching.">
      <SignupForm
        onSuccess={(result) => {
          if (result.requiresVerification) {
            toast.success("Verification email sent.");
            const qs = new URLSearchParams({
              email: result.email,
              returnTo,
            });
            if (result.verificationId) qs.set("vid", result.verificationId);
            if (result.developmentCode) qs.set("dev", result.developmentCode);
            router.replace(`/verify?${qs.toString()}`);
            return;
          }
          void refresh().then(() => {
            clearReturnTo();
            router.replace(returnTo);
          });
        }}
      />
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
        developmentCode={params.get("dev") ?? undefined}
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
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-7">
          <h1 className="text-[28px] font-semibold text-white">{title}</h1>
          <p className="mt-2 min-w-0 text-[14px] text-[#999999] sm:min-w-[min(100%,400px)]">
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
