import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { MESSAGES } from "@/lib/auth/errors";
import { readSessionToken } from "@/lib/auth/session";

/**
 * POST /api/reviews — persist a user review for a title.
 * Reviews are associated with the authenticated user and media id.
 */
export async function POST(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json(
      { message: "Log in to share your review." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      mediaId?: number;
      mediaType?: "movie" | "tv";
      rating?: number;
      content?: string;
    };

    const mediaId = Number(body.mediaId);
    const rating = Number(body.rating);
    const content = body.content?.trim() ?? "";

    if (!Number.isFinite(mediaId) || mediaId <= 0) {
      return NextResponse.json(
        { message: MESSAGES.reviewFailed },
        { status: 400 },
      );
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          message: MESSAGES.reviewFailed,
          fieldErrors: { rating: "Please choose a rating." },
        },
        { status: 400 },
      );
    }
    if (content.length < 10) {
      return NextResponse.json(
        {
          message: MESSAGES.reviewFailed,
          fieldErrors: { content: "Please write a bit more about this title." },
        },
        { status: 400 },
      );
    }

    const review = {
      id: `user-${session.userId}-${mediaId}-${Date.now()}`,
      author:
        [session.firstName, session.lastName].filter(Boolean).join(" ") ||
        session.email.split("@")[0],
      content,
      rating: rating * 2,
      created_at: new Date().toISOString(),
      location: "You",
      status: "pending" as const,
    };

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ message: MESSAGES.reviewFailed }, { status: 500 });
  }
}
