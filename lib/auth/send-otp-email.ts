import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export type OtpKind = "reset" | "verify";

function copy(kind: OtpKind, code: string) {
  if (kind === "verify") {
    return {
      subject: "Your StreamVibe verification code",
      text: `Your StreamVibe verification code is ${code}. Enter it to finish creating your account.`,
      html: `<p>Your StreamVibe verification code is <strong>${code}</strong>.</p><p>Enter it to finish creating your account.</p>`,
    };
  }
  return {
    subject: "Your StreamVibe password reset code",
    text: `Your StreamVibe password reset code is ${code}. Enter it on the reset screen to continue.`,
    html: `<p>Your StreamVibe password reset code is <strong>${code}</strong>.</p><p>Enter it on the reset screen to continue.</p>`,
  };
}

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
  const { subject, text, html } = copy(kind, code);

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
  const { subject, text, html } = copy(kind, code);

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
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(to)}`;
  const origin =
    request?.headers.get("origin") ||
    request?.nextUrl.origin ||
    "https://localhost";
  const { subject, text } = copy(kind, code);

  const body = new URLSearchParams({
    name: "StreamVibe",
    email: to,
    message: text,
    _subject: subject,
    _template: "box",
    _captcha: "false",
    _honey: "",
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/${kind === "verify" ? "signup" : "forgot-password"}`,
    },
    body: body.toString(),
    cache: "no-store",
  });

  const raw = await res.text().catch(() => "");
  console.info("[otp-email] FormSubmit", res.status, raw.slice(0, 240));

  let data: { success?: string | boolean; message?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* ignore */
  }

  if (data.success === true || data.success === "true") return true;
  const msg = String(data.message ?? raw ?? "").toLowerCase();
  if (
    /successfully|form was submitted|thank you|confirm|activation|activate/i.test(
      msg,
    )
  ) {
    return true;
  }
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
