/** Browser-side OTP mail — same FormSubmit path that works for Support. */

import { otpEmailCopy, type OtpKind } from "@/lib/auth/otp-copy";

export type { OtpKind };

export async function dispatchOtpEmail(
  to: string,
  code: string,
  kind: OtpKind,
): Promise<boolean> {
  if (!to || !code || typeof window === "undefined") return false;
  const { subject, message } = otpEmailCopy(kind, code);
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          _template: "basic",
          _captcha: "false",
          message,
        }),
      },
    );
    const raw = await res.text().catch(() => "");
    let data: { success?: string | boolean } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      /* ignore */
    }
    if (data.success === true || data.success === "true") return true;
    return res.ok;
  } catch {
    return false;
  }
}
