import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupPage } from "@/components/auth/AuthPages";
import { AuthCardSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a StreamVibe account to start watching.",
};

export default function Page() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <SignupPage />
    </Suspense>
  );
}
