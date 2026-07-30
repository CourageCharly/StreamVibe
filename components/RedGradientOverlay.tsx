type RedGradientOverlayProps = {
  className?: string;
};

/**
 * Brand red divider line: soft dissolve on both left and right edges.
 * #E50000 peaks in the center, fades to transparent on each side.
 */
export default function RedGradientOverlay({
  className = "",
}: RedGradientOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(229, 0, 0, 0) 0%, #E50000 20%, #E50000 50%, rgba(229, 0, 0, 0) 100%)",
      }}
      aria-hidden
    />
  );
}
