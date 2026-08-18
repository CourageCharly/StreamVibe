import { NextRequest, NextResponse } from "next/server";
import {
  localResetPassword,
  localVerifyResetOtp,
} from "@/lib/auth/local-store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
      password?: string;
      verifyOnly?: boolean;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const code = body.code?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !code) {
      return NextResponse.json(
        { message: "Enter the 6-digit code we sent you." },
        { status: 400 },
      );
    }

    if (body.verifyOnly) {
      const ok = localVerifyResetOtp(email, code);
      if (!ok) {
        return NextResponse.json(
          { message: "That code is incorrect. Please try again." },
          { status: 400 },
        );
      }
      return NextResponse.json({ verified: true });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const ok = localResetPassword(email, code, password);
    if (!ok) {
      return NextResponse.json(
        { message: "That code is incorrect or has expired." },
        { status: 400 },
      );
    }
    return NextResponse.json({ reset: true });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { message: "Unable to reset your password. Please try again." },
      { status: 500 },
    );
  }
}
