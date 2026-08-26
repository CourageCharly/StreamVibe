"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/auth/PasswordField";
import { MESSAGES } from "@/lib/auth/errors";
import { rememberAccountProof } from "@/lib/auth/account-proof";
import { dispatchOtpEmail } from "@/lib/auth/dispatch-otp";
import { cn } from "@/lib";

type Result = {
  email: string;
  requiresVerification: boolean;
  verificationId?: string;
  developmentCode?: string;
};

type Props = {
  onSuccess?: (result: Result) => void;
  className?: string;
};

const fieldChrome =
  "w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#999999] focus:border-[#404040]";

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
};

const empty: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirm: "",
};

export default function SignupForm({ onSuccess, className }: Props) {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  function validate(next = fields) {
    const e: Partial<Fields> = {};
    if (!next.firstName.trim()) e.firstName = "First name is required.";
    if (!next.lastName.trim()) e.lastName = "Last name is required.";
    if (!next.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (next.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (next.confirm !== next.password) {
      e.confirm = "Passwords do not match.";
    }
    return e;
  }

  function setField<K extends keyof Fields>(key: K, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    if (touched[key]) setErrors(validate(next));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirm: true,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || submitting) return;

    setSubmitting(true);
    try {
      const userId = crypto.randomUUID();
      const res = await fetch(`/api/user/registration/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: fields.email,
            password: fields.password,
            firstName: fields.firstName,
            lastName: fields.lastName,
          },
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        fieldErrors?: Partial<Fields>;
        requiresVerification?: boolean;
        verificationId?: string;
        emailSent?: boolean;
        dispatchCode?: string;
        accountProof?: string;
      };
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || MESSAGES.registerFailed);
        return;
      }
      if (data.accountProof) {
        rememberAccountProof(fields.email, data.accountProof);
      }
      if (data.dispatchCode) {
        await dispatchOtpEmail(
          fields.email.trim().toLowerCase(),
          data.dispatchCode,
          "verify",
        );
      }
      setFields(empty);
      setTouched({});
      setErrors({});
      onSuccess?.({
        email: fields.email,
        requiresVerification: Boolean(data.requiresVerification),
        verificationId: data.verificationId,
      });
    } catch {
      toast.error(MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  const rows: Array<{
    key: keyof Fields;
    label: string;
    type: string;
    autoComplete: string;
    placeholder: string;
  }> = [
    {
      key: "firstName",
      label: "First name",
      type: "text",
      autoComplete: "given-name",
      placeholder: "First name",
    },
    {
      key: "lastName",
      label: "Last name",
      type: "text",
      autoComplete: "family-name",
      placeholder: "Last name",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@email.com",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "At least 8 characters",
    },
    {
      key: "confirm",
      label: "Confirm password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "Re-enter password",
    },
  ];

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.slice(0, 2).map((row) => (
          <div key={row.key}>
            <label className="mb-2 block text-[13px] font-medium">
              {row.label}
            </label>
            <input
              type={row.type}
              name={row.key}
              autoComplete={row.autoComplete}
              value={fields[row.key]}
              onChange={(e) => setField(row.key, e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, [row.key]: true }));
                setErrors(validate());
              }}
              className={fieldChrome}
              placeholder={row.placeholder}
            />
            {touched[row.key] && errors[row.key] ? (
              <p className="mt-1.5 text-[12px] text-cta">{errors[row.key]}</p>
            ) : null}
          </div>
        ))}
      </div>
      {rows.slice(2).map((row) => (
        <div key={row.key}>
          <label className="mb-2 block text-[13px] font-medium">{row.label}</label>
          {row.type === "password" ? (
            <PasswordField
              name={row.key}
              autoComplete={row.autoComplete}
              value={fields[row.key]}
              onChange={(e) => setField(row.key, e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, [row.key]: true }));
                setErrors(validate());
              }}
              placeholder={row.placeholder}
            />
          ) : (
            <input
              type={row.type}
              name={row.key}
              autoComplete={row.autoComplete}
              value={fields[row.key]}
              onChange={(e) => setField(row.key, e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, [row.key]: true }));
                setErrors(validate());
              }}
              className={fieldChrome}
              placeholder={row.placeholder}
            />
          )}
          {touched[row.key] && errors[row.key] ? (
            <p className="mt-1.5 text-[12px] text-cta">{errors[row.key]}</p>
          ) : null}
        </div>
      ))}
      <Button type="submit" disabled={submitting} className="!w-full">
        {submitting ? "Creating account…" : "Sign Up"}
      </Button>
    </form>
  );
}
