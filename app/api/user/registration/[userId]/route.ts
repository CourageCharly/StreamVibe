import { NextRequest, NextResponse } from "next/server";
import {
  applyOtpCookie,
  applyPendingAuthCookie,
  applyRegisteredAccountCookie,
  applySessionCookie,
  issueAccountProof,
} from "@/lib/auth/session";
import { registerUser } from "@/lib/auth/service";
import { jsonError } from "@/lib/auth/http";
import { MESSAGES } from "@/lib/auth/errors";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";

type Ctx = { params: Promise<{ userId: string }> };

/**
 * POST /api/user/registration/{userId}
 * Create a user and application registration (FusionAuth combined API).
 */
export async function POST(request: NextRequest, context: Ctx) {
  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ message: MESSAGES.registerFailed }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      user?: {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
      };
    };
    const email = body.user?.email?.trim() ?? "";
    const password = body.user?.password ?? "";
    const firstName = body.user?.firstName?.trim() ?? "";
    const lastName = body.user?.lastName?.trim() ?? "";

    const fieldErrors: Record<string, string> = {};
    if (!firstName) fieldErrors.firstName = "First name is required.";
    if (!lastName) fieldErrors.lastName = "Last name is required.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 8) {
      fieldErrors.password = "Password must be at least 8 characters.";
    }
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: MESSAGES.registerFailed, fieldErrors },
        { status: 400 },
      );
    }

    const result = await registerUser(userId, {
      email,
      password,
      firstName,
      lastName,
    });

    if (result.requiresVerification && result.developmentCode) {
      const sent = await sendOtpEmail({
        to: result.user.email,
        code: result.developmentCode,
        kind: "verify",
        request,
      });
      if (!sent) {
        console.error("[registration] verification email was not delivered");
      }
    }

    const response = NextResponse.json({
      user: result.user,
      requiresVerification: result.requiresVerification,
      verificationId: result.verificationId,
      dispatchCode: result.developmentCode,
      accountProof: issueAccountProof(result.user),
    });

    try {
      applyRegisteredAccountCookie(response, result.user, request);
      if (result.requiresVerification && result.developmentCode) {
        applyOtpCookie(response, {
          email: result.user.email,
          code: result.developmentCode,
          kind: "verify",
        });
        applyPendingAuthCookie(response, result.user.id, result.user.email);
      } else {
        applySessionCookie(response, result.user, request);
      }
    } catch (cookieError) {
      console.error("[registration] session cookie", cookieError);
    }

    return response;
  } catch (error) {
    console.error("[registration]", error);
    return jsonError(error, MESSAGES.registerFailed);
  }
}
