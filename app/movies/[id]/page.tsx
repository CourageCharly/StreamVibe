import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import MovieDetailView from "@/components/MovieDetailView";
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
    title: movie?.title ? `${movie.title} | StreamVibe` : "Movie | StreamVibe",
    description: movie?.overview?.slice(0, 160) || "Watch on StreamVibe",
  };
}

/**
 * Movie open/info page — design: Movies Page Open - Laptop.png
 * If this TMDB id is only a TV show (common ID collision), send users to /shows/[id].
 */
export default async function MovieDetailPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [movie, popular] = await Promise.all([
    fetchMovieDetails(id),
    fetchPopularMovies(),
  ]);

  if (!movie) {
    // TV ids can look like movie ids — redirect to the show route
    const show = await fetchShowDetails(id);
    if (show) redirect(`/shows/${id}`);
    notFound();
  }

  return <MovieDetailView movie={movie} relatedPosters={popular} />;
}
