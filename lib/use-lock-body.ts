import { useEffect } from "react";

/** Prevent background scroll while a modal/overlay is open. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prevBody = document.body.style.overflow;
    const prevHtml = html.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const gap = window.innerWidth - html.clientWidth;
    document.body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
      document.body.style.paddingRight = prevPad;
    };
  }, [locked]);
}
