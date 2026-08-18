"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
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
    <div className="w-full bg-[#141414] pt-[var(--header-h)]">
      <PageWrapper className="py-8 sm:py-12">
        <h1 className="text-[28px] font-semibold text-white">Watch History</h1>
        {items.length === 0 ? (
          <p className="mt-4 max-w-md text-[16px] text-[#999999]">
            Movies you play will show up here.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
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
      </PageWrapper>
    </div>
  );
}
