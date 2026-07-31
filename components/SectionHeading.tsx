import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  /** String or mobile line-break markup */
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
  /** Keep title on one line (desktop); wraps only on very small screens */
  singleLine?: boolean;
};

/**
 * Shared section headers — 28px bold (matches categories).
 * Subtext: 14px regular #999999 — full width on mobile for design line breaks.
 */
export default function SectionHeading({
  title,
  description,
  action,
  className = "",
  id,
  singleLine = false,
}: Props) {
  return (
    <div
      id={id}
      className={`mb-8 flex min-w-0 flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-6 ${className}`}
    >
      <div
        className={`min-w-0 flex-1 ${singleLine ? "max-w-none" : "max-w-none sm:max-w-3xl"}`}
      >
        <h2
          className={[
            "min-w-0 text-[clamp(1.25rem,3.5vw,28px)] font-bold leading-tight text-white",
            singleLine
              ? "whitespace-nowrap max-sm:whitespace-normal"
              : "whitespace-normal",
          ].join(" ")}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 w-full max-w-none text-[14px] font-normal leading-relaxed text-subtext sm:max-w-3xl sm:text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 justify-start lg:w-auto lg:justify-end">
          {action}
        </div>
      ) : null}
    </div>
  );
}
