"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/auth/types";
import { useAuth } from "@/components/auth/AuthProvider";
import UserAvatar from "@/components/auth/UserAvatar";

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = buttonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        // Flush with the avatar's right edge (clientWidth ignores the scrollbar).
        right: document.documentElement.clientWidth - rect.right,
      });
    };
    place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onLogout() {
    setOpen(false);
    router.replace("/");
    await logout();
    toast.success("You have been logged out.");
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#262626] bg-[#1A1A1A] outline-none transition hover:border-[#404040] focus-visible:ring-2 focus-visible:ring-cta/60"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar user={user} size={40} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[400]">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/50"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Account"
            className="absolute z-10 w-[min(calc(100vw-1.5rem),220px)] overflow-hidden rounded-lg border border-[#262626] bg-[#141414] py-0.5 shadow-lg"
            style={{ top: pos.top, right: pos.right }}
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
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-[14px] font-semibold text-white outline-none transition hover:bg-[#1A1A1A]"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void onLogout()}
              className="block w-full px-3 py-2.5 text-left text-[14px] font-semibold text-cta outline-none transition hover:bg-[#1A1A1A]"
            >
              Log Out
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
