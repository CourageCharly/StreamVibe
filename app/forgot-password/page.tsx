import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your StreamVibe password.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] pt-[var(--header-h)]" />}>
      <ForgotPasswordFlow />
    </Suspense>
  );
}
