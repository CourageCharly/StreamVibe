import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutView from "@/components/CheckoutView";
import { CheckoutSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your StreamVibe subscription payment.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutView />
    </Suspense>
  );
}
