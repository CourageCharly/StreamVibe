import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyPage } from "@/components/auth/AuthPages";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your StreamVibe account.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] pt-[var(--header-h)]" />}>
      <VerifyPage />
    </Suspense>
  );
}
