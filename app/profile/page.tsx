"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileSkeleton } from "@/components/skeletons/PageSkeletons";
import { getLikes, getMyList, getWatchHistory } from "@/lib/user-lists";
import UserAvatar from "@/components/auth/UserAvatar";

export default function ProfilePage() {
  return (
    <RequireAuth fallback={<ProfileSkeleton />}>
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
            <UserAvatar user={user} size={80} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-white sm:text-[20px]">
              {name}
            </p>
            <p className="truncate text-[14px] text-[#999999]">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Watchlist" value={listCount} href="/list?from=profile" />
          <Stat
            label="History"
            value={historyCount}
            href="/history?from=profile"
          />
          <Stat
            label="Ratings"
            value={ratingCount}
            href="/list?from=profile&view=ratings"
          />
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
