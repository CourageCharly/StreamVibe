"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackLink from "@/components/BackLink";

function AccountBackInner() {
  const from = useSearchParams().get("from");
  if (from !== "profile") return null;

  return (
    <div className="mb-4 flex min-w-0 items-center gap-2">
      <BackLink href="/profile" fallbackHref="/profile" aria-label="Back to profile" />
      <p className="text-sm font-medium text-cta">Profile</p>
    </div>
  );
}

export default function AccountBack() {
  return (
    <Suspense fallback={null}>
      <AccountBackInner />
    </Suspense>
  );
}
