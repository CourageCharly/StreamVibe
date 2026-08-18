import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReviewWriteView from "@/components/ReviewWriteView";
import { fetchMovieDetails } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMovieDetails(Number(id));
  return {
    title: movie?.title
      ? `Review ${movie.title}`
      : "Add Your Review",
  };
}

export default async function MovieReviewPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const movie = await fetchMovieDetails(id);
  if (!movie) notFound();

  return (
    <ReviewWriteView
      mediaId={movie.id}
      mediaType="movie"
      title={movie.title}
      backHref={`/movies/${movie.id}`}
    />
  );
}
