"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import UserMenu from "@/components/auth/UserMenu";
import { rememberReturnTo } from "@/lib/auth/return-to";
import type { Movie } from "@/lib/types";

function HeaderInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, status } = useAuth();
  const returnTo = pathname + (searchParams.toString() ? `?${searchParams}` : "");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/movies") {
      return (
        pathname === "/movies" ||
        pathname.startsWith("/movies/") ||
        pathname === "/shows" ||
        pathname.startsWith("/shows/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Mobile menu open: freeze page scroll until X is used (iOS + Android)
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    const q = query.trim();
    if (q.length < 2) {
      return;
    }
    suggestTimer.current = setTimeout(() => {
      fetch(`/api/movies?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { results?: Movie[] } | null) => {
          const rows = data?.results?.slice(0, 6) ?? [];
          setSuggestions(rows);
          setSuggestOpen(rows.length > 0);
        })
        .catch(() => {
          setSuggestions([]);
          setSuggestOpen(false);
        });
    }, 220);
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [query]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/movies");
      return;
    }
    router.push(`/movies?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setOpen(false);
    setSuggestOpen(false);
  };

  const AuthActions = (
    <div className="flex items-center gap-2">
      {status === "loading" ? (
        <span
          className="h-10 w-24 animate-pulse rounded-lg bg-[#1A1A1A]"
          aria-hidden
        />
      ) : status === "authenticated" && user ? (
        <UserMenu user={user} />
      ) : (
        <>
          <Link
            href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            onClick={() => rememberReturnTo(returnTo)}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-[#999999] outline-none transition hover:text-white sm:text-[14px]"
          >
            Login
          </Link>
          <Link
            href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
            onClick={() => rememberReturnTo(returnTo)}
            className="rounded-lg bg-cta px-3 py-2 text-[13px] font-medium text-white outline-none transition hover:bg-red-600 sm:px-4 sm:text-[14px]"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );

  const SearchBell = (
    <div className="flex items-center gap-[14px]">
      <button
        type="button"
        className="flex h-6 w-6 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
        aria-label="Search"
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen((v) => !v)}
      >
        <Image
          src="/Icons/Search Icon.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          aria-hidden
        />
      </button>
      <button
        type="button"
        className="flex h-6 w-6 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
        aria-label="Notifications"
      >
        <Image
          src="/Icons/Bell Icon.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          aria-hidden
        />
      </button>
    </div>
  );

  return (
    <header className="absolute inset-x-0 top-0 z-[100] w-full max-w-full">
      <div className="page-container grid h-[var(--header-h)] min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="z-10 flex h-10 shrink-0 items-center"
          aria-label="StreamVibe home"
        >
          <Image
            src="/Icons/Logo.svg"
            alt="StreamVibe"
            width={166}
            height={50}
            className="h-8 w-auto max-w-[120px] sm:h-10 sm:max-w-[166px]"
            priority
          />
        </Link>

        <nav className="hidden min-w-0 justify-center lg:flex" aria-label="Main">
          <div className="flex max-w-full flex-wrap items-center justify-center rounded-xl border-[3px] border-[#1F1F1F] bg-navbar p-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`cursor-pointer rounded-lg px-2.5 py-2 text-[clamp(0.8rem,1.1vw,18px)] font-medium whitespace-nowrap transition-colors xl:px-4 ${
                    active
                      ? "bg-pill-active text-white"
                      : "text-[#999999] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 lg:hidden" />

        <div className="z-10 flex h-10 shrink-0 items-center justify-end gap-2 sm:gap-3">
          {/* Desktop search + bell + auth */}
          <div className="hidden items-center gap-3 lg:flex">
            {SearchBell}
            {AuthActions}
          </div>

          {/* Mobile: search + bell + auth + menu */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            {SearchBell}
            {AuthActions}
            <button
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <FiX className="h-6 w-6 text-white" />
              ) : (
                <Image
                  src="/Icons/Mobile m.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                  aria-hidden
                  priority
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search input panel */}
      {searchOpen ? (
        <div className="relative border-b border-[#1F1F1F] bg-[#0F0F0F]/95 backdrop-blur-sm">
          <form
            onSubmit={onSearch}
            className="page-container flex items-center gap-3 py-3"
            autoComplete="off"
          >
            <Image
              src="/Icons/Search Icon.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 opacity-70"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies…"
              autoFocus
              /* 16px+ on mobile prevents iOS Safari auto-zoom on focus */
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#999999] sm:text-[14px]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-cta px-4 py-2 text-[14px] font-medium text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSuggestOpen(false);
              }}
              className="shrink-0 text-[#999999] hover:text-white"
              aria-label="Close search"
            >
              <FiX className="h-5 w-5" />
            </button>
          </form>
          {suggestOpen && query.trim().length >= 2 && suggestions.length ? (
            <ul
              className="page-container absolute inset-x-0 top-full z-50 max-h-72 overflow-auto border-b border-[#1F1F1F] bg-[#0F0F0F] py-2 shadow-xl"
              role="listbox"
              aria-label="Movie suggestions"
            >
              {suggestions.map((movie) => {
                const title = movie.title || movie.name || "Untitled";
                return (
                  <li key={movie.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="flex w-full items-center px-1 py-2 text-left text-[14px] text-white outline-none hover:bg-[#1A1A1A]"
                      onClick={() => {
                        router.push(`/movies/${movie.id}`);
                        setSearchOpen(false);
                        setSuggestOpen(false);
                        setOpen(false);
                      }}
                    >
                      {title}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 top-[var(--header-h)] z-40 overflow-hidden overscroll-none bg-background/95 backdrop-blur-sm lg:hidden">
          <nav className="page-container overflow-hidden py-4" aria-label="Mobile">
            <div className="rounded-xl border-[3px] border-[#1F1F1F] bg-navbar p-2">
              {status === "anonymous" ? (
                <div className="mb-2 flex gap-2 p-2">
                  <Link
                    href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                    onClick={() => {
                      rememberReturnTo(returnTo);
                      setOpen(false);
                    }}
                    className="flex-1 rounded-lg px-3 py-2.5 text-center text-[15px] font-medium text-[#999999]"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
                    onClick={() => {
                      rememberReturnTo(returnTo);
                      setOpen(false);
                    }}
                    className="flex-1 rounded-lg bg-cta px-3 py-2.5 text-center text-[15px] font-medium text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block cursor-pointer rounded-lg px-4 py-3.5 text-[18px] font-normal transition-colors ${
                      active
                        ? "bg-pill-active text-white"
                        : "text-[#999999] hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<header className="absolute inset-x-0 top-0 z-[100] h-[var(--header-h)]" />}>
      <HeaderInner />
    </Suspense>
  );
}
