"use client";

import PageWrapper from "@/components/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const { user } = useAuth();
  if (!user) return null;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Member";

  return (
    <div className="w-full bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="py-8 sm:py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-7">
          <h1 className="text-[28px] font-semibold text-white">Profile</h1>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#262626] bg-[#141414] text-xl font-semibold">
              {(user.firstName?.[0] ?? user.email[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-medium text-white">{name}</p>
              <p className="truncate text-[14px] text-[#999999]">{user.email}</p>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
