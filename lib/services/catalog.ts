/**
 * StreamVibe catalog service — single source of truth for movie/show data.
 * Used by API route handlers. App code should go through `@/lib/api`.
 */
import {
  CATEGORIES,
  MOVIE_LISTS,
  SHOW_CATEGORIES,
  isMovieCategory,
  isShowCategory,
} from "@/lib/constants";
import { tmdbGet, tmdbList } from "@/lib/tmdb";
import type {
  CatalogListResponse,
  CategoriesMapResponse,
  Movie,
  MovieCategoryKey,
  MovieDetails,
  MediaLanguage,
  MoviePerson,
  MovieReview,
  MovieVideo,
  ShowCategoryKey,
  ShowEpisode,
  ShowSeason,
  TrailerClip,
} from "@/lib/types";

type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  name?: string;
};

export async function getMovies(
  category: MovieCategoryKey = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  const list = MOVIE_LISTS.find((c) => c.key === category);
  if (!list) {
    return {
      category,
      page,
      results: [],
      count: 0,
      total_pages: 0,
      total_results: 0,
    };
  }

  const data = await tmdbList(list.tmdbPath, page);
  const results: Movie[] = (data?.results ?? []).map(normalizeMovie);

  return {
    category,
    page,
    results,
    count: results.length,
    total_pages: data?.total_pages ?? 0,
    total_results: data?.total_results ?? 0,
  };
}

function normalizeMovie(raw: Movie): Movie {
  return {
    ...raw,
    // TV results use `name`; movies use `title` — unify for cards/links
    title: raw.title || raw.name || "Untitled",
    name: raw.name || raw.title,
    vote_average:
      typeof raw.vote_average === "number" && !Number.isNaN(raw.vote_average)
        ? raw.vote_average
        : Number(raw.vote_average) || 0,
  };
}

export async function getShows(
  category: ShowCategoryKey = "popular",
  page = 1,
): Promise<CatalogListResponse> {
  const list = SHOW_CATEGORIES.find((c) => c.key === category);
  if (!list) {
    return {
      category,
      page,
      results: [],
      count: 0,
      total_pages: 0,
      total_results: 0,
    };
  }

  const data = await tmdbList(list.tmdbPath, page);
  const results: Movie[] = (data?.results ?? []).map(normalizeMovie);

  return {
    category,
    page,
    results,
    count: results.length,
    total_pages: data?.total_pages ?? 0,
    total_results: data?.total_results ?? 0,
  };
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<CatalogListResponse> {
  const q = query.trim();
  if (!q) {
    return {
      category: "search",
      page,
      results: [],
      count: 0,
      total_pages: 0,
      total_results: 0,
      query: q,
    };
  }

  const data = await tmdbList("/search/movie", page, { query: q });
  const results: Movie[] = (data?.results ?? []).map(normalizeMovie);
  // Prefer TMDB’s total for this query so the UI count stays accurate
  const totalResults = Number(data?.total_results);
  const totalPages = Number(data?.total_pages);

  return {
    category: "search",
    page: data?.page ?? page,
    results,
    count: results.length,
    total_pages: Number.isFinite(totalPages) ? totalPages : 0,
    total_results: Number.isFinite(totalResults) ? totalResults : results.length,
    query: q,
  };
}

/**
 * Ensure no two genre collages share the same title (by id or poster).
 * Round-robin across CATEGORIES so later genres (e.g. Drama) are not starved
 * by earlier ones (e.g. Comedy / Action) claiming the shared multi-genre hits.
 */
function diversifyGenreCollages(
  categories: Record<string, Movie[]>,
  limit: number,
): Record<string, Movie[]> {
  const usedIds = new Set<number>();
  const usedPosters = new Set<string>();
  const out: Record<string, Movie[]> = {};
  const cursors: Record<string, number> = {};

  for (const cat of CATEGORIES) {
    out[cat.key] = [];
    cursors[cat.key] = 0;
  }

  let progress = true;
  while (progress) {
    progress = false;
    for (const cat of CATEGORIES) {
      const picks = out[cat.key];
      if (picks.length >= limit) continue;

      const pool = categories[cat.key] ?? [];
      while (cursors[cat.key] < pool.length) {
        const m = pool[cursors[cat.key]++];
        if (!m?.poster_path) continue;
        if (usedIds.has(m.id)) continue;
        if (usedPosters.has(m.poster_path)) continue;

        picks.push(m);
        usedIds.add(m.id);
        usedPosters.add(m.poster_path);
        progress = true;
        break;
      }
    }
  }

  return out;
}

/** Merge several discover pages for a deep unique pool (de-dupe across genres). */
async function loadGenrePool(
  kind: "movie" | "show",
  key: string,
  pages = 3,
): Promise<Movie[]> {
  const load =
    kind === "movie"
      ? (page: number) => getMovies(key as MovieCategoryKey, page)
      : (page: number) => getShows(key as ShowCategoryKey, page);

  const results = await Promise.all(
    Array.from({ length: pages }, (_, i) => load(i + 1)),
  );
  const seen = new Set<number>();
  const merged: Movie[] = [];
  for (const page of results) {
    for (const m of page.results ?? []) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      merged.push(m);
    }
  }
  return merged;
}

