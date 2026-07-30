import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailView from "@/components/MovieDetailView";
import { fetchPopularMovies, fetchShowDetails } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const show = await fetchShowDetails(Number(id));
  return {
    title: show?.title ? `${show.title} | StreamVibe` : "Show | StreamVibe",
    description: show?.overview?.slice(0, 160) || "Watch on StreamVibe",
  };
}

/**
 * TV show open/info page — same idea as movie detail:
 * Description, Cast, Reviews + meta sidebar only.
 * Play Now → /shows/[id]/watch for episodes.
 */
export default async function ShowDetailPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [show, popular] = await Promise.all([
    fetchShowDetails(id),
    fetchPopularMovies(),
  ]);

  if (!show) notFound();

  // Shared MovieDetailView: info only (no episode list); watch route handles seasons
  return <MovieDetailView movie={show} relatedPosters={popular} />;
}
