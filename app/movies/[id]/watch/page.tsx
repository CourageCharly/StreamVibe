import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import WatchMovieView from "@/components/WatchMovieView";
import {
  fetchMovieDetails,
  fetchPopularMovies,
  fetchShowDetails,
} from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMovieDetails(Number(id));
  return {
    title: movie?.title
      ? `Watch ${movie.title} | StreamVibe`
      : "Watch | StreamVibe",
    description: movie?.overview?.slice(0, 160) || "Watch on StreamVibe",
  };
}

/**
 * Watch / play screen — design: Watch Movie - Laptop.png
 * TV ids opened under /movies are redirected to /shows/[id]/watch.
 */
export default async function WatchMoviePage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [movie, popular] = await Promise.all([
    fetchMovieDetails(id),
    fetchPopularMovies(),
  ]);

  if (!movie) {
    const show = await fetchShowDetails(id);
    if (show) redirect(`/shows/${id}/watch`);
    notFound();
  }

  return <WatchMovieView movie={movie} relatedPosters={popular} />;
}
