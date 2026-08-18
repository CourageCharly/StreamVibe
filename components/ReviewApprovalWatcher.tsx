"use client";

import { useEffect } from "react";
import { approveDueReviews } from "@/lib/reviews";

/** Approves due pending reviews and posts a bell notification. */
export default function ReviewApprovalWatcher() {
  useEffect(() => {
    approveDueReviews();
    const id = window.setInterval(approveDueReviews, 2000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
