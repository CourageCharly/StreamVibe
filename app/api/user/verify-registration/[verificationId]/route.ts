import { NextRequest, NextResponse } from "next/server";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import { applySessionCookie } from "@/lib/auth/session";
import { verifyRegistration } from "@/lib/auth/service";

type Ctx = { params: Promise<{ verificationId: string }> };

/**
 * POST /api/user/verify-registration/{verificationId}
 */
export async function POST(_request: NextRequest, context: Ctx) {
  const { verificationId } = await context.params;
  try {
    const user = await verifyRegistration({ verificationId });
    const response = NextResponse.json({ user, verified: true });
    return applySessionCookie(
      response,
      { ...user, verified: true },
      _request,
    );
  } catch (error) {
    return jsonError(error, MESSAGES.verifyFailed);
  }
}
