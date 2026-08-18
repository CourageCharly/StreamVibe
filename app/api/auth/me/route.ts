import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { readSessionToken, sessionToUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: sessionToUser(session) });
}
