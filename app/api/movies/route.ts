import { NextRequest, NextResponse } from "next/server";
import { MOVIE_CATEGORY_KEYS, isMovieCategory } from "@/lib/constants";
import {
  getMovies,
  parseMovieCategory,
  parsePage,
  searchMovies,
} from "@/lib/services/catalog";

/**
 * GET /api/movies?category=...&page=1
 * GET /api/movies?q=search+term&page=1
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const page = parsePage(searchParams.get("page"));

  try {
    if (q) {
      const data = await searchMovies(q, page);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      });
    }

    const rawCategory = searchParams.get("category") ?? "popular";
    if (!isMovieCategory(rawCategory)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          available: Array.from(MOVIE_CATEGORY_KEYS),
        },
        { status: 400 },
      );
    }

    const data = await getMovies(parseMovieCategory(rawCategory), page);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[api/movies]", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}
