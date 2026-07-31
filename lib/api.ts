/**
 * StreamVibe public API client.
 * All app pages/components should load catalog data through these helpers.
 * They call the same services that power `/api/*` (no unused dual paths).
 */
import { unstable_cache } from "next/cache";
import {
  getMediaDetails,
  getMovieCategoriesMap,
  getMovieDetails,
  getMovies,
  getShowCategoriesMap,
  getShowDetails,
  getShows,
  getTrailersForMovies,
  parseMovieCategory,
  parseShowCategory,
  searchMovies,
} from "@/lib/services/catalog";
import type {
  CatalogListResponse,
  CategoriesMapResponse,
  Movie,
  MovieCategoryKey,
  MovieDetails,
  MovieVideo,
  ShowCategoryKey,
  TrailerClip,
} from "@/lib/types";

export type {
  CatalogListResponse,
  CategoriesMapResponse,
  Movie,
  MovieDetails,
  MovieVideo,
  TrailerClip,
};

/** Catalog cache TTL (seconds) — same data, faster repeated visits */
const CATALOG_REVALIDATE = 21600;

/** GET /api/movies?category=&page= */
export async function fetchMovies(
  category: string = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  const key = parseMovieCategory(category);
  return unstable_cache(
    () => getMovies(key, page),
    ["movies", key, String(page)],
    { revalidate: CATALOG_REVALIDATE },
  )();
}

/** GET /api/shows?category=&page= */
export async function fetchShows(
  category: string = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  const key = parseShowCategory(category);
  return unstable_cache(
    () => getShows(key, page),
    ["shows", key, String(page)],
    { revalidate: CATALOG_REVALIDATE },
  )();
}

/**
 * Genre collage map for movies.
 * Cached as one unit so Movies & Shows browse does not re-hit every genre on each visit.
 */
export async function fetchMovieCategories(
  limit = 4,
  pages = 3,
): Promise<CategoriesMapResponse> {
  return unstable_cache(
    () => getMovieCategoriesMap(limit, pages),
    ["movie-categories", String(limit), String(pages)],
    { revalidate: CATALOG_REVALIDATE },
  )();
}

/** TV genre map for Shows “Our Genres” collages */
export async function fetchShowCategories(
  limit = 4,
  pages = 3,
): Promise<CategoriesMapResponse> {
  return unstable_cache(
    () => getShowCategoriesMap(limit, pages),
    ["show-categories", String(limit), String(pages)],
    { revalidate: CATALOG_REVALIDATE },
  )();
}

/** Convenience: popular movies only */
export async function fetchPopularMovies(page = 1): Promise<Movie[]> {
  const { results } = await fetchMovies("popular", page);
  return results;
}

/** Convenience: trending movies only */
export async function fetchTrendingMovies(page = 1): Promise<Movie[]> {
  const { results } = await fetchMovies("trending", page);
  return results;
}

/** Muted hero trailers (YouTube keys) for a set of movies */
export async function fetchTrailers(
  movies: Movie[],
  limit = 8,
): Promise<TrailerClip[]> {
  const ids = movies
    .slice(0, Math.max(limit * 2, limit))
    .map((m) => m.id)
    .join(",");
  return unstable_cache(
    () => getTrailersForMovies(movies, limit),
    ["trailers", ids, String(limit)],
    { revalidate: CATALOG_REVALIDATE },
  )();
}

/** Search movies by title (not aggressively cached — query-specific) */
export async function fetchSearchMovies(
  query: string,
  page = 1,
): Promise<CatalogListResponse> {
  return searchMovies(query, page);
}

/** Full movie details for open/info page */
export async function fetchMovieDetails(
  id: number,
): Promise<MovieDetails | null> {
  return getMovieDetails(id);
}

/** Full TV show details with seasons/episodes from TMDB */
export async function fetchShowDetails(
  id: number,
): Promise<MovieDetails | null> {
  return getShowDetails(id);
}

/**
 * Movie or TV details for watch/detail.
 * Pass mediaType when known (avoids TMDB movie/TV id collisions).
 */
export async function fetchMediaDetails(
  id: number,
  mediaType?: "movie" | "tv",
): Promise<MovieDetails | null> {
  return getMediaDetails(id, mediaType);
}

export type { MovieCategoryKey, ShowCategoryKey };
