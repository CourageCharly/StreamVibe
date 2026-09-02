import { useEffect } from "react";

/** Prevent background scroll while a modal/overlay is open. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - html.clientWidth;
    html.classList.add("scroll-locked");
    body.classList.add("scroll-locked");
    html.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("overflow", "hidden", "important");
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      html.classList.remove("scroll-locked");
      body.classList.remove("scroll-locked");
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.paddingRight = prevPad;
    };
  }, [locked]);
}
