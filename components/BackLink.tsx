"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { getReturnTo, markScrollRestore } from "@/lib/nav-history";

type Props = {
  /**
   * Explicit parent (e.g. `/#faq`, `/movies/123`).
   * Used when preferHistory is false.
   */
  href?: string;
  /** Fallback when history / return path is unavailable */
  fallbackHref?: string;
  /**
   * Detail pages: return to the saved browse/home section + scroll.
   */
  preferHistory?: boolean;
  /** e.g. watch → detail (drop player from history) */
  replace?: boolean;
  "aria-label"?: string;
};

function scrollToHash(to: string) {
  if (typeof window === "undefined" || !to.includes("#")) return;
  const id = to.split("#")[1]?.split("?")[0];
  if (!id) return;
  const run = () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  window.setTimeout(run, 80);
  window.setTimeout(run, 280);
}

/**
 * App-wide back control.
 *
 * 1. preferHistory → saved return path (list / home section)
 * 2. href → fixed parent (home hash sections, detail from watch)
 * 3. else → fallbackHref
 */
export default function BackLink({
  href,
  fallbackHref = "/movies",
  preferHistory = false,
  replace = false,
  "aria-label": ariaLabel = "Go back",
}: Props) {
  const router = useRouter();

  const navigate = (to: string, scroll = true) => {
    // Already on home — only scroll to the section
    if (
      typeof window !== "undefined" &&
      to.startsWith("/#") &&
      window.location.pathname === "/"
    ) {
      const hash = to.slice(1); // "#faq"
      window.history.replaceState(null, "", hash);
      scrollToHash(to);
      return;
    }

    if (replace) {
      router.replace(to, { scroll });
    } else {
      router.push(to, { scroll });
    }
    scrollToHash(to);
  };

  const onBack = () => {
    if (preferHistory) {
      const target = getReturnTo(fallbackHref);
      markScrollRestore();
      navigate(target, false);
      return;
    }

    if (href) {
      navigate(href, true);
      return;
    }

    navigate(fallbackHref, true);
  };

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={ariaLabel}
      className="flex shrink-0 items-center justify-center text-cta transition hover:text-white"
    >
      <FiArrowLeft className="h-4 w-4" />
    </button>
  );
}
