/**
 * StreamVibe public API client.
 * All app pages/components should load catalog data through these helpers.
 * They call the same services that power `/api/*` (no unused dual paths).
 */
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

/** GET /api/movies?category=&page= */
export async function fetchMovies(
  category: string = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  return getMovies(parseMovieCategory(category), page);
}

/** GET /api/shows?category=&page= */
export async function fetchShows(
  category: string = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  return getShows(parseShowCategory(category), page);
}

/** GET /api/movies/categories */
export async function fetchMovieCategories(
  limit = 4,
  /** TMDB pages per genre — use 1 on home for faster first paint */
  pages = 3,
): Promise<CategoriesMapResponse> {
  return getMovieCategoriesMap(limit, pages);
}

/** TV genre map for Shows “Our Genres” collages */
export async function fetchShowCategories(): Promise<CategoriesMapResponse> {
  return getShowCategoriesMap();
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
  return getTrailersForMovies(movies, limit);
}

/** Search movies by title */
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
