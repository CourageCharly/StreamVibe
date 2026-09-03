"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import BackLink from "@/components/BackLink";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { CheckoutSkeleton } from "@/components/skeletons/PageSkeletons";
import {
  checkoutBackHref,
  getPlan,
  planPrice,
  saveSubscription,
  subscriptionExpiresInMs,
  type BillingCycle,
  type PlanKey,
} from "@/lib/subscription";
import {
  loadPaystack,
  paystackAmount,
  paystackCurrency,
  paystackPublicKey,
} from "@/lib/paystack";
import { readReturnTo, clearReturnTo } from "@/lib/auth/return-to";

function isPlanKey(value: string | null): value is PlanKey {
  return value === "basic" || value === "standard" || value === "premium";
}

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);

  const planKey = params.get("plan");
  const billingParam = params.get("billing");
  const from = params.get("from");
  const backHref = checkoutBackHref(from);
  const billing: BillingCycle =
    billingParam === "yearly" ? "yearly" : "monthly";

  const plan = useMemo(() => getPlan(planKey), [planKey]);
  const price = plan && isPlanKey(plan.key) ? planPrice(plan.key, billing) : 0;
  const period = billing === "yearly" ? "year" : "month";

  if (!plan || !isPlanKey(plan.key)) {
    router.replace("/subscriptions");
    return <CheckoutSkeleton />;
  }

  async function pay() {
    if (!user?.email || !plan || !isPlanKey(plan.key)) return;
    const key = paystackPublicKey();
    if (!key) {
      toast.error("Paystack is not configured.");
      return;
    }
    setPaying(true);
    try {
      const pop = await loadPaystack();
      const ref = `sv-${plan.key}-${billing}-${Date.now()}`;
      const currency = paystackCurrency();
      const handler = pop.setup({
        key,
        email: user.email,
        amount: paystackAmount(price, currency),
        currency,
        ref,
        metadata: {
          plan: plan.key,
          billing,
        },
        callback: (response) => {
          saveSubscription({
            planKey: plan.key as PlanKey,
            billing,
            reference: response.reference || ref,
            paidAt: Date.now(),
            expiresAt: subscriptionExpiresInMs(billing),
          });
          toast.success("Payment successful. Your plan is active.");
          const next = readReturnTo("/");
          clearReturnTo();
          router.replace(next);
        },
        onClose: () => {
          setPaying(false);
        },
      });
      handler.openIframe();
    } catch {
      toast.error("Unable to start checkout. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <BackLink
            href={backHref}
            fallbackHref={backHref}
            aria-label={
              from === "pricing"
                ? "Back to home plans"
                : "Back to subscriptions"
            }
          />
          <p className="text-sm font-medium text-cta">Checkout</p>
        </div>
        <h1 className="mt-2 text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          Complete your payment
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-[#999999] sm:text-[16px]">
          Review your plan and pay with Paystack to keep watching.
        </p>

        <div className="mt-8 max-w-lg rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 sm:p-6">
          <p className="text-[13px] font-medium text-[#999999]">Selected plan</p>
          <h2 className="mt-1 text-[18px] font-semibold text-white sm:text-[20px]">
            {plan.name}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#999999]">
            {plan.description}
          </p>
          <p className="mt-5 text-[24px] font-bold text-white sm:text-[28px]">
            ${price.toFixed(2)}
            <span className="ml-1 text-[14px] font-normal text-[#999999]">
              /{period}
            </span>
          </p>
          <p className="mt-2 text-[13px] text-[#999999]">
            Billed {billing}. Charged to {user?.email ?? "your account"}.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="!w-full"
              disabled={paying}
              onClick={() => void pay()}
            >
              {paying ? "Opening Paystack…" : "Choose Payment"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="!w-full"
              href={backHref}
            >
              Change plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutView() {
  return (
    <RequireAuth fallback={<CheckoutSkeleton />}>
      <CheckoutInner />
    </RequireAuth>
  );
}
