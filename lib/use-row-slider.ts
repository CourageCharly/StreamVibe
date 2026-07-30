"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  indexFromScroll,
  measureStep,
  reachableSteps,
  scrollToStep,
} from "@/lib/scroll-row";

/**
 * Row slider: reachable stops only (no excess).
 * Manual arrows only — wraps last→first.
 * Segment count stays stable through SSR/hydration, then measures on client.
 */
export function useRowSlider(itemCount: number, stepFallback = 301) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  /** Start from itemCount so server HTML matches first client paint */
  const [steps, setSteps] = useState(() => Math.max(1, itemCount || 1));
  const [ready, setReady] = useState(false);
  const scrollingRef = useRef(false);

  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) {
      setSteps(Math.max(1, itemCount || 1));
      setIndex(0);
      return;
    }
    const step = measureStep(el, stepFallback);
    const nextSteps = reachableSteps(el, step);
    setSteps(nextSteps);
    if (scrollingRef.current) return;
    setIndex(indexFromScroll(el, nextSteps, step));
  }, [itemCount, stepFallback]);

  useEffect(() => {
    // Mark mounted after paint so hydration has already matched
    setReady(true);
    setIndex(0);
    const el = rowRef.current;
    if (el) el.scrollTo({ left: 0 });
    const id = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id);
  }, [itemCount, measure]);

  useEffect(() => {
    if (!ready) return;
    measure();
    const el = rowRef.current;
    if (!el) return;
    const onScroll = () => {
      if (scrollingRef.current) return;
      const step = measureStep(el, stepFallback);
      const s = reachableSteps(el, step);
      setSteps(s);
      setIndex(indexFromScroll(el, s, step));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure, stepFallback, ready]);

  /** Manual ±1 stop; wraps last→first and first→last */
  const go = useCallback(
    (dir: -1 | 1) => {
      const el = rowRef.current;
      if (!el) return;
      const step = measureStep(el, stepFallback);
      const s = Math.max(1, reachableSteps(el, step));
      if (s <= 1) return;
      setSteps(s);
      setIndex((i) => {
        const next = scrollToStep(el, i + dir, s, step);
        scrollingRef.current = true;
        window.setTimeout(() => {
          scrollingRef.current = false;
          setIndex(indexFromScroll(el, s, step));
        }, 420);
        return next;
      });
    },
    [stepFallback],
  );

  // SSR + first client paint use itemCount so HTML matches; then measure
  const segments = Math.max(
    1,
    ready ? steps : Math.max(1, itemCount || 1),
  );
  const activeIndex = Math.min(segments - 1, Math.max(0, index));
  const progress = segments > 1 ? activeIndex / (segments - 1) : 0;

  return {
    rowRef,
    index: activeIndex,
    count: segments,
    progress,
    go,
    segments,
    activeIndex,
  };
}
