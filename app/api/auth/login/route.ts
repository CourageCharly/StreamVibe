import { NextRequest, NextResponse } from "next/server";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import { applySessionCookie, issueAccountProof } from "@/lib/auth/session";
import { loginUser } from "@/lib/auth/service";

/**
 * Login uses the project's FusionAuth configuration (POST /api/login)
 * when FUSIONAUTH_URL and FUSIONAUTH_API_KEY are set.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      loginId?: string;
    };
    const email = (body.email ?? body.loginId ?? "").trim();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json(
        { message: MESSAGES.loginFailed },
        { status: 400 },
      );
    }
    const user = await loginUser(email, password);
    const response = NextResponse.json({
      user,
      accountProof: issueAccountProof(user),
    });
    return applySessionCookie(response, user, request);
  } catch (error) {
    return jsonError(error, MESSAGES.loginFailed, 401);
  }
}
