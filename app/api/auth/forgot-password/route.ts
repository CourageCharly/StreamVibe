import { NextRequest, NextResponse } from "next/server";
import {
  localEnsureRegisteredUser,
  localStartPasswordReset,
} from "@/lib/auth/local-store";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";
import {
  applyOtpCookie,
  hydrateUsersFromRequest,
  readAccountProof,
  readRegisteredAccounts,
} from "@/lib/auth/session";

/**
 * POST { email, accountProof? } — start a reset OTP for a registered email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      accountProof?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    hydrateUsersFromRequest(request);
    const fromCookie = readRegisteredAccounts(request).find(
      (row) => row.email === email,
    );
    const fromProof = readAccountProof(body.accountProof ?? null);
    const registered =
      fromCookie ||
      (fromProof && fromProof.email === email
        ? { id: fromProof.userId, email: fromProof.email }
        : null);

    if (registered) {
      localEnsureRegisteredUser({
        id: registered.id,
        email: registered.email,
      });
    }

    let result = localStartPasswordReset(email);
    if (!result.started && registered) {
      localEnsureRegisteredUser({
        id: registered.id,
        email,
      });
      result = localStartPasswordReset(email);
    }

    if (!result.started) {
      return NextResponse.json(
        { message: "No account found with that email." },
        { status: 404 },
      );
    }

    await sendOtpEmail({
      to: result.email,
      code: result.developmentCode,
      kind: "reset",
      request,
    });

    const response = NextResponse.json({
      sent: true,
      email: result.email,
      dispatchCode: result.developmentCode,
    });
    applyOtpCookie(response, {
      email: result.email,
      code: result.developmentCode,
      kind: "reset",
    });
    return response;
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { message: "Unable to send a reset code. Please try again." },
      { status: 500 },
    );
  }
}
