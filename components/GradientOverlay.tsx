type GradientOverlayProps = {
  direction?: string;
  /**
   * poster — fade to #1A1A1A (category/poster tiles)
   * accent — subtle brand-red corner glow (device cards / Card1.png)
   */
  variant?: "poster" | "accent";
  className?: string;
};

/**
 * Design gradient overlays.
 * accent: very soft top-right red glow like Card1.png (low visibility).
 */
export default function GradientOverlay({
  direction,
  variant = "poster",
  className = "",
}: GradientOverlayProps) {
  if (variant === "accent") {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        aria-hidden
      >
        {/* Very soft top-right red glow — Card1.png */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 60% at 100% 0%,
                rgba(229, 0, 0, 0.08) 0%,
                rgba(229, 0, 0, 0.03) 35%,
                rgba(229, 0, 0, 0) 60%
              )
            `,
          }}
        />
      </div>
    );
  }

  // Category / poster image fade → #1A1A1A (transparent top → solid bottom)
  const dir = direction ?? "to bottom";
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
      style={{
        background: `linear-gradient(${dir}, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 0.55) 45%, rgba(26, 26, 26, 1) 100%)`,
      }}
      aria-hidden
    />
  );
}
