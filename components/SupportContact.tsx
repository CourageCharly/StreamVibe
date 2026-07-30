"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { COUNTRIES } from "@/lib/countries";
import { posterUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";
import Button from "@/components/ui/Button";

type Props = {
  posters?: Movie[];
};

/** Form field headers — white only */
const fieldLabel =
  "mb-2 block text-[13px] font-medium text-white sm:text-[14px]";

/** Shared field chrome: fill #141414, stroke #262626; placeholder #999999 */
const fieldChrome =
  "rounded-lg border border-[#262626] bg-[#141414] text-white outline-none transition placeholder:text-[12px] placeholder:text-[#999999] focus:border-[#404040]";

function FlagImg({ iso, name }: { iso: string; name: string }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      width={28}
      height={20}
      className="h-5 w-7 rounded-sm object-cover"
    />
  );
}

/**
 * Support hero — Welcome + poster collage (left) / contact form (right).
 * Design: Support Page - Laptop.png + exact field sizes.
 */
export default function SupportContact({ posters = [] }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+234"); // Nigeria default
  const [countryIso, setCountryIso] = useState("ng");
  const [flagOpen, setFlagOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const flagRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const selected =
    COUNTRIES.find((c) => c.iso === countryIso) ??
    COUNTRIES.find((c) => c.code === country) ??
    COUNTRIES[0];

  useEffect(() => {
    if (!flagOpen) return;
    function onDoc(e: MouseEvent) {
      if (!flagRef.current?.contains(e.target as Node)) setFlagOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [flagOpen]);

  const collage = Array.from({ length: 12 }, (_, i) => {
    const m = posters[i % Math.max(posters.length, 1)];
    return (
      m ?? {
        id: i,
        title: `Poster ${i + 1}`,
        overview: "",
        poster_path: null as string | null,
        backdrop_path: null as string | null,
        vote_average: 0,
      }
    );
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed || sending) return;
    setError("");
    setSending(true);
    setToast(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          countryCode: country,
          message,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setAgreed(false);
      setToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), 3000);
    } catch {
      setError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contact"
      className="grid min-w-0 grid-cols-1 items-stretch gap-4 bg-[#141414] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:gap-4 xl:gap-5"
    >
      {/* Success toast */}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-[#262626] bg-[#0F0F0F] px-5 py-3 text-[14px] font-medium text-white shadow-lg"
        >
          Message sent
        </div>
      ) : null}
      {/* Left — welcome + poster collage (height matches form column) */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <h1 className="max-w-md text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight text-white">
          Welcome to our support page!
        </h1>
        <p className="mt-3 max-w-md text-[14px] font-normal leading-relaxed text-[#999999] sm:mt-4">
          We&apos;re here to help you with any problems you may be having with
          our product.
        </p>

        {/* Collage: narrower, 6px stroke #262626, grows to match form height */}
        <div
          className="mt-5 flex min-h-0 w-full max-w-[min(100%,380px)] flex-1 overflow-hidden rounded-2xl bg-[#0F0F0F] sm:mt-6 lg:max-w-[min(100%,420px)]"
          style={{ border: "6px solid #262626" }}
        >
          <div className="grid h-full min-h-[280px] w-full grid-cols-4 grid-rows-3 gap-1.5 p-2 sm:gap-2 sm:p-2.5 lg:min-h-0">
            {collage.map((movie, i) => {
              const src = posterUrl(movie.poster_path, "w342");
              return (
                <div
                  key={`${movie.id}-${i}`}
                  className="relative min-h-0 overflow-hidden rounded-md bg-[#1A1A1A]"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={movie.title || "Poster"}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#262626] to-[#141414]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — form #0F0F0F */}
      <div className="min-w-0 rounded-2xl border border-[#262626] bg-[#0F0F0F] p-5 sm:p-6 md:p-8">
        <form onSubmit={onSubmit} className="w-full max-w-[820px] space-y-5">
          {/* First Name | Last Name — side by side */}
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5">
            <div className="min-w-0">
              <label htmlFor="support-first" className={fieldLabel}>
                First Name
              </label>
              <input
                id="support-first"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${fieldChrome} h-[53px] w-full max-w-[400px] px-4 text-[14px]`}
                required
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="support-last" className={fieldLabel}>
                Last Name
              </label>
              <input
                id="support-last"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${fieldChrome} h-[53px] w-full max-w-[400px] px-4 text-[14px]`}
                required
              />
            </div>
          </div>

          {/* Email | Phone — side by side */}
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5">
            <div className="min-w-0">
              <label htmlFor="support-email" className={fieldLabel}>
                Email
              </label>
              <input
                id="support-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${fieldChrome} h-[53px] w-full max-w-[400px] px-4 text-[14px]`}
                required
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="support-phone" className={fieldLabel}>
                Phone Number
              </label>
              {/* Balanced row: flag dropdown 76×53 + phone field */}
              <div className="flex h-[53px] w-full max-w-[480px] items-stretch gap-2 sm:gap-2.5">
                <div ref={flagRef} className="relative h-[53px] w-[76px] shrink-0">
                  <button
                    type="button"
                    aria-label={`Country: ${selected.name}`}
                    aria-haspopup="listbox"
                    aria-expanded={flagOpen}
                    onClick={() => setFlagOpen((o) => !o)}
                    className={`${fieldChrome} flex h-[53px] w-[76px] items-center justify-center gap-1 px-2`}
                  >
                    <FlagImg iso={selected.iso} name={selected.name} />
                    <FiChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-[#999999] transition ${flagOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {/* Short scrollable list — slides without visible scrollbar */}
                  <ul
                    role="listbox"
                    aria-label="Select country"
                    className={[
                      "absolute left-0 top-[calc(100%+4px)] z-30 w-[76px] overflow-y-auto rounded-lg border border-[#262626] bg-[#141414] py-0.5 shadow-lg",
                      "max-h-[120px] transition-all duration-200 ease-out",
                      /* hide scrollbar (still scrollable / swipeable) */
                      "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                      flagOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0",
                    ].join(" ")}
                    aria-hidden={!flagOpen}
                  >
                    {COUNTRIES.map((c) => (
                      <li
                        key={`${c.iso}-${c.code}`}
                        role="option"
                        aria-selected={
                          c.code === country && c.iso === selected.iso
                        }
                      >
                        <button
                          type="button"
                          tabIndex={flagOpen ? 0 : -1}
                          className={[
                            "flex h-9 w-full items-center justify-center px-2 transition hover:bg-[#1A1A1A]",
                            c.code === country && c.iso === selected.iso
                              ? "bg-[#1A1A1A]"
                              : "",
                          ].join(" ")}
                          onClick={() => {
                            setCountry(c.code);
                            setCountryIso(c.iso);
                            setFlagOpen(false);
                          }}
                        >
                          <FlagImg iso={c.iso} name={c.name} />
                          <span className="sr-only">{c.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Hidden dial code for form / accessibility */}
                  <input type="hidden" name="countryCode" value={country} />
                </div>
                <input
                  id="support-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${fieldChrome} h-[53px] min-w-0 flex-1 px-4 text-[14px]`}
                />
              </div>
            </div>
          </div>

          {/* Message 720×129 */}
          <div className="min-w-0 w-full max-w-[820px]">
            <label htmlFor="support-message" className={fieldLabel}>
              Message
            </label>
            <textarea
              id="support-message"
              name="message"
              placeholder="Enter your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${fieldChrome} h-[129px] w-full max-w-[820px] resize-none px-4 py-3 text-[14px]`}
              required
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <label className="flex min-w-0 cursor-pointer items-center gap-3 text-[14px] font-normal leading-normal text-[#999999]">
              {/* Checkbox: 24×24, fill #0F0F0F, stroke #262626 */}
              <span className="relative inline-flex h-6 w-6 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer absolute inset-0 z-10 h-6 w-6 cursor-pointer opacity-0"
                  required
                />
                <span
                  className="pointer-events-none flex h-6 w-6 items-center justify-center rounded border border-[#262626] bg-[#0F0F0F] peer-checked:border-[#E50000] peer-checked:bg-[#0F0F0F] peer-focus-visible:ring-1 peer-focus-visible:ring-cta"
                  aria-hidden
                >
                  {agreed ? (
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      fill="none"
                      className="text-cta"
                    >
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </span>
              {/* Entire terms line stays #999999 */}
              <span className="font-normal text-[#999999]">
                I agree with Terms of Use and Privacy Policy
              </span>
            </label>

            <Button
              type="submit"
              className="!w-auto shrink-0 self-stretch px-6 sm:self-auto"
              disabled={!agreed || sending}
            >
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </div>

          {error ? (
            <p className="text-[13px] font-medium text-cta" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
