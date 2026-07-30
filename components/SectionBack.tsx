"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackLink from "@/components/BackLink";
import {
  resolveBackFrom,
  type BackFrom,
  type BackTarget,
} from "@/lib/back-nav";

type Props = {
  /**
   * Sections this page accepts via `?from=`.
   * Example: movies browse → free-trial | pricing
   */
  allowed: Array<Exclude<BackFrom, "home">>;
  /**
   * Legacy `?from=home` maps to this section (page-specific).
   */
  legacyHomeAs?: Exclude<BackFrom, "home">;
  /**
   * Optional label override (e.g. genre list always shows “Home”).
   */
  label?: string;
  className?: string;
  /** Extra classes on the outer wrapper */
  wrapperClassName?: string;
};

function SectionBackInner({
  allowed,
  legacyHomeAs,
  label,
  className = "",
  wrapperClassName = "",
}: Props) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const target: BackTarget | null = resolveBackFrom(from, {
    allowed,
    legacyHomeAs,
  });

  if (!target) return null;

  const displayLabel = label ?? target.label;

  return (
    <div className={wrapperClassName || undefined}>
      <div className={`flex min-w-0 items-center gap-2 ${className}`.trim()}>
        <BackLink
          href={target.href}
          fallbackHref={target.href}
          aria-label={target.ariaLabel}
        />
        <p className="text-sm font-medium text-cta">{displayLabel}</p>
      </div>
    </div>
  );
}

/**
 * Conditional back row for pages reached from a home section CTA.
 * Hidden when opened from main nav (no `?from=`).
 */
export default function SectionBack(props: Props) {
  return (
    <Suspense fallback={null}>
      <SectionBackInner {...props} />
    </Suspense>
  );
}
