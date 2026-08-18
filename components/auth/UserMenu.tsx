"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/auth/types";
import { useAuth } from "@/components/auth/AuthProvider";

const ITEMS = [
  { href: "/profile", label: "Profile" },
  { href: "/list", label: "My List / Favorites" },
  { href: "/history", label: "Watch History" },
  { href: "/settings", label: "Settings" },
] as const;

export default function UserMenu({ user }: { user: AuthUser }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    user.email.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onLogout() {
    await logout();
    setOpen(false);
    toast.success("You have been logged out.");
    router.replace("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#262626] bg-[#1A1A1A] outline-none transition hover:border-[#404040] focus-visible:ring-2 focus-visible:ring-cta/60"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[13px] font-semibold text-white">{initials}</span>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-xl border border-[#262626] bg-[#1A1A1A] py-1 shadow-xl"
        >
          <div className="border-b border-[#262626] px-3 py-2">
            <p className="truncate text-[13px] font-medium text-white">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                "Account"}
            </p>
            <p className="truncate text-[12px] text-[#999999]">{user.email}</p>
          </div>
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[13px] text-[#E5E5E5] outline-none transition hover:bg-[#141414] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="block w-full px-3 py-2 text-left text-[13px] text-[#E5E5E5] outline-none transition hover:bg-[#141414] hover:text-white"
          >
            Log Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
