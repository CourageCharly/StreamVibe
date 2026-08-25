import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_NAV = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[18px] font-semibold text-white sm:text-[20px]">
        {title}
      </h2>
      <div className="space-y-3 text-[14px] font-normal leading-[1.7] text-[#999999] sm:text-[16px]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] font-medium text-[#999999]"
        >
          {LEGAL_NAV.map((item, i) => (
            <span key={item.href} className="inline-flex items-center gap-x-3">
              {i > 0 ? (
                <span className="text-border" aria-hidden>
                  |
                </span>
              ) : null}
              <Link
                href={item.href}
                className={
                  item.label === title
                    ? "text-white"
                    : "transition-colors hover:text-white"
                }
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <h1 className="mt-6 text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
          {description}
        </p>
        <p className="mt-1 text-[13px] text-[#999999]">
          Last updated: {updated}
        </p>

        <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
}
