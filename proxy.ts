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

function postLoginPath(pathname: string) {
  const isAccount = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  return isAccount ? "/" : pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isReviewWrite = /\/(movies|shows)\/[^/]+\/review\/?$/.test(pathname);
  const isProtected =
    isReviewWrite ||
    PROTECTED.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("returnTo", postLoginPath(pathname));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/list/:path*",
    "/history/:path*",
    "/notifications/:path*",
    "/movies/:id/review",
    "/shows/:id/review",
  ],
};
