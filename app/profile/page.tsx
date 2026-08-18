"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLikes, getMyList, getWatchHistory } from "@/lib/user-lists";

const LINKS = [
  {
    href: "/list",
    label: "Your watchlist",
    hint: "Titles you saved to watch later",
  },
  {
    href: "/history",
    label: "Watch history",
    hint: "Movies and shows you have played",
  },
  {
    href: "/settings",
    label: "Account settings",
    hint: "Playback, privacy, and preferences",
  },
] as const;

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const { user } = useAuth();
  const [listCount, setListCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    setListCount(getMyList().length);
    setHistoryCount(getWatchHistory().length);
    setRatingCount(getLikes().length);
  }, []);

  if (!user) return null;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Member";

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          Profile
        </h1>
        <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
          Your StreamVibe activity — lists, history, and ratings.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#262626] bg-[#1A1A1A] text-xl font-semibold sm:h-20 sm:w-20">
            {(user.firstName?.[0] ?? user.email[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-white sm:text-[20px]">
              {name}
            </p>
            <p className="truncate text-[14px] text-[#999999]">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Watchlist" value={listCount} href="/list" />
          <Stat label="History" value={historyCount} href="/history" />
          <Stat label="Ratings" value={ratingCount} href="/list" />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#262626] bg-[#1A1A1A]">
          {LINKS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-4 py-4 sm:px-5 ${
                i === 0 ? "" : "border-t border-[#262626]"
              }`}
            >
              <span>
                <span className="block text-[16px] font-semibold text-white">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[13px] text-[#999999]">
                  {item.hint}
                </span>
              </span>
              <FiChevronRight className="h-5 w-5 shrink-0 text-[#999999]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#262626] bg-[#1A1A1A] px-3 py-4 text-center"
    >
      <p className="text-[20px] font-bold text-white sm:text-[24px]">{value}</p>
      <p className="mt-1 text-[12px] text-[#999999] sm:text-[13px]">{label}</p>
    </Link>
  );
}
