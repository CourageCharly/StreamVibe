import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
  /** Desktop title stays one line when title is plain text */
  singleLine?: boolean;
};

/**
 * Shared section headers.
 * Mobile: full-width title/subtext so intentional line breaks hold.
 * Desktop: max-w-3xl, flowing text.
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
      <div className="min-w-0 w-full flex-1 max-w-none sm:max-w-3xl">
        <h2
          className={[
            "min-w-0 w-full text-[clamp(1.25rem,3.5vw,28px)] font-bold leading-tight text-white",
            singleLine ? "sm:whitespace-nowrap" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 w-full max-w-none text-[14px] font-normal leading-relaxed text-subtext sm:max-w-3xl">
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
