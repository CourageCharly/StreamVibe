import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  /**
   * 0–1 continuous scroll progress.
   * Mobile progress bar uses this exactly (width = progress × 100%).
   */
  progress?: number;
  /**
   * Web: number of line segments = exact movie / card / slide count.
   * 4 items → 4 lines; 12 items → 12 lines.
   */
  segments?: number;
  /**
   * Web: which segment is active (0-based), tied to current item.
   * If omitted, derived from progress × (segments − 1).
   */
  activeIndex?: number;
  className?: string;
  variant?: "hero" | "row";
  placement?: "header" | "footer";
};

/**
 * Web: N segment lines matching item count; active line = current item.
 * Mobile: continuous bar filled exactly by scroll progress.
 */
export default function SliderControls({
  onPrev,
  onNext,
  progress = 0,
  segments = 1,
  activeIndex: activeIndexProp,
  className = "",
  variant = "row",
  placement = "header",
}: Props) {
  // Exact segment count from items (movies / genre cards) — same as MoviesHero
  const count = Math.max(1, Math.floor(Number(segments)) || 1);

  // Discrete active index (preferred) — never derive jumps from scroll ratio when provided
  const activeIndex = (() => {
    if (count <= 1) return 0;
    if (typeof activeIndexProp === "number" && Number.isFinite(activeIndexProp)) {
      return Math.min(count - 1, Math.max(0, Math.round(activeIndexProp)));
    }
    const clamped = Math.min(1, Math.max(0, progress));
    return Math.min(count - 1, Math.max(0, Math.round(clamped * (count - 1))));
  })();

  // Progress bar follows discrete index like hero when we have segments
  const pct =
    count > 1
      ? (activeIndex / (count - 1)) * 100
      : Math.min(100, Math.max(0, progress * 100));

  const progressBar = (
    <div
      className="relative mx-auto h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-[#333333]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="Scroll progress"
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-cta transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );

  /** One line per card/image — count is fixed to row length; active moves 1 step at a time */
  const segmentLines = (
    <div
      className="flex max-w-[min(360px,50vw)] items-center justify-center gap-0.5 overflow-x-auto px-1 sm:gap-1"
      style={{ scrollbarWidth: "none" }}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={activeIndex + 1}
      aria-label={`Item ${activeIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const on = i === activeIndex;
        return (
          <span
            key={i}
            className="h-[3px] shrink-0 rounded-full transition-[width,background-color] duration-200 ease-out"
            style={{
              width: on ? 16 : 6,
              backgroundColor: on ? "#E50000" : "#333333",
            }}
          />
        );
      })}
    </div>
  );

  const arrowBtn = (dir: "prev" | "next", fill: "hero" | "row") => (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous" : "Next"}
      onClick={dir === "prev" ? onPrev : onNext}
      className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[#1F1F1F] text-white transition ${
        fill === "hero"
          ? "bg-[#0F0F0F] hover:bg-[#1A1A1A]"
          : "bg-[#1A1A1A] hover:bg-[#222222]"
      }`}
    >
      {dir === "prev" ? (
        <FiArrowLeft className="h-5 w-5" />
      ) : (
        <FiArrowRight className="h-5 w-5" />
      )}
    </button>
  );

  if (variant === "hero") {
    return (
      <div
        className={`flex w-full items-center justify-between gap-4 ${className}`}
        role="group"
        aria-label="Carousel controls"
      >
        {arrowBtn("prev", "hero")}
        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {segmentLines}
        </div>
        {arrowBtn("next", "hero")}
      </div>
    );
  }

  if (placement === "footer") {
    return (
      <div
        className={`flex w-full justify-center sm:hidden ${className}`}
        role="group"
        aria-label="Scroll progress"
      >
        {progressBar}
      </div>
    );
  }

  return (
    <div
      className={`hidden items-center gap-2 rounded-[10px] border border-[#1F1F1F] bg-[#0F0F0F] p-1.5 sm:inline-flex ${className}`}
      role="group"
      aria-label="Carousel controls"
    >
      {arrowBtn("prev", "row")}
      {segmentLines}
      {arrowBtn("next", "row")}
    </div>
  );
}
