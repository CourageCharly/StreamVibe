import PosterCard from "@/components/PosterCard";
import { cardImageUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";

type Props = {
  movie: Movie;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showLabel?: boolean;
  showOverlays?: boolean;
  interactive?: boolean;
  badge?: string;
};

/**
 * Movie-aware wrapper around PosterCard.
 * Catalog grids keep overlays off by default; hero collage enables them.
 */
export default function MoviePoster({
  movie,
  className = "",
  sizes = "(max-width: 768px) 50vw, 20vw",
  priority = false,
  showLabel = false,
  showOverlays = false,
  interactive = false,
  badge,
}: Props) {
  const title = movie.title || movie.name || "Movie";
  const imageUrl = cardImageUrl(movie, "w500");

  return (
    <PosterCard
      title={title}
      imageUrl={imageUrl}
      badge={badge}
      showLabel={showLabel}
      showOverlays={showOverlays}
      className={className}
      sizes={sizes}
      priority={priority}
      interactive={interactive}
    />
  );
}
