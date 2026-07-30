"use client";

import { useEffect } from "react";
import { rememberListPath, rememberReturnTo } from "@/lib/nav-history";

/**
 * Safety net on list pages so detail back has a return target
 * even if NavigationTracker missed a transition.
 */
export default function RememberListPath() {
  useEffect(() => {
    rememberListPath();
    rememberReturnTo();
  }, []);

  return null;
}