export async function getMovieCategoriesMap(
  limit = 4,
  /** Discover pages per genre (1 = fastest home load) */
  pages = 3,
): Promise<CategoriesMapResponse> {
  // Multiple discover pages per genre so global de-dupe still fills 4 posters
  const entries = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const pool = await loadGenrePool("movie", cat.key, pages);
      return [cat.key, pool] as const;
    }),
  );

  const raw = Object.fromEntries(entries) as Record<string, Movie[]>;
  return {
    categories: diversifyGenreCollages(raw, limit),
  };
}

/**
 * TV genre collages for Our Genres (Shows tab) — real shows per genre, not movies.
 * Uses the same genre keys as CATEGORIES so UI links stay `/shows?category=action` etc.
 */
export async function getShowCategoriesMap(
  limit = 4,
  /** Discover pages per genre (1 = fastest Movies & Shows load) */
  pages = 3,
): Promise<CategoriesMapResponse> {
  const entries = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const pool = await loadGenrePool("show", cat.key, pages);
      return [cat.key, pool] as const;
    }),
  );

  const raw = Object.fromEntries(entries) as Record<string, Movie[]>;
  return {
    categories: diversifyGenreCollages(raw, limit),
  };
}

/** Resolve YouTube trailer keys for hero muted playback — stop once we have enough */
export async function getTrailersForMovies(
  movies: Movie[],
  limit = 8,
): Promise<TrailerClip[]> {
  const unique: TrailerClip[] = [];
  const seenKeys = new Set<string>();
  const BATCH = 4;

  for (let i = 0; i < movies.length && unique.length < limit; i += BATCH) {
    const batch = movies.slice(i, i + BATCH);
    const clips = await Promise.all(
      batch.map(async (movie) => {
        const data = await tmdbGet<{ results: TmdbVideo[] }>(
          `/movie/${movie.id}/videos`,
        );
        const videos = data?.results ?? [];
        const trailer =
          videos.find(
            (v) =>
              v.site === "YouTube" &&
              v.type === "Trailer" &&
              v.official !== false,
          ) ??
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
          videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ??
          videos.find((v) => v.site === "YouTube");

        if (!trailer?.key) return null;

        return {
          id: movie.id,
          key: trailer.key,
          title: movie.title || movie.name || "Trailer",
        } satisfies TrailerClip;
      }),
    );

    for (const clip of clips) {
      if (!clip || seenKeys.has(clip.key)) continue;
      seenKeys.add(clip.key);
      unique.push(clip);
      if (unique.length >= limit) break;
    }
  }

  return unique;
}

