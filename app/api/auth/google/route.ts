import { NextRequest, NextResponse } from "next/server";
import { MESSAGES } from "@/lib/auth/errors";
import { jsonError } from "@/lib/auth/http";
import { localUpsertGoogleUser } from "@/lib/auth/local-store";
import { applySessionCookie } from "@/lib/auth/session";

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

function isVerified(value: boolean | string | undefined) {
  return value === true || value === "true";
}

/**
 * POST { accessToken } — sign in or create a verified account from Google.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim() ?? "";
    if (!accessToken) {
      return NextResponse.json(
        { message: MESSAGES.googleFailed },
        { status: 400 },
      );
    }

    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { message: MESSAGES.googleFailed },
        { status: 401 },
      );
    }

    const profile = (await res.json()) as GoogleProfile;
    const email = profile.email?.trim().toLowerCase() ?? "";
    const googleId = profile.sub?.trim() ?? "";
    if (!email || !googleId || !isVerified(profile.email_verified)) {
      return NextResponse.json(
        { message: "Google did not provide a verified email." },
        { status: 400 },
      );
    }

    const nameParts = (profile.name ?? "").trim().split(/\s+/);
    const firstName = profile.given_name?.trim() || nameParts[0] || "Google";
    const lastName =
      profile.family_name?.trim() ||
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

    const user = localUpsertGoogleUser({
      email,
      firstName,
      lastName,
      imageUrl: profile.picture ?? null,
      googleId,
    });

    const response = NextResponse.json({ user });
    return applySessionCookie(response, user);
  } catch (error) {
    return jsonError(error, MESSAGES.googleFailed, 401);
  }
}
