import { NextRequest, NextResponse } from "next/server";
import { SHOW_CATEGORY_KEYS, isShowCategory } from "@/lib/constants";
import { getShows, parsePage, parseShowCategory } from "@/lib/services/catalog";

/**
 * GET /api/shows?category=trending|popular|top_rated|on_the_air|airing_today&page=1
 *
 * StreamVibe TV shows catalog endpoint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCategory = searchParams.get("category") ?? "popular";
  const page = parsePage(searchParams.get("page"));

  if (!isShowCategory(rawCategory)) {
    return NextResponse.json(
      {
        error: "Invalid category",
        available: Array.from(SHOW_CATEGORY_KEYS),
      },
      { status: 400 },
    );
  }

  try {
    const data = await getShows(parseShowCategory(rawCategory), page);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[api/shows]", error);
    return NextResponse.json(
      { error: "Failed to fetch shows" },
      { status: 500 },
    );
  }
}