/** Stable friendly display name + “From {Country}” for review cards */
function friendlyReviewIdentity(seed: string, rawAuthor: string) {
  const FIRST_NAMES = [
    "John",
    "Sarah",
    "Michael",
    "Emma",
    "David",
    "Aisha",
    "James",
    "Priya",
    "Daniel",
    "Sofia",
    "Chris",
    "Maya",
    "Alex",
    "Olivia",
    "Ryan",
    "Nina",
  ] as const;
  const LOCATIONS = [
    "From USA",
    "From UK",
    "From India",
    "From Canada",
    "From Australia",
    "From Germany",
    "From France",
    "From Brazil",
    "From Japan",
    "From Nigeria",
    "From Spain",
    "From Mexico",
  ] as const;

  let hash = 0;
  const key = `${seed}:${rawAuthor}`;
  for (let i = 0; i < key.length; i++) {
    hash = (Math.imul(31, hash) + key.charCodeAt(i)) | 0;
  }
  const n = Math.abs(hash);
  return {
    name: FIRST_NAMES[n % FIRST_NAMES.length],
    location: LOCATIONS[n % LOCATIONS.length],
  };
}

/** Full movie details for the open/info page — single TMDB request via append_to_response */
export async function getMovieDetails(
  id: number,
): Promise<MovieDetails | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  type TmdbDetails = Movie & {
    runtime?: number;
    original_language?: string;
    genres?: { id: number; name: string }[];
    spoken_languages?: MediaLanguage[];
    credits?: Credits;
    reviews?: ReviewsPayload;
    videos?: { results: TmdbVideo[] };
    translations?: TranslationsPayload;
  };

  // One HTTP round-trip instead of 5 parallel calls
  const details = await tmdbGet<TmdbDetails>(
    `/movie/${id}?append_to_response=credits,reviews,videos,translations`,
  );

  if (!details) return null;

  const { cast, crew } = mapCredits(details.credits ?? null);
  const reviewList = mapReviews(details.reviews ?? null);
  const ytVideos = mapYtVideos(details.videos?.results);
  const trailer = pickTrailer(ytVideos);
  const languages = mergeLanguages(
    details.spoken_languages,
    details.translations?.translations,
    details.original_language,
  );

  return {
    id: details.id,
    title: details.title || details.name || "Untitled",
    overview: details.overview || "",
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    release_date: details.release_date,
    vote_average: details.vote_average ?? 0,
    runtime: details.runtime ?? null,
    genres: details.genres ?? [],
    spoken_languages: languages,
    original_language: details.original_language ?? null,
    cast,
    crew,
    reviews: reviewList,
    trailerKey: trailer?.key ?? null,
    videos: ytVideos,
    mediaType: "movie",
    seasons: undefined,
  };
}

type Credits = {
  cast?: {
    id: number;
    name: string;
    character?: string;
    profile_path: string | null;
    order?: number;
  }[];
  crew?: {
    id: number;
    name: string;
    job?: string;
    department?: string;
    profile_path: string | null;
  }[];
};

type ReviewsPayload = {
  results?: {
    id: string;
    author: string;
    content: string;
    author_details?: {
      rating?: number | null;
      avatar_path?: string | null;
      username?: string;
    };
    created_at?: string;
  }[];
};

function mapCredits(credits: Credits | null): {
  cast: MoviePerson[];
  crew: MoviePerson[];
} {
  const cast: MoviePerson[] = (credits?.cast ?? []).slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile_path: c.profile_path,
  }));
  const crew: MoviePerson[] = (credits?.crew ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    job: c.job,
    department: c.department,
    profile_path: c.profile_path,
  }));
  return { cast, crew };
}

function mapReviews(reviews: ReviewsPayload | null): MovieReview[] {
  return (reviews?.results ?? []).slice(0, 12).map((r, i) => {
    const rawAuthor = r.author || r.author_details?.username || "Viewer";
    const identity = friendlyReviewIdentity(r.id || String(i), rawAuthor);
    return {
      id: r.id,
      author: identity.name,
      content: r.content,
      rating:
        typeof r.author_details?.rating === "number"
          ? r.author_details.rating
          : null,
      created_at: r.created_at,
      avatar_path: r.author_details?.avatar_path ?? null,
      location: identity.location,
    };
  });
}

