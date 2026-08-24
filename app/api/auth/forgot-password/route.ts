import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { localStartPasswordReset } from "@/lib/auth/local-store";

async function sendResetOtpEmail(to: string, code: string) {
  const user =
    process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim() || "";
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"StreamVibe" <${user}>`,
    to,
    subject: "Your StreamVibe password reset code",
    text: `Your StreamVibe password reset code is ${code}. Enter it on the reset screen to continue.`,
    html: `<p>Your StreamVibe password reset code is <strong>${code}</strong>.</p><p>Enter it on the reset screen to continue.</p>`,
  });
  return true;
}

/**
 * POST { email } — start a password-reset OTP and email it when SMTP is set.
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
    const developmentCode = result.started ? result.developmentCode : undefined;

    if (result.started && developmentCode) {
      try {
        await sendResetOtpEmail(email, developmentCode);
      } catch (error) {
        console.error("[forgot-password] email", error);
      }
    }

    return NextResponse.json({
      sent: true,
      email,
      developmentCode,
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { message: "Unable to send a reset code. Please try again." },
      { status: 500 },
    );
  }
}
