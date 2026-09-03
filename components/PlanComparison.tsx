"use client";

import { useState } from "react";
import { PLAN_COMPARE_ROWS, PLANS } from "@/lib/constants";
import SectionHeading from "@/components/SectionHeading";

type Props = {
  billing?: "monthly" | "yearly";
};

type Plan = (typeof PLANS)[number];

function planValue(
  plan: Plan,
  key: (typeof PLAN_COMPARE_ROWS)[number]["key"],
  billing: "monthly" | "yearly",
  period: string,
): string {
  if (key === "price") {
    const price =
      billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    return `₦${price.toFixed(2)}/${period}`;
  }
  return plan.features[key];
}

/** Feature pair for mobile 2-col layout (Table Mobile.png) */
function FeatureCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[13px] font-light leading-[150%] text-[#999999]">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-light leading-[150%] text-white">
        {value}
      </p>
    </div>
  );
}

/**
 * Compare plans — desktop table + mobile tabs card (Table Mobile.png).
 * Mobile only: tabbed plan detail. sm+: existing grid table.
 */
export default function PlanComparison({ billing = "monthly" }: Props) {
  const period = billing === "monthly" ? "Month" : "Year";
  const defaultIdx = Math.max(
    0,
    PLANS.findIndex((p) => p.popular),
  );
  const [activeIdx, setActiveIdx] = useState(defaultIdx === -1 ? 0 : defaultIdx);
  const plan = PLANS[activeIdx] ?? PLANS[0];

  return (
    <section id="features" className="page-section pt-0 sm:pt-2">
      <SectionHeading
        title="Compare our plans and find the right one for you"
        description="StreamVibe offers three different plans to fit your needs: Basic, Standard, and Premium. Compare the features of each plan and choose the one that's right for you."
      />

      {/* ——— Mobile only (Table Mobile.png) ——— */}
      <div className="sm:hidden">
        {/* Plan tabs */}
        <div className="mb-4 flex w-full rounded-xl border border-[#262626] bg-[#0F0F0F] p-1">
          {PLANS.map((p, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={[
                  "min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-[14px] font-semibold transition",
                  active
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#999999] hover:text-white",
                ].join(" ")}
              >
                {p.shortName}
              </button>
            );
          })}
        </div>

        {/* Plan detail card — fill #0F0F0F, stroke #262626 */}
        <div className="rounded-xl border border-[#262626] bg-[#0F0F0F] p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <FeatureCell
              label="Price"
              value={planValue(plan, "price", billing, period)}
            />
            <FeatureCell
              label="Free Trail"
              value={plan.features.freeTrial}
            />

            <FeatureCell
              label="Content"
              value={plan.features.content}
              className="col-span-2"
            />

            <FeatureCell
              label="Devices"
              value={plan.features.devices}
              className="col-span-2"
            />

            <FeatureCell
              label="Cancel Anytime"
              value={plan.features.cancelAnytime}
            />
            <FeatureCell label="HDR" value={plan.features.hdr} />

            <FeatureCell
              label="Dolby Atmos"
              value={plan.features.dolbyAtmos}
            />
            <FeatureCell label="Ad - Free" value={plan.features.adFree} />

            <FeatureCell
              label="Offline Viewing"
              value={plan.features.offline}
            />
            <FeatureCell
              label="Family Sharing"
              value={
                plan.features.familySharing === "No"
                  ? "No"
                  : plan.features.familySharing
                      .replace(/^Yes,\s*up to\s*/i, "")
                      .replace(/^Yes,\s*/i, "")
              }
            />
          </div>
        </div>
      </div>

      {/* ——— Desktop / tablet table (unchanged) ——— */}
      <div className="hidden w-full min-w-0 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414] sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              <th className="border border-[#262626] bg-[#0F0F0F] px-4 py-4 text-[14px] font-semibold text-white sm:px-6 sm:py-5 sm:text-[16px]">
                Features
              </th>
              {PLANS.map((p) => (
                <th
                  key={p.name}
                  className="border border-[#262626] bg-[#0F0F0F] px-4 py-4 text-[14px] font-semibold text-white sm:px-6 sm:py-5 sm:text-[16px]"
                >
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {p.shortName}
                    {p.popular ? (
                      <span className="rounded bg-cta px-2 py-0.5 text-[11px] font-semibold text-white">
                        Popular
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARE_ROWS.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="whitespace-nowrap border border-[#262626] bg-[#141414] px-4 py-4 text-[13px] font-light leading-[150%] text-[#999999] sm:px-6 sm:py-5 sm:text-[14px]"
                >
                  {row.label}
                </th>
                {PLANS.map((p) => (
                  <td
                    key={`${p.name}-${row.key}`}
                    className="border border-[#262626] bg-[#141414] px-4 py-4 text-[13px] font-light leading-[150%] text-[#999999] sm:px-6 sm:py-5 sm:text-[14px]"
                  >
                    {planValue(p, row.key, billing, period)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
