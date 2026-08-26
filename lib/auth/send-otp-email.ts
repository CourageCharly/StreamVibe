import type { NextRequest } from "next/server";
import {
  OTP_FORMSUBMIT_ID,
  otpEmailCopy,
  otpFormFields,
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
  const page =
    kind === "verify" ? `${origin}/signup` : `${origin}/forgot-password`;
  const fields = otpFormFields(kind, code, to, page);

  const endpoint = `https://formsubmit.co/ajax/${OTP_FORMSUBMIT_ID}`;
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
  console.info("[otp-email] FormSubmit", to, res.status, raw.slice(0, 240));
  if (/activat/i.test(raw)) return true;

  let data: { success?: string | boolean; message?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* ignore */
  }

  if (data.success === true || data.success === "true") return true;
  const msg = String(data.message ?? raw ?? "").toLowerCase();
  if (/successfully|form was submitted|thank you/i.test(msg)) return true;
  return res.ok;
}

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  kind: OtpKind;
  request?: NextRequest;
}): Promise<boolean> {
  const { to, code, kind, request } = opts;
  try {
    if (await sendViaFormSubmit(to, kind, code, request)) return true;
  } catch (error) {
    console.error("[otp-email] FormSubmit", error);
  }
  try {
    const { subject, text, html } = otpEmailCopy(kind, code, to);
    if (await sendMail({ to, subject, text, html, from: resendFrom("otp") })) {
      return true;
    }
  } catch (error) {
    console.error("[otp-email] Resend", error);
  }
  return false;
}
