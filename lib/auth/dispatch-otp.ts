/** Send OTP to the user's inbox via FormSubmit from the browser. */

import { otpFormFields, type OtpKind } from "@/lib/auth/otp-copy";

export type { OtpKind };

export async function dispatchOtpEmail(
  to: string,
  code: string,
  kind: OtpKind,
): Promise<boolean> {
  const inbox = to.trim().toLowerCase();
  if (!inbox || !code || typeof window === "undefined") return false;
  const page = `${window.location.origin}/${kind === "verify" ? "signup" : "forgot-password"}`;
  const fields = otpFormFields(kind, code, inbox, page);

  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
      },
    );
    const raw = await res.text();
    if (/activat/i.test(raw)) return true;
    let data: { success?: string | boolean } = {};
    try {
      data = JSON.parse(raw) as { success?: string | boolean };
    } catch {
      /* ignore */
    }
    if (data.success === true || data.success === "true" || res.ok) {
      return true;
    }
  } catch {
    /* adblock or network — fall through */
  }

  try {
    const backup = await fetch("/api/auth/otp-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    return backup.ok;
  } catch {
    return false;
  }
}
