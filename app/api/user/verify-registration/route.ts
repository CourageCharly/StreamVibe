import { NextRequest, NextResponse } from "next/server";
import { PENDING_AUTH_COOKIE } from "@/lib/auth/config";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import {
  applySessionCookie,
  readPendingAuth,
} from "@/lib/auth/session";
import { resendVerification, verifyRegistration } from "@/lib/auth/service";

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
    const response = NextResponse.json({
      user,
      verified: true,
    });
    return applySessionCookie(response, { ...user, verified: true });
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
    return NextResponse.json({
      message: "Verification email sent.",
      email: result.email,
      developmentCode:
        "developmentCode" in result ? result.developmentCode : undefined,
      verificationId:
        "verificationId" in result ? result.verificationId : undefined,
    });
  } catch (error) {
    return jsonError(error, MESSAGES.resendFailed);
  }
}
