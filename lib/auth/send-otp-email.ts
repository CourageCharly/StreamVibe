import type { NextRequest } from "next/server";
import { otpEmailCopy, type OtpKind } from "@/lib/auth/otp-copy";
import { resendFrom, sendMail } from "@/lib/mail";

export type { OtpKind };

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  kind: OtpKind;
  request?: NextRequest;
}): Promise<boolean> {
  const { to, code, kind } = opts;
  const { subject, text, html } = otpEmailCopy(kind, code);
  try {
    return await sendMail({
      to,
      subject,
      text,
      html,
      from: resendFrom("otp"),
    });
  } catch (error) {
    console.error("[otp-email] Resend", error);
    return false;
  }
}
