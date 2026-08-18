type Props = {
  tag: string;
  children: React.ReactNode;
  className?: string;
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
}: Props) {
  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      {/* Red tag — web only (hidden on mobile; tabs already label Movies/Shows) */}
      <span className="relative z-10 mb-4 hidden rounded bg-cta px-3 py-1 text-sm font-semibold text-white lg:absolute lg:-top-3 lg:left-6 lg:mb-0 lg:inline-block">
        {tag}
      </span>
      {/* Stroke container — web only */}
      <div className="h-full w-full bg-transparent lg:rounded-xl lg:border lg:border-[#262626] lg:px-6 lg:pb-8 lg:pt-10">
        {children}
      </div>
    </div>
  );
}
