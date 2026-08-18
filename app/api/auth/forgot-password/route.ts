import { NextRequest, NextResponse } from "next/server";
import { localFindByEmail, localStartPasswordReset } from "@/lib/auth/local-store";

/**
 * POST { email } — start a password-reset OTP.
 * Always returns the same success shape so emails are not enumerated.
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
    const exists = Boolean(localFindByEmail(email));

    return NextResponse.json({
      sent: true,
      email,
      developmentCode: result.started ? result.developmentCode : undefined,
      exists,
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { message: "Unable to send a reset code. Please try again." },
      { status: 500 },
    );
  }
}
