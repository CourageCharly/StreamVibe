import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/AuthPages";
import { AuthCardSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to StreamVibe to start watching.",
};

export default function Page() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginPage />
    </Suspense>
  );
}
