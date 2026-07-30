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
 * Poster: full-tile cover fade — same on iOS Safari & Android Chrome.
 */
export default function GradientOverlay({
  direction,
  variant = "poster",
  className = "",
}: GradientOverlayProps) {
  if (variant === "accent") {
    return (
      <div
        className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden ${className}`}
        aria-hidden
      >
        <div
          className="absolute inset-0 h-full w-full"
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

  // Category / poster: full bleed over the image (any aspect / screen density)
  const dir = direction ?? "to bottom";
  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 z-[1]",
        "h-full w-full min-h-full min-w-full",
        /* Web: close 1px bottom hairline under image frames (subpixel grid) */
        "sm:-bottom-px sm:top-0 sm:left-0 sm:right-0 sm:h-auto sm:min-h-[calc(100%+1px)]",
        "[transform:translateZ(0)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundImage: `linear-gradient(${dir}, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 0.28) 38%, rgba(26, 26, 26, 0.78) 70%, rgba(26, 26, 26, 1) 92%, rgba(26, 26, 26, 1) 100%)`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    />
  );
}
