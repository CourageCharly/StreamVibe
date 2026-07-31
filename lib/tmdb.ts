/**
 * Private TMDB provider — server-only.
 * Credentials come exclusively from `.env.local`.
 * App code must use `@/lib/api`, not this module.
 *
 * Network / DNS failures (e.g. getaddrinfo EAI_AGAIN) never throw —
 * they return null after retries so pages can render empty states.
 */
import { cache } from "react";
import type { MoviesResponse } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 400;
/** Shared Data Cache TTL for TMDB (seconds) */
const TMDB_REVALIDATE = 21600;

/**
 * Reads the two credentials from `.env.local`:
 * - NEXT_PUBLIC_TMDB_TOKEN  (Bearer read-access token)
 * - NEXT_PUBLIC_TMDB_API_KEY (optional API key fallback)
 */
function getCredentials() {
  const token = process.env.NEXT_PUBLIC_TMDB_TOKEN?.trim() ?? "";
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim() ?? "";
  return { token, apiKey };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { cause?: { code?: string }; code?: string; message?: string };
  const code = e.cause?.code || e.code || "";
  const msg = String(e.message || e.cause || "");
  return (
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    msg.includes("fetch failed") ||
    msg.includes("EAI_AGAIN") ||
    msg.includes("ENOTFOUND")
  );
}

/**
 * Per-request dedupe (stable string key) + Next Data Cache (revalidate).
 */
const tmdbGetByKey = cache(async function tmdbGetByKey(
  cacheKey: string,
): Promise<unknown> {
  const { pathWithQuery, extraParams } = JSON.parse(cacheKey) as {
    pathWithQuery: string;
    extraParams?: Record<string, string>;
  };

  const { token, apiKey } = getCredentials();

  if (!token && !apiKey) {
    console.warn(
      "[tmdb] Missing credentials in .env.local (NEXT_PUBLIC_TMDB_TOKEN / NEXT_PUBLIC_TMDB_API_KEY)",
    );
    return null;
  }

  const [pathname, query = ""] = pathWithQuery.split("?");
  const url = new URL(
    `${TMDB_BASE}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
  );

  url.searchParams.set("language", "en-US");

  if (query) {
    new URLSearchParams(query).forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  if (!token && apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  const headers: HeadersInit = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers,
        next: { revalidate: TMDB_REVALIDATE },
      });

      if (!res.ok) {
        console.error(`[tmdb] ${res.status} ${pathname}`);
        return null;
      }

      return await res.json();
    } catch (err) {
      lastError = err;
      const transient = isTransientNetworkError(err);
      console.error(
        `[tmdb] fetch failed (${pathname}) attempt ${attempt}/${MAX_ATTEMPTS}`,
        err,
      );
      if (!transient || attempt === MAX_ATTEMPTS) {
        break;
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  console.error(`[tmdb] giving up on ${pathname}`, lastError);
  return null;
});

export async function tmdbGet<T>(
  pathWithQuery: string,
  extraParams?: Record<string, string>,
): Promise<T | null> {
  const cacheKey = JSON.stringify({
    pathWithQuery,
    extraParams: extraParams
      ? Object.fromEntries(
          Object.keys(extraParams)
            .sort()
            .map((k) => [k, extraParams[k]]),
        )
      : undefined,
  });
  return (await tmdbGetByKey(cacheKey)) as T | null;
}

export async function tmdbList(
  pathWithQuery: string,
  page = 1,
  extraParams?: Record<string, string>,
): Promise<MoviesResponse | null> {
  return tmdbGet<MoviesResponse>(pathWithQuery, {
    page: String(page),
    ...extraParams,
  });
}
