const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500",
) {
  if (!path) return null;
  // Absolute URL (or TMDB avatar "/https://...")
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/http://") || path.startsWith("/https://")) {
    return path.slice(1);
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${IMAGE_BASE}/${size}${normalized}`;
}

export function backdropUrl(
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "w1280",
) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${IMAGE_BASE}/${size}${normalized}`;
}

/** Cast / director / crew profile image from TMDB profile_path */
export function profileUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" = "w185",
) {
  return posterUrl(path, size);
}

/** Poster first, then backdrop — so cards still show art when TMDB has no poster. */
export function cardImageUrl(
  movie: {
    poster_path?: string | null;
    backdrop_path?: string | null;
  },
  posterSize: "w185" | "w342" | "w500" | "w780" | "original" = "w342",
) {
  return (
    posterUrl(movie.poster_path, posterSize) ??
    backdropUrl(movie.backdrop_path, "w780")
  );
}

/** Always return `count` tiles, cycling titles that have artwork. */
export function fillPosterCollage<
  T extends { poster_path?: string | null; backdrop_path?: string | null },
>(movies: T[], count = 4): T[] {
  const withArt = movies.filter((m) => m.poster_path || m.backdrop_path);
  if (!withArt.length) return movies.slice(0, count);
  const out: T[] = [];
  for (let i = 0; out.length < count; i++) {
    out.push(withArt[i % withArt.length]);
  }
  return out;
}
