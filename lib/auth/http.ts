import { NextResponse } from "next/server";
import { AuthServiceError } from "./service";

export function jsonError(error: unknown, fallback: string, status = 400) {
  if (error instanceof AuthServiceError) {
    return NextResponse.json(
      {
        message: error.message,
        fieldErrors: error.fieldErrors,
        requiresVerification: error.requiresVerification,
        email: error.email,
      },
      { status: error.status },
    );
  }
  console.error("[auth]", error);
  return NextResponse.json({ message: fallback }, { status });
}
