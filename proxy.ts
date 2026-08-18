import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";

const PROTECTED = [
  "/profile",
  "/settings",
  "/list",
  "/history",
  "/notifications",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/list/:path*",
    "/history/:path*",
    "/notifications/:path*",
  ],
};