function mapYtVideos(results: TmdbVideo[] | undefined): MovieVideo[] {
  return (results ?? [])
    .filter((v) => v.site === "YouTube" && v.key)
    .map((v) => ({
      key: v.key,
      name: v.name || v.type || "Video",
      type: v.type || "Video",
      site: v.site,
      official: v.official,
    }));
}

function pickTrailer(ytVideos: MovieVideo[]): MovieVideo | undefined {
  return (
    ytVideos.find((v) => v.type === "Trailer" && v.official !== false) ??
    ytVideos.find((v) => v.type === "Trailer") ??
    ytVideos.find((v) => v.type === "Teaser") ??
    ytVideos[0]
  );
}

type TmdbTranslation = {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  english_name?: string;
};

type TranslationsPayload = {
  translations?: TmdbTranslation[];
};

/** Merge spoken_languages + translations + original_language from TMDB. */
function mergeLanguages(
  spoken: MediaLanguage[] | undefined,
  translations: TmdbTranslation[] | undefined,
  originalLanguage?: string | null,
): MediaLanguage[] {
  const map = new Map<string, MediaLanguage>();

  const add = (iso: string | undefined, english: string | undefined, native?: string) => {
    const code = (iso || "").trim().toLowerCase();
    if (!code || code === "xx") return;
    const english_name = (english || native || code).trim();
    if (!english_name) return;
    if (!map.has(code)) {
      map.set(code, {
        iso_639_1: code,
        english_name,
        name: native || undefined,
      });
    }
  };

  for (const s of spoken ?? []) {
    add(s.iso_639_1, s.english_name, s.name);
  }
  for (const t of translations ?? []) {
    add(t.iso_639_1, t.english_name, t.name);
  }
  if (originalLanguage) {
    add(originalLanguage, undefined, undefined);
  }

  // Prefer English first when present, then alpha by name
  const list = [...map.values()];
  list.sort((a, b) => {
    if (a.iso_639_1 === "en") return -1;
    if (b.iso_639_1 === "en") return 1;
    return a.english_name.localeCompare(b.english_name);
  });

  return list.length
    ? list
    : [{ iso_639_1: "en", english_name: "English" }];
}

/**
 * TV show details with real seasons/episodes from TMDB.
 * Fast path: 1 detail request + 1 season request per season (no per-episode video calls).
 */
