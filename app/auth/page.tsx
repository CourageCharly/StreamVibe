import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthChoicePage } from "@/components/auth/AuthPages";
import { AuthCardSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  description: "Create an account or log in to start watching on StreamVibe.",
};

export default function Page() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <AuthChoicePage />
    </Suspense>
  );
}
