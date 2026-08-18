"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { rememberReturnTo } from "@/lib/auth/return-to";

export default function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
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
    return <>{fallback}</>;
  }

  if (status !== "authenticated") return null;
  return <>{children}</>;
}
