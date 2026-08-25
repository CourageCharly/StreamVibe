"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/auth/PasswordField";
import { rememberAccountProof } from "@/lib/auth/account-proof";
import { MESSAGES } from "@/lib/auth/errors";
import { cn } from "@/lib";

type Props = {
  onSuccess?: () => void;
  onNeedVerify?: (email: string) => void;
  forgotHref?: string;
  className?: string;
};

const fieldChrome =
  "w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#999999] focus:border-[#404040]";

export default function LoginForm({
  onSuccess,
  onNeedVerify,
  forgotHref = "/forgot-password",
  className,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>(
    {},
  );

  function validate(nextEmail = email, nextPassword = password) {
    const next: { email?: string; password?: string } = {};
    if (!nextEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      next.email = "Please enter a valid email address.";
    }
    if (!nextPassword) next.password = "Password is required.";
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setTouched({ email: true, password: true });
    setErrors(next);
    if (Object.keys(next).length || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        message?: string;
        requiresVerification?: boolean;
        email?: string;
        accountProof?: string;
      };
      if (!res.ok) {
        if (data.requiresVerification) {
          onNeedVerify?.(data.email || email);
          toast.error("Please verify your email before continuing.");
          return;
        }
        toast.error(data.message || MESSAGES.loginFailed);
        return;
      }
      if (data.accountProof) {
        rememberAccountProof(email, data.accountProof);
      }
      onSuccess?.();
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
      <div>
        <label htmlFor="login-email" className="mb-2 block text-[13px] font-medium">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched.email) setErrors(validate(e.target.value, password));
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            setErrors(validate());
          }}
          className={fieldChrome}
          placeholder="you@email.com"
        />
        {touched.email && errors.email ? (
          <p className="mt-1.5 text-[12px] text-cta">{errors.email}</p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-[13px] font-medium"
        >
          Password
        </label>
        <PasswordField
          id="login-password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (touched.password) setErrors(validate(email, e.target.value));
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, password: true }));
            setErrors(validate());
          }}
          placeholder="Your password"
        />
        {touched.password && errors.password ? (
          <p className="mt-1.5 text-[12px] text-cta">{errors.password}</p>
        ) : null}
        <div className="mt-2 text-right">
          <a
            href={forgotHref}
            className="text-[13px] font-medium text-[#999999] hover:text-white"
          >
            Forgot password?
          </a>
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="!w-full">
        {submitting ? "Signing in…" : "Log In"}
      </Button>
    </form>
  );
}
