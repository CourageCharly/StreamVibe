import { NextRequest, NextResponse } from "next/server";
import { PENDING_AUTH_COOKIE } from "@/lib/auth/config";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import {
  applySessionCookie,
  issueAccountProof,
  readPendingAuth,
} from "@/lib/auth/session";
import { resendVerification, verifyRegistration } from "@/lib/auth/service";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";

/**
 * POST /api/user/verify-registration
 * PUT  /api/user/verify-registration?applicationId=&email=
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      verificationId?: string;
      oneTimeCode?: string;
      email?: string;
    };
    const pending = readPendingAuth(
      request.cookies.get(PENDING_AUTH_COOKIE)?.value,
    );
    const user = await verifyRegistration({
      verificationId: body.verificationId,
      oneTimeCode: body.oneTimeCode,
      email: body.email ?? pending?.email,
    });
    const verifiedUser = { ...user, verified: true };
    const response = NextResponse.json({
      user: verifiedUser,
      verified: true,
      accountProof: issueAccountProof(verifiedUser),
    });
    return applySessionCookie(
      response,
      { ...user, verified: true },
      request,
    );
  } catch (error) {
    return jsonError(error, MESSAGES.verifyFailed);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const email =
      request.nextUrl.searchParams.get("email")?.trim() ||
      ((await request.json().catch(() => ({}))) as { email?: string }).email ||
      "";
    if (!email) {
      return NextResponse.json(
        { message: MESSAGES.resendFailed },
        { status: 400 },
      );
    }
    const result = await resendVerification(email);
    const code =
      "developmentCode" in result ? result.developmentCode : undefined;
    if (code) {
      await sendOtpEmail({
        to: result.email,
        code,
        kind: "verify",
        request,
      });
    }
    return NextResponse.json({
      message: "Verification email sent.",
      email: result.email,
      verificationId:
        "verificationId" in result ? result.verificationId : undefined,
      dispatchCode: code,
    });
  } catch (error) {
    return jsonError(error, MESSAGES.resendFailed);
  }
}
