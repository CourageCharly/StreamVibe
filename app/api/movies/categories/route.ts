import { NextResponse } from "next/server";
import { getMovieCategoriesMap } from "@/lib/services/catalog";

/**
 * GET /api/movies/categories
 *
 * Returns poster sets for homepage genre cards (Action, Adventure, …).
 */
export async function GET() {
  try {
    const data = await getMovieCategoriesMap();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[api/movies/categories]", error);
    return NextResponse.json(
      { error: "Failed to fetch movie categories" },
      { status: 500 },
    );
  }
}