export async function getShowDetails(
  id: number,
): Promise<MovieDetails | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  type TmdbTv = {
    id: number;
    name?: string;
    title?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date?: string;
    vote_average?: number;
    original_language?: string;
    episode_run_time?: number[];
    genres?: { id: number; name: string }[];
    spoken_languages?: MediaLanguage[];
    created_by?: {
      id: number;
      name: string;
      profile_path: string | null;
    }[];
    seasons?: {
      id: number;
      name: string;
      season_number: number;
      episode_count: number;
    }[];
    credits?: Credits;
    reviews?: ReviewsPayload;
    videos?: { results: TmdbVideo[] };
    translations?: TranslationsPayload;
  };

  type SeasonPayload = {
    id: number;
    name: string;
    season_number: number;
    episodes?: {
      id: number;
      name: string;
      overview: string;
      episode_number: number;
      runtime: number | null;
      still_path: string | null;
    }[];
  };

  // One HTTP round-trip for show + credits + reviews + videos + translations
  const details = await tmdbGet<TmdbTv>(
    `/tv/${id}?append_to_response=credits,reviews,videos,translations`,
  );

  if (!details) return null;

  const { cast, crew: creditCrew } = mapCredits(details.credits ?? null);
  // Prefer creators (usually have profile images) as Director for TV
  const creators: MoviePerson[] = (details.created_by ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    job: "Director",
    department: "Directing",
    profile_path: c.profile_path,
  }));
  const crew: MoviePerson[] = [
    ...creators,
    ...creditCrew.filter((c) => !creators.some((x) => x.id === c.id)),
  ];

  const reviewList = mapReviews(details.reviews ?? null);
  const ytVideos = mapYtVideos(details.videos?.results);
  const trailer = pickTrailer(ytVideos);
  const trailerKey = trailer?.key ?? null;
  const playableKeys = ytVideos.map((v) => v.key).filter(Boolean);
  const languages = mergeLanguages(
    details.spoken_languages,
    details.translations?.translations,
    details.original_language,
  );

  const seriesDefaultRuntime =
    details.episode_run_time?.find((n) => typeof n === "number" && n > 0) ??
    null;

  // Real seasons only (skip season 0 specials). Cap for fast TTFB.
  const seasonMeta = (details.seasons ?? [])
    .filter((s) => s.season_number > 0 && (s.episode_count ?? 0) > 0)
    .slice(0, 8);

  // Parallel season payloads only — no per-episode video network calls
  const seasonDetails = await Promise.all(
    seasonMeta.map((s) =>
      tmdbGet<SeasonPayload>(`/tv/${id}/season/${s.season_number}`),
    ),
  );

  const seasons: ShowSeason[] = seasonMeta.map((meta, i) => {
    const full = seasonDetails[i];
    const rawEps = full?.episodes ?? [];

    const knownRuntimes = rawEps
      .map((e) => e.runtime)
      .filter((n): n is number => typeof n === "number" && n > 0);
    const seasonAvgRuntime =
      knownRuntimes.length > 0
        ? Math.round(
            knownRuntimes.reduce((a, b) => a + b, 0) / knownRuntimes.length,
          )
        : seriesDefaultRuntime;

    const episodes: ShowEpisode[] = rawEps.map((ep, epIndex) => {
      // Playable without extra API: rotate show trailers/clips
      const videoKey =
        (playableKeys.length > 0
          ? playableKeys[epIndex % playableKeys.length]
          : null) ?? trailerKey;

      const runtime =
        typeof ep.runtime === "number" && ep.runtime > 0
          ? ep.runtime
          : seasonAvgRuntime;

      return {
        id: ep.id,
        episodeNumber: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        overview: ep.overview || "",
        runtime,
        stillPath: ep.still_path,
        videoKey: videoKey || null,
      };
    });

    return {
      id: meta.id,
      seasonNumber: meta.season_number,
      name:
        meta.name || `Season ${String(meta.season_number).padStart(2, "0")}`,
      episodeCount: episodes.length || meta.episode_count,
      episodes,
    };
  });

  return {
    id: details.id,
    title: details.name || details.title || "Untitled",
    overview: details.overview || "",
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    release_date: details.first_air_date,
    vote_average: details.vote_average ?? 0,
    runtime: seriesDefaultRuntime,
    genres: details.genres ?? [],
    spoken_languages: languages,
    original_language: details.original_language ?? null,
    cast,
    crew,
    reviews: reviewList,
    trailerKey,
    videos: ytVideos,
    mediaType: "tv",
    seasons,
  };
}

/**
 * Resolve title for detail/watch: movie first, then TV (seasonal).
 * Movie and TV IDs can collide — prefer explicit mediaType when known.
 */
export async function getMediaDetails(
  id: number,
  preferred?: "movie" | "tv",
): Promise<MovieDetails | null> {
  if (preferred === "tv") return getShowDetails(id);
  if (preferred === "movie") return getMovieDetails(id);

  const movie = await getMovieDetails(id);
  if (movie) return movie;
  return getShowDetails(id);
}

export function parseMovieCategory(
  value: string | null | undefined,
  fallback: MovieCategoryKey = "popular",
): MovieCategoryKey {
  if (value && isMovieCategory(value)) return value;
  return fallback;
}

export function parseShowCategory(
  value: string | null | undefined,
  fallback: ShowCategoryKey = "popular",
): ShowCategoryKey {
  if (value && isShowCategory(value)) return value;
  return fallback;
}

export function parsePage(value: string | null | undefined): number {
  const n = Number(value ?? "1");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
