"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import {
  getAllNotices,
  markAllNoticesRead,
  markNoticeRead,
  type MovieNotice,
} from "@/lib/notifications";

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}

function NotificationsInner() {
  const [items, setItems] = useState<MovieNotice[]>([]);

  useEffect(() => {
    setItems(getAllNotices());
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-bold text-white sm:text-[28px]">
                Notifications
              </h1>
              <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
                New episodes, watchlist alerts, trailers, and recommendations.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-[13px] font-semibold text-white hover:text-cta"
              onClick={() => {
                markAllNoticesRead(items.map((n) => n.id));
                setItems(getAllNotices());
              }}
            >
              Mark all read
            </button>
          </div>

          <ul className="mt-6 overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A]">
            {items.map((item, i) => (
              <li
                key={item.id}
                className={i === 0 ? "" : "border-t border-[#262626]"}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    markNoticeRead(item.id);
                    setItems(getAllNotices());
                  }}
                  className="flex gap-3 px-4 py-4 sm:px-5"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.unread ? "bg-cta" : "bg-[#333]"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[15px] font-semibold text-white">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[12px] text-[#999999]">
                        {item.at}
                      </span>
                    </span>
                    <span className="mt-1 block text-[14px] text-[#999999]">
                      {item.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}
