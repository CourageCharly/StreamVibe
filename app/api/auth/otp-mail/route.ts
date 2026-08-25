import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";
import { readOtpCookie } from "@/lib/auth/session";

/** Backup send when the browser cannot reach FormSubmit (adblock, CORS). */
export async function POST(request: NextRequest) {
  const otp = readOtpCookie(request);
  if (!otp) {
    return NextResponse.json({ sent: false }, { status: 400 });
  }
  const sent = await sendOtpEmail({
    to: otp.email,
    code: otp.code,
    kind: otp.kind,
    request,
  });
  return NextResponse.json({ sent });
}
