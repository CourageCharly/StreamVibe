import { NextRequest, NextResponse } from "next/server";
import { getShowDetails } from "@/lib/services/catalog";

/**
 * GET /api/shows/:id — full TV show details with seasons/episodes
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await context.params;
  const id = Number(raw);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await getShowDetails(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[api/shows/id]", error);
    return NextResponse.json(
      { error: "Failed to fetch show" },
      { status: 500 },
    );
  }
}
