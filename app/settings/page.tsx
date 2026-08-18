"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import { applicationIdClient } from "@/lib/auth/public";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsInner />
    </RequireAuth>
  );
}

function SettingsInner() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/user/registration/${user.id}/${applicationIdClient()}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: { firstName: firstName.trim(), lastName: lastName.trim() },
          }),
        },
      );
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        toast.error(data.message || "Unable to update your profile.");
        return;
      }
      await refresh();
      toast.success("Profile updated.");
    } catch {
      toast.error("Unable to update your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="py-8 sm:py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-7">
          <h1 className="text-[20px] font-bold text-white sm:text-[28px]">
            Settings
          </h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] outline-none focus:border-[#404040]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 text-[14px] outline-none focus:border-[#404040]"
              />
            </div>
            <Button type="submit" disabled={submitting} className="!w-full">
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => router.replace("/"));
            }}
            className="mt-6 text-[13px] text-[#999999] outline-none hover:text-white"
          >
            Log Out
          </button>
        </div>
      </PageWrapper>
    </div>
  );
}
