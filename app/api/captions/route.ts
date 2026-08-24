import { NextRequest, NextResponse } from "next/server";
import { getYoutubeCaptions } from "@/lib/youtube-captions";

/**
 * GET /api/captions?videoId=&lang=
 * Timed cues for the Netflix-style watch overlay.
 */
export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId")?.trim() ?? "";
  const lang = request.nextUrl.searchParams.get("lang")?.trim() || "en";

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const data = await getYoutubeCaptions(videoId, lang);
    return NextResponse.json(
      { cues: data.cues, tracks: data.tracks },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("[api/captions]", error);
    return NextResponse.json({ cues: [], tracks: [] }, { status: 200 });
  }
}
