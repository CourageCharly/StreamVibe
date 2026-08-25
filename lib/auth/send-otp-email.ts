import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import {
  OTP_FORM_TARGETS,
  otpEmailCopy,
  type OtpKind,
} from "@/lib/auth/otp-copy";

export type { OtpKind };

async function sendViaSmtp(
  to: string,
  kind: OtpKind,
  code: string,
): Promise<boolean> {
  const user =
    process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim() || "";
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";
  const { subject, text, html } = otpEmailCopy(kind, code);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"StreamVibe" <${user}>`,
    to,
    subject,
    text,
    html,
  });
  return true;
}

async function sendViaResend(
  to: string,
  kind: OtpKind,
  code: string,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from =
    process.env.RESEND_FROM?.trim() || "StreamVibe <onboarding@resend.dev>";
  const { subject, text, html } = otpEmailCopy(kind, code);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[otp-email] Resend", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendViaFormSubmit(
  to: string,
  kind: OtpKind,
  code: string,
  request?: NextRequest,
): Promise<boolean> {
  const origin =
    request?.headers.get("origin") ||
    request?.nextUrl.origin ||
    "https://localhost";
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
  try {
    if (await sendViaSmtp(to, kind, code)) return true;
  } catch (error) {
    console.error("[otp-email] SMTP", error);
  }
  try {
    if (await sendViaResend(to, kind, code)) return true;
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
