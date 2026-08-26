import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";
import { AuthCardSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your StreamVibe password.",
};

export default function Page() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ForgotPasswordFlow />
    </Suspense>
  );
}
