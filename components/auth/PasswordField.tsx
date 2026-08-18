"use client";

import { useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib";

const fieldChrome =
  "w-full rounded-lg border border-[#262626] bg-[#141414] px-4 py-3 pr-12 text-[14px] text-white outline-none transition placeholder:text-[#999999] focus:border-[#404040]";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordField({ className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(fieldChrome, className)}
      />
      <button
        type="button"
        tabIndex={0}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white outline-none"
      >
        {visible ? (
          <FiEyeOff className="h-5 w-5 text-white" aria-hidden />
        ) : (
          <FiEye className="h-5 w-5 text-white" aria-hidden />
        )}
      </button>
    </div>
  );
}
