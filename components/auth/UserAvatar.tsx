"use client";

import type { AuthUser } from "@/lib/auth/types";
import { userInitials } from "@/lib/initials";

type Props = {
  user: AuthUser;
  size?: number;
  className?: string;
};

/**
 * Account photo — native img so Google avatars are not blocked by the
 * Next image optimizer / referrer checks.
 */
export default function UserAvatar({ user, size = 40, className = "" }: Props) {
  const initials = userInitials(user.firstName, user.lastName, user.email);
  const src = user.imageUrl?.trim() ?? "";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <span className="text-[13px] font-semibold text-white sm:text-[15px]">
      {initials}
    </span>
  );
}
