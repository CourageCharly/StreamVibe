import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthChoicePage } from "@/components/auth/AuthPages";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  description: "Create an account or log in to start watching on StreamVibe.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] pt-[var(--header-h)]" />}>
      <AuthChoicePage />
    </Suspense>
  );
}
