import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchMovieView from "@/components/WatchMovieView";
import { fetchPopularMovies, fetchShowDetails } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const show = await fetchShowDetails(Number(id));
  return {
    title: show?.title
      ? `Watch ${show.title} | StreamVibe`
      : "Watch | StreamVibe",
    description: show?.overview?.slice(0, 160) || "Watch on StreamVibe",
  };
}

/**
 * TV watch page — real seasons/episodes from TMDB + player + language/subtitles.
 */
export default async function WatchShowPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [show, popular] = await Promise.all([
    fetchShowDetails(id),
    fetchPopularMovies(),
  ]);

  if (!show) notFound();

  return <WatchMovieView movie={show} relatedPosters={popular} />;
}
