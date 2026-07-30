/**
 * Shared horizontal-row scroll metrics for media / genre sliders.
 * Segment count = reachable scroll stops only (no excess marks past max scroll).
 * Arrows wrap: last → first, first → last.
 */

export function measureStep(el: HTMLElement, fallback = 301): number {
  const child = el.children[0] as HTMLElement | undefined;
  if (!child) return fallback;
  const styles = getComputedStyle(el);
  const gap =
    parseFloat(styles.columnGap || styles.gap || "0") ||
    parseFloat(styles.rowGap || "0") ||
    16;
  const w = child.getBoundingClientRect().width;
  return (w > 0 ? w : fallback - 16) + gap;
}

/** Max horizontal scroll distance */
export function maxScroll(el: HTMLElement): number {
  return Math.max(0, el.scrollWidth - el.clientWidth);
}

/**
 * How many scroll stops are actually reachable.
 * e.g. 12 cards, ~4 visible → fewer stops than 12 (no excess segments).
 */
export function reachableSteps(el: HTMLElement, step: number): number {
  const max = maxScroll(el);
  if (max <= 2 || step <= 0) return 1;
  // Number of distinct positions: 0, step, 2*step, … up to max
  return Math.max(1, Math.round(max / step) + 1);
}

/** Continuous 0–1 progress for mobile progress bar */
export function scrollProgress(el: HTMLElement): number {
  const max = maxScroll(el);
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, el.scrollLeft / max));
}

/**
 * Active stop index from scrollLeft — only within reachable range.
 */
export function indexFromScroll(
  el: HTMLElement,
  steps: number,
  step: number,
): number {
  if (steps <= 1) return 0;
  const max = maxScroll(el);
  if (max <= 0) return 0;
  if (el.scrollLeft >= max - 2) return steps - 1;
  const idx = Math.round(el.scrollLeft / step);
  return Math.min(steps - 1, Math.max(0, idx));
}

/**
 * Move one stop; wraps last→first and first→last.
 * Returns the new index.
 */
export function scrollToStep(
  el: HTMLElement,
  nextIndex: number,
  steps: number,
  step: number,
): number {
  const max = maxScroll(el);
  const safeSteps = Math.max(1, steps);
  const next = ((nextIndex % safeSteps) + safeSteps) % safeSteps;
  const target =
    next >= safeSteps - 1 ? max : Math.min(max, next * step);
  el.scrollTo({ left: target, behavior: "smooth" });
  return next;
}
