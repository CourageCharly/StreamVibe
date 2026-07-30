/**
 * Free-trial banner gradient only (Figma stops).
 *
 * Desktop (sm+): left → right (dark from side)
 * Mobile only: top → bottom (dark from top)
 *
 *  2%  #0F0F0F  100%
 * 16%  #140F0F   97%
 * 28%  #220E0E   91%
 * 100% #E50000    0%
 */

const STOPS = `
  rgba(15, 15, 15, 1) 2%,
  rgba(20, 15, 15, 0.97) 16%,
  rgba(34, 14, 14, 0.91) 28%,
  rgba(229, 0, 0, 0) 100%
`;

/** Desktop / tablet: dark from the side */
export const FREE_TRIAL_GRADIENT_CSS = `linear-gradient(90deg, ${STOPS})`;

/**
 * Mobile only (second option): top → bottom full-card fill.
 * Clipped by parent rounded-[12px] so top corners stay rounded.
 */
export const FREE_TRIAL_GRADIENT_MOBILE_CSS = `linear-gradient(
  180deg,
  rgba(15, 15, 15, 0.98) 0%,
  rgba(15, 15, 15, 0.96) 35%,
  rgba(20, 15, 15, 0.94) 65%,
  rgba(34, 14, 14, 0.92) 100%
)`;

type GradientPanelProps = {
  className?: string;
};

export default function GradientPanel({ className = "" }: GradientPanelProps) {
  const baseStyle = {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
  };

  return (
    <>
      {/* Mobile only — second overlay: dark from top, full cover */}
      <div
        className={`sm:hidden ${className}`.trim()}
        style={{ ...baseStyle, background: FREE_TRIAL_GRADIENT_MOBILE_CSS }}
        aria-hidden
      />
      {/* sm+ unchanged — dark from the side */}
      <div
        className={`hidden sm:block ${className}`.trim()}
        style={{ ...baseStyle, background: FREE_TRIAL_GRADIENT_CSS }}
        aria-hidden
      />
    </>
  );
}

/** Alias used by FreeTrialBanner */
export function GradientFill(props: GradientPanelProps) {
  return <GradientPanel {...props} />;
}
