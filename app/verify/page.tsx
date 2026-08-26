import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyPage } from "@/components/auth/AuthPages";
import { AuthCardSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your StreamVibe account.",
};

export default function Page() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <VerifyPage />
    </Suspense>
  );
}
