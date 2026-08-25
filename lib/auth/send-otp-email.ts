import type { NextRequest } from "next/server";
import {
  OTP_FORM_TARGETS,
  otpEmailCopy,
  type OtpKind,
} from "@/lib/auth/otp-copy";
import { resendFrom, sendMail } from "@/lib/mail";

export type { OtpKind };

async function sendViaFormSubmit(
  to: string,
  kind: OtpKind,
  code: string,
  request?: NextRequest,
): Promise<boolean> {
  const origin =
    request?.headers.get("origin") ||
    request?.nextUrl.origin ||
    "https://stream-vibe-dusky.vercel.app";
  const { subject, message } = otpEmailCopy(kind, code);
  const page =
    kind === "verify" ? `${origin}/signup` : `${origin}/forgot-password`;

  for (const target of OTP_FORM_TARGETS) {
    const body = new URLSearchParams({
      email: to,
      _subject: subject,
      _autoresponse: message,
      _template: "basic",
      _url: page,
    });

    const endpoint = `https://formsubmit.co/${encodeURIComponent(target)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Origin: origin,
        Referer: page,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      body: body.toString(),
      cache: "no-store",
    });

    const raw = await res.text().catch(() => "");
    console.info("[otp-email] FormSubmit", target, res.status, raw.slice(0, 240));
    if (/activat/i.test(raw)) continue;
    if (res.ok) return true;
  }
  return false;
}

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  kind: OtpKind;
  request?: NextRequest;
}): Promise<boolean> {
  const { to, code, kind, request } = opts;
  const { subject, text, html } = otpEmailCopy(kind, code);

  try {
    const sent = await sendMail({
      to,
      subject,
      text,
      html,
      from: resendFrom("otp"),
    });
    if (sent) return true;
  } catch (error) {
    console.error("[otp-email] Resend", error);
  }

  try {
    if (await sendViaFormSubmit(to, kind, code, request)) return true;
  } catch (error) {
    console.error("[otp-email] FormSubmit", error);
  }

  return false;
}
