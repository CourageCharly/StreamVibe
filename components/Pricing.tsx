"use client";

import { useState } from "react";
import { PLANS } from "@/lib/constants";
import SectionHeading from "./SectionHeading";
import Button from "@/components/ui/Button";

type Props = {
  /**
   * Choose Plan destination.
   * Home: `/subscriptions?from=pricing` → back to /#pricing.
   * Nav / subscriptions page: plain `/subscriptions` (no arrow).
   */
  choosePlanHref?: string;
  /**
   * Start Free Trial destination.
   * Home: `/movies?from=pricing` or `/movies?from=free-trial` → section back.
   * Nav: plain `/movies` (no arrow).
   */
  trialHref?: string;
  /** Controlled billing (subscription page shares state with compare table) */
  billing?: "monthly" | "yearly";
  onBillingChange?: (v: "monthly" | "yearly") => void;
  /** Extra section classes (e.g. tighter top under page back row) */
  className?: string;
};

/**
 * Plan cards — home + subscriptions.
 * Design matches Subscription Page - Laptop.png / homepage pricing.
 */
export default function Pricing({
  choosePlanHref = "/subscriptions",
  trialHref = "/movies",
  billing: billingProp,
  onBillingChange,
  className = "",
}: Props) {
  const [internalBilling, setInternalBilling] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const billing = billingProp ?? internalBilling;
  const setBilling = onBillingChange ?? setInternalBilling;

  return (
    <section
      id="pricing"
      className={["page-section", className].filter(Boolean).join(" ")}
    >
      <SectionHeading
        title={
          <>
            {/* Mobile: exactly 2 lines · Desktop: one line */}
            <span className="block sm:inline">
              Choose the plan that&apos;s right{" "}
            </span>
            <span className="block sm:inline">for you</span>
          </>
        }
        description={
          <>
            <span className="sm:hidden">
              Join StreamVibe and select from our flexible subscription
              <br />
              options tailored to suit your viewing preferences. Get
              <br />
              ready for non-stop entertainment!
            </span>
            <span className="hidden sm:inline">
              Join StreamVibe and select from our flexible subscription options
              tailored to suit your viewing preferences. Get ready for non-stop
              entertainment!
            </span>
          </>
        }
        action={
          <div
            className="inline-flex rounded-lg border border-[#262626] p-1"
            style={{ backgroundColor: "#0F0F0F" }}
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`min-w-[5.5rem] rounded-md px-4 py-2 text-sm font-medium transition ${
                billing === "monthly"
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`min-w-[5.5rem] rounded-md px-4 py-2 text-sm font-medium transition ${
                billing === "yearly"
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              Yearly
            </button>
          </div>
        }
      />

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price =
            billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const period = billing === "monthly" ? "month" : "year";

          return (
            <article
              key={plan.name}
              className="flex min-w-0 flex-col rounded-xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-6 md:p-8"
            >
              <h3 className="text-[16px] font-semibold text-white">
                {plan.name}
              </h3>
              {/* Mobile: tighter stack subtext → price → CTAs; sm+ keeps original rhythm */}
              <p className="mt-3 min-h-0 flex-1 text-[14px] font-normal leading-relaxed text-[#999999] sm:min-h-[4.5rem]">
                {plan.description}
              </p>
              <p className="mt-3 flex min-h-0 flex-wrap items-baseline gap-x-1 sm:mt-6 sm:min-h-[2.75rem]">
                <span className="text-[24px] font-bold tabular-nums text-white sm:text-[28px]">
                  ${price.toFixed(2)}
                </span>
                <span className="text-[14px] font-normal text-[#999999]">
                  /{period}
                </span>
              </p>
              {/* Mobile: equal-width CTAs balanced in the card; sm+ fixed 149px */}
              <div className="mt-3 grid w-full min-w-0 grid-cols-2 gap-3 sm:mt-6 sm:flex sm:flex-row sm:items-center">
                <Button
                  href={trialHref}
                  variant="secondary"
                  className="!w-full min-w-0 max-w-none shrink sm:!w-[149px] !border-[#262626] !bg-[#0F0F0F]"
                >
                  Start Free Trial
                </Button>
                <Button
                  href={choosePlanHref}
                  variant="primary"
                  className="!w-full min-w-0 max-w-none shrink sm:!w-[149px]"
                >
                  Choose Plan
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
