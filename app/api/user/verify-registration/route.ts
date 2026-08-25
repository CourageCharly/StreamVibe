import { NextRequest, NextResponse } from "next/server";
import { PENDING_AUTH_COOKIE } from "@/lib/auth/config";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import {
  applyOtpCookie,
  applySessionCookie,
  clearOtpCookie,
  hydrateUsersFromRequest,
  issueAccountProof,
  otpCookieMatches,
  readPendingAuth,
} from "@/lib/auth/session";
import {
  localCommitVerifiedUser,
  localMarkEmailVerified,
} from "@/lib/auth/local-store";
import { generateOtp } from "@/lib/auth/otp";
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
    hydrateUsersFromRequest(request);
    const pending = readPendingAuth(
      request.cookies.get(PENDING_AUTH_COOKIE)?.value,
    );
    const email = (body.email ?? pending?.email ?? "").trim().toLowerCase();
    const code = body.oneTimeCode?.trim() ?? "";
    let user;
    try {
      user = await verifyRegistration({
        verificationId: body.verificationId,
        oneTimeCode: body.oneTimeCode,
        email: email || undefined,
      });
    } catch (error) {
      if (
        email &&
        code &&
        otpCookieMatches(request, email, code, "verify")
      ) {
        user = localCommitVerifiedUser({
          id: pending?.userId,
          email,
          firstName: pending?.firstName,
          lastName: pending?.lastName,
          passwordHash: pending?.passwordHash,
        });
      } else {
        throw error;
      }
    }
    if (user && pending && pending.email === email) {
      user = localCommitVerifiedUser({
        id: pending.userId || user.id,
        email,
        firstName: pending.firstName || user.firstName,
        lastName: pending.lastName || user.lastName,
        passwordHash: pending.passwordHash,
      });
    } else if (user) {
      user = localMarkEmailVerified(email) ?? user;
    }
    if (!user) {
      return NextResponse.json(
        { message: MESSAGES.verifyFailed },
        { status: 400 },
      );
    }
    const verifiedUser = { ...user, verified: true };
    const response = NextResponse.json({
      user: verifiedUser,
      verified: true,
      accountProof: issueAccountProof(verifiedUser),
    });
    clearOtpCookie(response);
    return applySessionCookie(response, verifiedUser, request);
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
    hydrateUsersFromRequest(request);
    const normalized = email.trim().toLowerCase();
    let code: string | undefined;
    let verificationId: string | undefined;
    try {
      const result = await resendVerification(normalized);
      code =
        "developmentCode" in result ? result.developmentCode : undefined;
      verificationId =
        "verificationId" in result ? result.verificationId : undefined;
    } catch {
      code = generateOtp();
    }
    if (!code) {
      return NextResponse.json(
        { message: MESSAGES.resendFailed },
        { status: 500 },
      );
    }
    const sent = await sendOtpEmail({
      to: normalized,
      code,
      kind: "verify",
      request,
    });
    const response = NextResponse.json({
      message: "Verification email sent.",
      email: normalized,
      verificationId,
      emailSent: sent,
      dispatchCode: code,
    });
    if (code) {
      applyOtpCookie(response, {
        email: normalized,
        code,
        kind: "verify",
      });
    }
    return response;
  } catch (error) {
    return jsonError(error, MESSAGES.resendFailed);
  }
}
