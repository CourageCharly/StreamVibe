import { NextRequest, NextResponse } from "next/server";
import { localStartPasswordReset } from "@/lib/auth/local-store";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";

/**
 * POST { email } — start a password-reset OTP for a registered user and email it.
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
    if (!result.started) {
      return NextResponse.json(
        { message: "No account found with that email." },
        { status: 404 },
      );
    }

    const sent = await sendOtpEmail({
      to: result.email,
      code: result.developmentCode,
      kind: "reset",
      request,
    });
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
