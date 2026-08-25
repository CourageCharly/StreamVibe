import type { NextRequest } from "next/server";
import { otpEmailCopy, type OtpKind } from "@/lib/auth/otp-copy";
import { resendFrom, sendMail } from "@/lib/mail";

export type { OtpKind };

/** Activated FormSubmit form — used when Resend cannot send to that inbox. */
const OTP_FORMSUBMIT_ID = "096daf83e5c4e351210c16dca4ab3028";
const OTP_FORM_INBOX = "Couragelivingstone1@gmail.com";
const OTP_FORM_TARGETS = [OTP_FORMSUBMIT_ID, OTP_FORM_INBOX] as const;

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
  const body = new URLSearchParams({
    email: to,
    _subject: subject,
    _autoresponse: message,
    _template: "basic",
    _captcha: "false",
  });

  for (const target of OTP_FORM_TARGETS) {
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(target)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/${kind === "verify" ? "signup" : "forgot-password"}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: body.toString(),
      cache: "no-store",
    });

    const raw = await res.text().catch(() => "");
    console.info("[otp-email] FormSubmit", target, res.status, raw.slice(0, 240));
    if (/activat/i.test(raw)) continue;

    let data: { success?: string | boolean; message?: string } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      /* ignore */
    }

    if (data.success === true || data.success === "true") return true;
    const msg = String(data.message ?? raw ?? "").toLowerCase();
    if (/successfully|form was submitted|thank you/i.test(msg)) return true;
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
    if (
      await sendMail({
        to,
        subject,
        text,
        html,
        from: resendFrom("otp"),
      })
    ) {
      return true;
    }
  } catch (error) {
    console.error("[otp-email] Resend", error);
  }

  try {
    return await sendViaFormSubmit(to, kind, code, request);
  } catch (error) {
    console.error("[otp-email] FormSubmit", error);
    return false;
  }
}
