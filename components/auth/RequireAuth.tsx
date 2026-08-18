"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { rememberReturnTo } from "@/lib/auth/return-to";
import PageWrapper from "@/components/PageWrapper";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "anonymous") return;
    rememberReturnTo(pathname);
    router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="w-full bg-[#141414] pt-[var(--header-h)]">
        <PageWrapper className="py-10">
          <div className="mx-auto max-w-md space-y-3">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-[#1A1A1A]" />
            <div className="h-40 animate-pulse rounded-2xl bg-[#1A1A1A]" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (status !== "authenticated") return null;
  return <>{children}</>;
}
