import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupPage } from "@/components/auth/AuthPages";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a StreamVibe account to start watching.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] pt-[var(--header-h)]" />}>
      <SignupPage />
    </Suspense>
  );
}
