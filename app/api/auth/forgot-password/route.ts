import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { localStartPasswordReset } from "@/lib/auth/local-store";

const OTP_SUBJECT = "Your StreamVibe password reset code";

function otpBodies(code: string) {
  const text = `Your StreamVibe password reset code is ${code}. Enter it on the reset screen to continue.`;
  const html = `<p>Your StreamVibe password reset code is <strong>${code}</strong>.</p><p>Enter it on the reset screen to continue.</p>`;
  return { text, html };
}

async function sendViaSmtp(to: string, code: string): Promise<boolean> {
  const user =
    process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim() || "";
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";
  const { text, html } = otpBodies(code);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"StreamVibe" <${user}>`,
    to,
    subject: OTP_SUBJECT,
    text,
    html,
  });
  return true;
}

async function sendViaResend(to: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from =
    process.env.RESEND_FROM?.trim() ||
    "StreamVibe <onboarding@resend.dev>";
  const { text, html } = otpBodies(code);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: OTP_SUBJECT,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[forgot-password] Resend", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendViaFormSubmit(
  to: string,
  code: string,
  request: NextRequest,
): Promise<boolean> {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(to)}`;
  const origin =
    request.headers.get("origin") ||
    request.nextUrl.origin ||
    "https://localhost";
  const { text } = otpBodies(code);

  const body = new URLSearchParams({
    name: "StreamVibe",
    email: to,
    message: text,
    _subject: OTP_SUBJECT,
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
      Referer: `${origin}/forgot-password`,
    },
    body: body.toString(),
    cache: "no-store",
  });

  const raw = await res.text().catch(() => "");
  console.info("[forgot-password] FormSubmit", res.status, raw.slice(0, 240));

  let data: { success?: string | boolean; message?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* ignore */
  }

  if (data.success === true || data.success === "true") return true;
  const msg = String(data.message ?? raw ?? "").toLowerCase();
  // Activation email still reaches the inbox so the user gets a message.
  if (
    /successfully|form was submitted|thank you|confirm|activation|activate/i.test(
      msg,
    )
  ) {
    return true;
  }
  return res.ok;
}

async function sendResetOtpEmail(
  to: string,
  code: string,
  request: NextRequest,
): Promise<boolean> {
  try {
    if (await sendViaSmtp(to, code)) return true;
  } catch (error) {
    console.error("[forgot-password] SMTP", error);
  }
  try {
    if (await sendViaResend(to, code)) return true;
  } catch (error) {
    console.error("[forgot-password] Resend", error);
  }
  try {
    if (await sendViaFormSubmit(to, code, request)) return true;
  } catch (error) {
    console.error("[forgot-password] FormSubmit", error);
  }
  return false;
}

/**
 * POST { email } — always start a password-reset OTP and email it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const result = localStartPasswordReset(email);
    const sent = await sendResetOtpEmail(
      result.email,
      result.developmentCode,
      request,
    );
    if (!sent) {
      return NextResponse.json(
        { message: "Unable to send a reset code. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      sent: true,
      email: result.email,
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { message: "Unable to send a reset code. Please try again." },
      { status: 500 },
    );
  }
}
