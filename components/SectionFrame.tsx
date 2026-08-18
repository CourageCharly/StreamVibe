type Props = {
  tag: string;
  children: React.ReactNode;
  className?: string;
  /** Pulse the Movies / Shows tag instead of showing the label */
  skeleton?: boolean;
};

/**
 * Movies / Shows frame.
 * Web: stroke container #262626 with red tag on the border.
 * Mobile: no stroke — tag + content only.
 */
export default function SectionFrame({
  tag,
  children,
  className = "",
  skeleton = false,
}: Props) {
  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      {skeleton ? (
        <span
          className="relative z-10 mb-4 hidden h-7 w-[4.75rem] animate-pulse rounded bg-[#1A1A1A] lg:absolute lg:-top-3 lg:left-6 lg:mb-0 lg:inline-block"
          aria-hidden
        />
      ) : (
        <span className="relative z-10 mb-4 hidden rounded bg-cta px-3 py-1 text-sm font-semibold text-white lg:absolute lg:-top-3 lg:left-6 lg:mb-0 lg:inline-block">
          {tag}
        </span>
      )}
      {/* Stroke container — web only */}
      <div className="h-full w-full bg-transparent lg:rounded-xl lg:border lg:border-[#262626] lg:p-6">
        {children}
      </div>
    </div>
  );
}
