import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** All CTAs: 149×49, 14px semibold */
const base =
  "inline-flex h-[49px] w-[149px] max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold whitespace-nowrap outline-none transition hover:opacity-95 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cta/60 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-cta text-white hover:bg-red-600",
  secondary:
    "border border-[#262626] bg-[#141414] text-white hover:bg-[#1A1A1A]",
} as const;

type Variant = keyof typeof variants;

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  href?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  href,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
