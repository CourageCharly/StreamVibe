import type { NextRequest } from "next/server";
import {
  OTP_FORM_TARGETS,
  otpEmailCopy,
  type OtpKind,
} from "@/lib/auth/otp-copy";

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
  const fields = {
    email: to,
    _subject: subject,
    _autoresponse: message,
    _template: "basic",
    _url: page,
  };

  for (const target of OTP_FORM_TARGETS) {
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(target)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: page,
      },
      body: JSON.stringify(fields),
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
  try {
    return await sendViaFormSubmit(opts.to, opts.kind, opts.code, opts.request);
  } catch (error) {
    console.error("[otp-email] FormSubmit", error);
    return false;
  }
}
