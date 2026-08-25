import Image from "next/image";
import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/constants";

const SOCIAL = [
  { src: "/Icons/Fb Icon.svg", label: "Facebook" },
  { src: "/Icons/X.svg", label: "X" },
  { src: "/Icons/Linkedin Icon.svg", label: "LinkedIn" },
] as const;

export default function Footer() {
  return (
    <footer
      className="w-full min-w-0 max-w-full overflow-x-hidden border-0 border-t-0 bg-navbar shadow-none ring-0 sm:border-t-0 sm:bg-background sm:shadow-none"
      style={{ borderTop: "none", boxShadow: "none" }}
    >
      <div className="page-container pt-[clamp(2rem,4vw,4rem)] pb-10 sm:pb-12">
        <div className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-6">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="min-w-0">
              <h3 className="mb-3 text-[16px] font-semibold text-white">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] font-medium text-[#999999] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Same col span as Subscription / other columns — side by side on mobile */}
          <div className="min-w-0">
            <h3 className="mb-3 text-[16px] font-semibold text-white">
              Connect With Us
            </h3>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.map(({ src, label }) => (
                <span
                  key={label}
                  aria-label={label}
                  className="block shrink-0 cursor-default"
                >
                  {/* Full framed SVG; glyph ~24px at this display size */}
                  <Image
                    src={src}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                    aria-hidden
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 pt-6 text-[14px] font-medium text-[#999999] sm:mt-12 sm:flex-row sm:items-center">
          <p className="shrink-0">@2026 streamvib, All Rights Reserved</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
            <Link
              href="/terms"
              className="text-[14px] font-medium text-[#999999] transition-colors hover:text-white"
            >
              Terms of Use
            </Link>
            <span className="hidden text-border sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/privacy"
              className="text-[14px] font-medium text-[#999999] transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="hidden text-border sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/cookies"
              className="text-[14px] font-medium text-[#999999] transition-colors hover:text-white"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
