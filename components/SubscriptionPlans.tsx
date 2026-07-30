"use client";

import { useState } from "react";
import Pricing from "@/components/Pricing";
import PlanComparison from "@/components/PlanComparison";

/**
 * Subscription page body — plan cards + compare table share Monthly/Yearly state.
 * Design: Subscription Page - Laptop.png
 */
export default function SubscriptionPlans() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <Pricing
        billing={billing}
        onBillingChange={setBilling}
        choosePlanHref="/subscriptions"
        /* Tighter space under back arrow + “Subscriptions” */
        className="!pt-3 sm:!pt-4"
      />
      <PlanComparison billing={billing} />
    </>
  );
}
