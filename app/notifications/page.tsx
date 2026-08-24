"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import RequireAuth from "@/components/auth/RequireAuth";
import { NotificationsSkeleton } from "@/components/skeletons/PageSkeletons";
import {
  deleteNotice,
  getAllNotices,
  markAllNoticesRead,
  markNoticeRead,
  NOTICE_EVENT,
  type MovieNotice,
} from "@/lib/notifications";

function formatRelativeTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = new Date(ts);
  return d.toLocaleDateString();
}

export default function NotificationsPage() {
  return (
    <RequireAuth fallback={<NotificationsSkeleton />}>
      <NotificationsInner />
    </RequireAuth>
  );
}

function NotificationsInner() {
  const [items, setItems] = useState<MovieNotice[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const refreshList = () => setItems(getAllNotices());
    refreshList();
    window.addEventListener(NOTICE_EVENT, refreshList);
    return () => window.removeEventListener(NOTICE_EVENT, refreshList);
  }, []);

  function refresh() {
    setItems(getAllNotices());
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <h1 className="text-[20px] font-bold text-white sm:text-[28px]">
          Notifications
        </h1>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="min-w-0 text-[14px] text-[#999999] sm:text-[16px]">
            Alerts from your list, likes, and reviews.
          </p>
          <button
            type="button"
            className="shrink-0 text-[13px] font-semibold text-white hover:text-cta"
            onClick={() => {
              markAllNoticesRead(items.map((n) => n.id));
              refresh();
            }}
          >
            Mark all read
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-[14px] text-[#999999] sm:text-[16px]">
            No notifications yet. Saving a title, liking one, or posting a
            review will show up here.
          </p>
        ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A]">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={i === 0 ? "" : "border-t border-[#262626]"}
            >
              <div className="flex gap-3 px-4 py-4 sm:px-5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    item.unread ? "bg-cta" : "bg-[#333]"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={item.href}
                      onClick={() => {
                        markNoticeRead(item.id);
                        refresh();
                      }}
                      className="min-w-0 text-[15px] font-semibold text-white hover:text-cta"
                    >
                      {item.title}
                    </Link>
                    <NoticeMenu
                      unread={item.unread}
                      open={openId === item.id}
                      onToggle={() =>
                        setOpenId((id) => (id === item.id ? null : item.id))
                      }
                      onClose={() => setOpenId(null)}
                      onMarkRead={() => {
                        markNoticeRead(item.id);
                        setOpenId(null);
                        refresh();
                      }}
                      onDelete={() => {
                        deleteNotice(item.id);
                        setOpenId(null);
                        refresh();
                      }}
                    />
                  </div>
                  <Link
                    href={item.href}
                    onClick={() => {
                      markNoticeRead(item.id);
                      refresh();
                    }}
                    className="mt-1 block text-[14px] text-[#999999]"
                  >
                    {item.body}
                  </Link>
                  <p className="mt-1.5 text-[12px] text-[#999999]">{formatRelativeTime(item.at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}

function NoticeMenu({
  unread,
  open,
  onToggle,
  onClose,
  onMarkRead,
  onDelete,
}: {
  unread: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Notification actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white outline-none hover:bg-[#141414]"
      >
        <HiOutlineDotsHorizontal className="h-5 w-5" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[160px] overflow-hidden rounded-lg border border-[#262626] bg-[#141414] py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!unread}
            onClick={onMarkRead}
            className="block w-full px-3 py-2 text-left text-[14px] font-semibold text-white outline-none hover:bg-[#1A1A1A] disabled:opacity-40"
          >
            Mark as read
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="block w-full px-3 py-2 text-left text-[14px] font-semibold text-cta outline-none hover:bg-[#1A1A1A]"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
