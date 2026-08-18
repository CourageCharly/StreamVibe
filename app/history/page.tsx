"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import EmptyCatalog from "@/components/EmptyCatalog";
import { getWatchHistory, type HistoryItem } from "@/lib/user-lists";

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryInner />
    </RequireAuth>
  );
}

function HistoryInner() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getWatchHistory());
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          Watch History
        </h1>
        <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
          Movies and shows you have played.
        </p>
        {items.length === 0 ? (
          <EmptyCatalog message="Play a title and it will show up here." />
        ) : (
          <ul className="mt-10 space-y-3">
            {items.map((item) => (
              <li key={`${item.path}-${item.at}`}>
                <Link
                  href={item.path}
                  className="block rounded-xl border border-[#262626] bg-[#1A1A1A] px-4 py-3 transition hover:border-[#404040]"
                >
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-[12px] text-[#999999]">
                    {new Date(item.at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
