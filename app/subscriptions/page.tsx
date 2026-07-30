import type { Metadata } from "next";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import SectionBack from "@/components/SectionBack";
import { fetchPopularMovies } from "@/lib/api";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Choose the StreamVibe plan that's right for you — Basic, Standard, or Premium.",
};

/**
 * Subscription page.
 * Back arrow only when arriving from home Choose Plan (`?from=pricing`).
 */
export default async function SubscriptionsPage() {
  const popular = await fetchPopularMovies();

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <SectionBack
        allowed={["pricing"]}
        legacyHomeAs="pricing"
        wrapperClassName="page-container pt-6 sm:pt-8"
      />

      <SubscriptionPlans />

      <FreeTrialBanner posters={popular.slice(0, 12)} />
    </div>
  );
}
