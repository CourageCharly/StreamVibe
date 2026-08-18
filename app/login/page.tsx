import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/AuthPages";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to StreamVibe to start watching.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] pt-[var(--header-h)]" />}>
      <LoginPage />
    </Suspense>
  );
}
