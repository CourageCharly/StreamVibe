import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
  id?: string;
  /** Keep title on one line (desktop); wraps only on very small screens */
  singleLine?: boolean;
  titleClassName?: string;
};

/**
 * Shared section headers — 20px bold mobile, 28px bold web.
 * Subtext: 14px mobile, 16px web, regular #999999.
 */
export default function SectionHeading({
  title,
  description,
  action,
  className = "",
  id,
  singleLine = false,
  titleClassName = "",
}: Props) {
  return (
    <div
      id={id}
      className={`mb-8 flex min-w-0 flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-6 ${className}`}
    >
      <div
        className={`min-w-0 flex-1 ${singleLine ? "max-w-none" : "max-w-3xl"}`}
      >
        <h2
          className={[
            "min-w-0 text-[20px] font-bold leading-tight text-white sm:text-[28px]",
            /* No text-balance — it overrides intentional mobile line breaks */
            singleLine
              ? "whitespace-nowrap max-sm:whitespace-normal"
              : "whitespace-normal",
            titleClassName,
          ].join(" ")}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-pretty text-[14px] font-normal leading-relaxed text-subtext sm:text-[16px]">
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
