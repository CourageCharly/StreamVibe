import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";
import {
  applyRegisteredAccountCookie,
  issueAccountProof,
  readSessionToken,
  sessionToUser,
} from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const user = sessionToUser(session);
  const response = NextResponse.json({
    user,
    accountProof: issueAccountProof(user),
  });
  applyRegisteredAccountCookie(response, user, request);
  return response;
}
