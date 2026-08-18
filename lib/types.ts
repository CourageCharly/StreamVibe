export type Movie = {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
};

export type MoviesResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export type MovieCategoryKey =
  | "action"
  | "adventure"
  | "comedy"
  | "drama"
  | "horror"
  | "thriller"
  | "romance"
  | "scifi"
  | "animation"
  | "crime"
  | "fantasy"
  | "family"
  | "trending"
  | "popular"
  | "top_rated"
  | "upcoming"
  | "now_playing";

export type ShowCategoryKey =
  | "trending"
  | "popular"
  | "top_rated"
  | "on_the_air"
  | "airing_today"
  /** Genre discovers (aligned with movie genre keys for shared UI links) */
  | "action"
  | "adventure"
  | "comedy"
  | "drama"
  | "horror"
  | "thriller"
  | "romance"
  | "scifi"
  | "animation"
  | "crime"
  | "fantasy"
  | "family";

export type Category = {
  key: MovieCategoryKey;
  name: string;
  genreId?: number;
  /** Internal TMDB path used only by the server service */
  tmdbPath: string;
};

/** Standard StreamVibe list response */
export type CatalogListResponse = {
  category: string;
  page: number;
  results: Movie[];
  count: number;
  total_pages: number;
  total_results: number;
  query?: string;
};

export type CategoriesMapResponse = {
  categories: Record<string, Movie[]>;
};

/** YouTube trailer clip for muted hero playback */
export type TrailerClip = {
  id: number;
  key: string;
  title: string;
};

/** Full movie detail for /movies/[id] open page */
export type MoviePerson = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path: string | null;
  department?: string;
};

export type MovieReview = {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  created_at?: string;
  avatar_path?: string | null;
  /** Display-only location label */
  location?: string;
  /** User reviews start pending until approved */
  status?: "pending" | "approved";
  mediaTitle?: string;
  mediaHref?: string;
  approveAt?: number;
};

/** YouTube video entry for watch / episode list */
export type MovieVideo = {
  key: string;
  name: string;
  type: string;
  site: string;
  official?: boolean;
};

/** Real TV episode from TMDB (seasonal titles only) */
export type ShowEpisode = {
  id: number;
  episodeNumber: number;
  title: string;
  overview: string;
  runtime: number | null;
  stillPath: string | null;
  /** YouTube key when available; falls back to show trailer on watch UI */
  videoKey?: string | null;
};

/** Real TV season from TMDB */
export type ShowSeason = {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes: ShowEpisode[];
};

/** Detected audio / subtitle language from TMDB */
export type MediaLanguage = {
  english_name: string;
  iso_639_1: string;
  /** Native name when available from translations API */
  name?: string;
};

export type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  runtime?: number | null;
  genres: { id: number; name: string }[];
  /** Spoken + translation languages from TMDB (Available Languages UI) */
  spoken_languages: MediaLanguage[];
  /** ISO 639-1 original language from API */
  original_language?: string | null;
  cast: MoviePerson[];
  crew: MoviePerson[];
  reviews: MovieReview[];
  trailerKey?: string | null;
  /** All YouTube videos for playback */
  videos?: MovieVideo[];
  /** movie = no episode list; tv = show Seasons and Episodes from API */
  mediaType?: "movie" | "tv";
  /** Populated only for seasonal (TV) titles */
  seasons?: ShowSeason[];
};

/** @deprecated use MovieCategoryKey */
export type CategoryKey = MovieCategoryKey;
