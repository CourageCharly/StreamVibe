"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiChevronDown,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { backdropUrl, profileUrl } from "@/lib/media";
import type {
  Movie,
  MovieDetails,
  MoviePerson,
  ShowEpisode,
  ShowSeason,
} from "@/lib/types";
import Button from "@/components/ui/Button";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import BackLink from "@/components/BackLink";
import ReviewsSection from "@/components/ReviewsSection";
import SeasonsAndEpisodes from "@/components/SeasonsAndEpisodes";
import WatchPlayer, { type CaptionTrack } from "@/components/WatchPlayer";
import AuthPrompt from "@/components/auth/AuthPrompt";
import { useAuth } from "@/components/auth/AuthProvider";
import { rememberReturnTo } from "@/lib/auth/return-to";
import { useIsMobile } from "@/lib/use-mobile";
import { useRouter } from "next/navigation";
import {
  addWatchHistory,
  getLikes,
  getMyList,
  toggleLike,
  toggleMyList,
} from "@/lib/user-lists";

type Props = {
  movie: MovieDetails;
  relatedPosters?: Movie[];
};

type Playable = {
  id: string;
  title: string;
  videoKey: string;
};

function PersonAvatar({
  path,
  name,
}: {
  path: string | null | undefined;
  name: string;
}) {
  const src = profileUrl(path, "w185");
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="44px"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#999999]">
          {(name || "?").slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  const stars = Math.min(max, Math.max(0, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={i < stars ? "/Icons/Star.svg" : "/Icons/Empty Star.svg"}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5"
          aria-hidden
        />
      ))}
      <span className="ml-1 text-xs font-medium text-white">{value.toFixed(1)}</span>
    </span>
  );
}

function InfoCard({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
      {title || action ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
          {title ? (
            <h2 className="text-[13px] font-medium text-[#999999] sm:text-[14px]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function FieldLabel({
  iconSrc,
  icon: Icon,
  children,
}: {
  iconSrc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#999999]">
      {iconSrc ? (
        <span
          className="block h-4 w-4 shrink-0 bg-[#999999]"
          style={{
            maskImage: `url("${iconSrc}")`,
            WebkitMaskImage: `url("${iconSrc}")`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          aria-hidden
        />
      ) : Icon ? (
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#999999]" />
      ) : null}
      {children}
    </div>
  );
}

const arrowBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#999999] transition hover:text-white sm:h-10 sm:w-10";

const pillClass =
  "rounded-md border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs font-medium text-[#999999]";
const innerCardClass =
  "flex items-center gap-3 rounded-lg border border-[#262626] bg-[#141414] p-3";

/** Best playable YouTube key from API (trailer preferred). */
function resolvePlayKey(movie: MovieDetails): string | null {
  if (movie.trailerKey) return movie.trailerKey;
  const videos = movie.videos ?? [];
  const preferred =
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser") ??
    videos[0];
  return preferred?.key ?? null;
}

function CastRow({
  cast,
  scrollRef,
}: {
  cast: MoviePerson[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!cast.length) {
    return (
      <p className="text-[13px] text-[#999999]">Cast information unavailable.</p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {cast.map((person) => {
        const src = profileUrl(person.profile_path);
        return (
          <div
            key={`${person.id}-${person.character}`}
            className="w-[72px] shrink-0 text-center"
          >
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-[#262626] bg-[#141414]">
              {src ? (
                <Image
                  src={src}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#666]">
                  {person.name.slice(0, 1)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-[11px] font-medium text-white">
              {person.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CastSection({ cast }: { cast: MoviePerson[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <InfoCard
      title="Cast"
      action={
        cast.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className={arrowBtnClass}
              aria-label="Previous cast"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className={arrowBtnClass}
              aria-label="Next cast"
            >
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null
      }
    >
      <CastRow cast={cast} scrollRef={ref} />
    </InfoCard>
  );
}

/**
 * Watch page — design: Watch Movie - Laptop.png
 * Movies: auto-starts full player with API video (no episode list).
 * TV: Seasons and Episodes at top, description below.
 * Reviews: shared ReviewsBlock (arrows) — same as detail page.
 */
export default function WatchMovieView({ movie, relatedPosters = [] }: Props) {
  const isSeasonal =
    movie.mediaType === "tv" &&
    Array.isArray(movie.seasons) &&
    movie.seasons.some((s) => s.episodes.length > 0);

  const playKey = useMemo(() => resolvePlayKey(movie), [movie]);

  /** Shows start on episode 1 the same way movies start on the title. */
  const firstEpisodePlayable = useMemo(() => {
    if (!isSeasonal || !movie.seasons) return null;
    for (const season of movie.seasons) {
      for (const ep of season.episodes) {
        const key = ep.videoKey || playKey;
        if (!key) continue;
        return {
          id: `s${season.seasonNumber}e${ep.episodeNumber}`,
          title: ep.title,
          videoKey: key,
        };
      }
    }
    return null;
  }, [isSeasonal, movie.seasons, playKey]);

  const defaultPlayable: Playable | null = firstEpisodePlayable
    ? firstEpisodePlayable
    : playKey
      ? { id: "main", title: movie.title, videoKey: playKey }
      : null;

  const { status } = useAuth();
  const canPlay = status === "authenticated";
  const [authOpen, setAuthOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  // Watch route is the play screen — start on the player, not the static hero
  const [playing, setPlaying] = useState(() => Boolean(playKey));
  const [active, setActive] = useState<Playable | null>(defaultPlayable);
  // Start muted so browser autoplay policies allow the movie to start
  const [muted, setMuted] = useState(true);
  // Subtitles on by default (web + mobile + full view)
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [myList, setMyList] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  /** Mobile: expand player to full-viewport view */
  const [fullView, setFullView] = useState(false);
  const playerShellRef = useRef<HTMLElement | null>(null);
  /** Caption tracks discovered from the playing video (preferred language list) */
  const [captionTracks, setCaptionTracks] = useState<CaptionTrack[]>([]);
  /** Compact language menu (scrollable when list is long) */
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const spokenLanguages = useMemo(
    () =>
      movie.spoken_languages.length
        ? movie.spoken_languages
        : [{ english_name: "English", iso_639_1: "en" }],
    [movie.spoken_languages],
  );

  /**
   * Player language menu = subtitle tracks that actually exist on this video.
   * Never list TMDB spoken languages or auto-translate guesses.
   */
  const languages = useMemo(() => {
    const original = (movie.original_language || "").toLowerCase().slice(0, 2);
    const byKey = new Map<
      string,
      { iso_639_1: string; english_name: string }
    >();
    for (const t of captionTracks) {
      if (!t.languageCode || t.translation) continue;
      const key = t.languageCode.toLowerCase().slice(0, 2);
      if (!key || byKey.has(key)) continue;
      byKey.set(key, {
        iso_639_1: t.languageCode,
        english_name: t.languageName || t.languageCode.toUpperCase(),
      });
    }
    const list = [...byKey.values()];
    list.sort((a, b) => {
      const ak = a.iso_639_1.toLowerCase().slice(0, 2);
      const bk = b.iso_639_1.toLowerCase().slice(0, 2);
      if (ak === "en") return -1;
      if (bk === "en") return 1;
      if (original && ak === original) return -1;
      if (original && bk === original) return 1;
      return a.english_name.localeCompare(b.english_name);
    });
    if (!list.length) {
      return [{ iso_639_1: "en", english_name: "English" }];
    }
    return list;
  }, [captionTracks, movie.original_language]);

  const handleCaptionTracks = useCallback((tracks: CaptionTrack[]) => {
    setCaptionTracks((prev) => {
      const byKey = new Map<string, CaptionTrack>();
      for (const t of [...prev, ...tracks]) {
        const key = (t.languageCode || "").toLowerCase().slice(0, 2);
        if (!key) continue;
        const cur = byKey.get(key);
        if (!cur || (cur.translation && !t.translation)) {
          byKey.set(key, t);
        } else if (cur && !cur.languageName && t.languageName) {
          byKey.set(key, { ...cur, languageName: t.languageName });
        }
      }
      return [...byKey.values()];
    });
  }, []);

  const defaultLang =
    movie.original_language ||
    spokenLanguages.find((l) => l.iso_639_1 === "en")?.iso_639_1 ||
    spokenLanguages[0]?.iso_639_1 ||
    "en";
  const [subtitleLang, setSubtitleLang] = useState(defaultLang);

  /** Keep <select> value valid when options swap (spoken ↔ caption tracks) */
  const languageSelectValue = useMemo(() => {
    const codes = languages
      .map((l) => l.iso_639_1)
      .filter((c): c is string => Boolean(c));
    if (codes.includes(subtitleLang)) return subtitleLang;
    const match = codes.find(
      (c) =>
        c.startsWith(subtitleLang) ||
        subtitleLang.startsWith(c.slice(0, 2)),
    );
    return match || codes[0] || "en";
  }, [languages, subtitleLang]);

  /** Streaming standard: pick language → turn CC on + apply that subtitle track */
  const onLanguageChange = useCallback((code: string) => {
    setSubtitleLang(code);
    setSubtitlesOn(true);
  }, []);

  useEffect(() => {
    setHydrated(true);
    setMyList(getMyList());
    setLikes(getLikes());
  }, []);

  // Resume the last clip on refresh (same title / episode), then play
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(
        `streamvibe:watch-active:${movie.mediaType}:${movie.id}`,
      );
      if (!raw) return;
      const saved = JSON.parse(raw) as Playable;
      if (saved?.videoKey && saved.id) setActive(saved);
    } catch {
      /* ignore */
    }
  }, [movie.id, movie.mediaType]);

  useEffect(() => {
    if (!playing || !active?.videoKey || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        `streamvibe:watch-active:${movie.mediaType}:${movie.id}`,
        JSON.stringify(active),
      );
    } catch {
      /* ignore */
    }
  }, [playing, active, movie.id, movie.mediaType]);

  // Keep the player up after auth; guests still get the login gate
  useEffect(() => {
    if (!playKey && !firstEpisodePlayable) return;
    if (status === "loading") return;
    const watchPath = `${movie.mediaType === "tv" ? "/shows" : "/movies"}/${movie.id}/watch`;
    if (!canPlay) {
      setPlaying(false);
      rememberReturnTo(watchPath);
      if (isMobile) {
        router.replace(`/auth?returnTo=${encodeURIComponent(watchPath)}`);
        return;
      }
      setAuthOpen(true);
      return;
    }
    setPlaying(true);
    if (!active?.videoKey) {
      setActive(
        firstEpisodePlayable ?? {
          id: "main",
          title: movie.title,
          videoKey: playKey as string,
        },
      );
    }
    addWatchHistory({
      id: movie.id,
      title: movie.title,
      path: watchPath,
    });
  }, [
    playKey,
    firstEpisodePlayable,
    movie.title,
    movie.id,
    movie.mediaType,
    canPlay,
    status,
    isMobile,
    router,
    active?.videoKey,
  ]);

  useEffect(() => {
    setSubtitleLang(defaultLang);
    setCaptionTracks([]);
  }, [defaultLang, movie.id]);

  useEffect(() => {
    setCaptionTracks([]);
  }, [active?.videoKey]);

  // Keep the selected language on a track that actually exists for this video
  useEffect(() => {
    if (!languages.length) return;
    const has = languages.some((l) => {
      const code = l.iso_639_1 || "";
      if (!code) return false;
      return (
        code === subtitleLang ||
        code.startsWith(subtitleLang) ||
        (subtitleLang.length >= 2 &&
          code.startsWith(subtitleLang.slice(0, 2)))
      );
    });
    if (!has && languages[0]?.iso_639_1) {
      setSubtitleLang(languages[0].iso_639_1);
    }
  }, [languages, subtitleLang]);

  // Exit full view when playback stops
  useEffect(() => {
    if (!playing) setFullView(false);
  }, [playing]);

  // Close language menu on outside click / Escape
  useEffect(() => {
    if (!langMenuOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = langMenuRef.current;
      if (el && !el.contains(e.target as Node)) setLangMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [langMenuOpen]);

  // Close language menu when player stops or title changes
  useEffect(() => {
    setLangMenuOpen(false);
  }, [playing, movie.id, active?.id]);

  // Lock body scroll while mobile full view is open
  useEffect(() => {
    if (!fullView) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullView]);

  /**
   * Mobile full view: size the player to the real visual viewport so it
   * adapts to every phone (notch, browser chrome, rotation, small/large).
   */
  useEffect(() => {
    if (!fullView) return;
    const el = playerShellRef.current;
    if (!el) return;

    const clearFsLayout = () => {
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.right = "";
      el.style.bottom = "";
      el.style.width = "";
      el.style.height = "";
      el.style.maxWidth = "";
      el.style.maxHeight = "";
      el.style.margin = "";
      el.style.borderRadius = "";
      el.style.zIndex = "";
    };

    const apply = () => {
      if (document.fullscreenElement === el) {
        clearFsLayout();
        return;
      }
      const vv = window.visualViewport;
      const w = Math.max(1, Math.round(vv?.width ?? window.innerWidth));
      const h = Math.max(1, Math.round(vv?.height ?? window.innerHeight));
      const top = Math.round(vv?.offsetTop ?? 0);
      const left = Math.round(vv?.offsetLeft ?? 0);
      el.style.position = "fixed";
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.maxWidth = `${w}px`;
      el.style.maxHeight = `${h}px`;
      el.style.margin = "0";
      el.style.borderRadius = "0";
      el.style.zIndex = "200";
    };

    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      clearFsLayout();
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, [fullView]);

  // Sync when user exits native fullscreen via system UI
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setFullView(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullView = useCallback(async () => {
    const el = playerShellRef.current as
      | (HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        })
      | null;

    if (!fullView && el) {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      } catch {
        /* CSS full view still works */
      }
      setFullView(true);
      return;
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
    setFullView(false);
  }, [fullView]);

  const isShow = movie.mediaType === "tv";
  const basePath = isShow ? "/shows" : "/movies";

  const inList = hydrated && myList.includes(movie.id);
  const liked = hydrated && likes.includes(movie.id);
  const bg = backdropUrl(movie.backdrop_path, "w1280");
  const year = movie.release_date?.slice(0, 4) || "—";
  const withPhoto = (c: MoviePerson) => Boolean(c.profile_path);
  const director =
    movie.crew.find((c) => c.job === "Director" && withPhoto(c)) ??
    movie.crew.find((c) => c.job === "Director") ??
    movie.crew.find((c) => c.job === "Executive Producer" && withPhoto(c)) ??
    movie.crew.find((c) => c.job === "Executive Producer") ??
    movie.crew.find(withPhoto) ??
    movie.crew[0] ??
    null;
  const music =
    movie.crew.find(
      (c) =>
        (c.job === "Original Music Composer" ||
          c.job === "Music" ||
          c.job === "Composer") &&
        withPhoto(c),
    ) ??
    movie.crew.find(
      (c) =>
        c.job === "Original Music Composer" ||
        c.job === "Music" ||
        c.job === "Composer",
    ) ??
    null;
  const streamRating = Math.min(5, Math.max(1, Math.round(movie.vote_average) / 2));
  const imdbRating = Math.min(5, Math.max(1, movie.vote_average / 2));

  const actionBtn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#0F0F0F] text-white transition hover:border-[#404040] sm:h-12 sm:w-12";

  const IconMask = useCallback(
    ({ src, active: on }: { src: string; active: boolean }) => (
      <span
        className={`block h-6 w-6 shrink-0 ${on ? "bg-cta" : "bg-white"}`}
        style={{
          maskImage: `url("${src}")`,
          WebkitMaskImage: `url("${src}")`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
        aria-hidden
      />
    ),
    [],
  );

  const playNow = useCallback(() => {
    if (!playKey && !firstEpisodePlayable) return;
    if (!canPlay) {
      const watchPath = `${movie.mediaType === "tv" ? "/shows" : "/movies"}/${movie.id}/watch`;
      rememberReturnTo(watchPath);
      if (isMobile) {
        router.push(`/auth?returnTo=${encodeURIComponent(watchPath)}`);
        return;
      }
      setAuthOpen(true);
      return;
    }
    setActive(
      firstEpisodePlayable ?? {
        id: "main",
        title: movie.title,
        videoKey: playKey as string,
      },
    );
    setPlaying(true);
    // User gesture — can unmute for full movie watch
    setMuted(false);
    addWatchHistory({
      id: movie.id,
      title: movie.title,
      path: `${movie.mediaType === "tv" ? "/shows" : "/movies"}/${movie.id}/watch`,
    });
  }, [
    playKey,
    firstEpisodePlayable,
    movie.title,
    movie.id,
    movie.mediaType,
    canPlay,
    isMobile,
    router,
  ]);

  const playEpisode = useCallback(
    (ep: ShowEpisode, season: ShowSeason) => {
      if (!canPlay) {
        const watchPath = `${movie.mediaType === "tv" ? "/shows" : "/movies"}/${movie.id}/watch`;
        rememberReturnTo(watchPath);
        if (isMobile) {
          router.push(`/auth?returnTo=${encodeURIComponent(watchPath)}`);
          return;
        }
        setAuthOpen(true);
        return;
      }
      // Every episode must play — episode clip, then show trailer / any video
      const key =
        ep.videoKey ||
        playKey ||
        movie.videos?.find((v) => v.key)?.key ||
        null;
      if (!key) return;
      setActive({
        id: `s${season.seasonNumber}e${ep.episodeNumber}`,
        title: ep.title,
        videoKey: key,
      });
      setPlaying(true);
      setMuted(false);
      // Scroll player into view on mobile
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [playKey, movie.videos, canPlay, isMobile, router, movie.mediaType, movie.id],
  );

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-5 py-4 sm:space-y-8 sm:py-6 md:space-y-10 md:py-8">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-[12px] font-medium sm:text-[13px]"
        >
          {/* Watch → detail hero (replace so player is not left on the stack) */}
          <BackLink
            href={`${basePath}/${movie.id}`}
            fallbackHref={`${basePath}/${movie.id}`}
            replace
            aria-label="Back to title"
          />
          <Link
            href="/movies"
            className="truncate text-cta transition hover:text-white"
          >
            Movies & Shows
          </Link>
        </nav>

        {/* Spacer keeps layout when player is fixed full-view on mobile */}
        {fullView ? (
          <div
            className="h-[100svh] h-[100dvh] w-full sm:hidden"
            aria-hidden
          />
        ) : null}

        {/*
          Cinema frame — full container width/height idle and playing.
          Full view: visual viewport (mobile + web) or native fullscreen.
        */}
        <section
          ref={playerShellRef}
          className={[
            "relative w-full min-w-0 overflow-hidden bg-black",
            fullView
              ? [
                  "fixed inset-0 z-[200] rounded-none",
                  /* Fallbacks for all mobile viewports; JS visualViewport refines */
                  "h-[100svh] h-[100dvh] max-h-[100dvh]",
                  "w-[100vw] max-w-[100vw] min-h-0 min-w-0",
                ].join(" ")
              : "cinema-frame watch-fill",
          ].join(" ")}
        >
          {playing && active?.videoKey ? (
            <div className="absolute inset-0 z-0 h-full w-full min-h-full min-w-full overflow-hidden bg-black">
              {/* Video fills the container — no dim overlays on playing screen */}
              <WatchPlayer
                key={active.videoKey + active.id}
                videoKey={active.videoKey}
                title={active.title}
                muted={muted}
                subtitlesOn={subtitlesOn}
                subtitleLang={subtitleLang}
                layout={fullView ? "fullscreen" : "frame"}
                onCaptionTracks={handleCaptionTracks}
                className="!absolute !inset-0 !h-full !w-full !min-h-full !min-w-full"
              />

              {/* Always-visible chrome — safe-area aware in mobile full view */}
              <div
                className={[
                  "pointer-events-none absolute inset-x-0 top-0 z-30 px-2.5 pt-2.5 sm:px-5 sm:pt-4",
                  fullView
                    ? "pt-[max(0.625rem,env(safe-area-inset-top))] px-[max(0.625rem,env(safe-area-inset-right))]"
                    : "",
                ].join(" ")}
              >
                <div className="pointer-events-auto flex flex-nowrap items-center justify-end gap-1.5 sm:flex-wrap sm:gap-2">
                  <button
                    type="button"
                    className={[
                      actionBtn,
                      "min-w-[40px] px-1.5 text-[10px] font-semibold sm:min-w-[48px] sm:px-2 sm:text-[11px]",
                      subtitlesOn ? "!border-cta text-cta" : "",
                    ].join(" ")}
                    aria-label={
                      subtitlesOn ? "Turn subtitles off" : "Turn subtitles on"
                    }
                    aria-pressed={subtitlesOn}
                    onClick={() => setSubtitlesOn((v) => !v)}
                    title={subtitlesOn ? "Subtitles on" : "Subtitles off"}
                  >
                    CC
                  </button>
                  {languages.length > 0 ? (
                    <div ref={langMenuRef} className="relative min-w-0 max-w-[9.5rem] sm:max-w-[200px]">
                      <button
                        type="button"
                        className="flex h-10 w-full min-w-0 items-center gap-1 rounded-lg bg-[#0F0F0F] px-2 text-white sm:h-12 sm:min-w-[9rem] sm:gap-1.5 sm:px-2.5"
                        aria-label="Choose subtitle language for this title"
                        aria-haspopup="listbox"
                        aria-expanded={langMenuOpen}
                        onClick={() => setLangMenuOpen((o) => !o)}
                      >
                        <span className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-white sm:text-[12px]">
                          {languages.find((l) => l.iso_639_1 === languageSelectValue)
                            ?.english_name ||
                            languageSelectValue.toUpperCase() ||
                            "Language"}
                        </span>
                        <FiChevronDown
                          className={[
                            "h-3.5 w-3.5 shrink-0 text-white transition-transform",
                            langMenuOpen ? "rotate-180" : "",
                          ].join(" ")}
                          aria-hidden
                        />
                      </button>
                      {langMenuOpen ? (
                        <ul
                          role="listbox"
                          aria-label="Subtitle languages"
                          className="lang-dropdown-scroll absolute right-0 top-[calc(100%+4px)] z-40 max-h-[min(40vh,12.5rem)] w-[min(calc(100vw-2rem),14rem)] overflow-y-auto overscroll-contain rounded-lg bg-[#0F0F0F] py-1 shadow-lg sm:max-h-[11rem] sm:w-[12.5rem]"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          {languages.map((lang) => {
                            const code = lang.iso_639_1 || "en";
                            const selected = code === languageSelectValue;
                            return (
                              <li
                                key={code + lang.english_name}
                                role="presentation"
                              >
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  className={[
                                    "flex w-full items-center px-3 py-1.5 text-left text-[11px] font-medium text-white transition sm:py-2 sm:text-[12px]",
                                    selected
                                      ? "bg-white/10"
                                      : "hover:bg-white/[0.06]",
                                  ].join(" ")}
                                  onClick={() => {
                                    onLanguageChange(code);
                                    setLangMenuOpen(false);
                                  }}
                                >
                                  <span className="truncate text-white">
                                    {lang.english_name}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={actionBtn}
                    aria-label={muted ? "Unmute" : "Mute"}
                    onClick={() => setMuted((m) => !m)}
                  >
                    {muted ? (
                      <FaVolumeMute className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <FaVolumeUp className="h-3.5 w-3.5 text-cta sm:h-4 sm:w-4" />
                    )}
                  </button>
                  {/* Expand / reduce — always available (mobile + full view; useful on web too) */}
                  <button
                    type="button"
                    className={actionBtn}
                    aria-label={
                      fullView ? "Exit full view" : "Expand to full view"
                    }
                    aria-pressed={fullView}
                    onClick={() => void toggleFullView()}
                    title={fullView ? "Exit full view" : "Full view"}
                  >
                    {fullView ? (
                      <FiMinimize2 className="h-4 w-4" />
                    ) : (
                      <FiMaximize2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {bg ? (
                <Image
                  src={bg}
                  alt={movie.title}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="100vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              ) : (
                <div className="absolute inset-0 h-full w-full bg-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

              <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-6 pt-20 text-center sm:px-6 sm:pb-8 md:px-8 lg:pb-10">
                <h1 className="max-w-3xl break-words text-[clamp(1.25rem,3.5vw,1.875rem)] font-semibold leading-tight text-white sm:text-[clamp(1.35rem,4vw,2.25rem)]">
                  {movie.title}
                </h1>
                {/* Description: web only — hidden on mobile */}
                <p className="mt-2.5 hidden max-w-2xl text-[14px] leading-relaxed text-[#999999] sm:mt-3 sm:text-[16px] sm:line-clamp-2 sm:block">
                  {movie.overview || "No description available."}
                </p>
                <div className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-6 sm:w-auto sm:max-w-none sm:gap-3">
                  <Button
                    className="!h-[49px] !w-full max-w-2xl gap-2 px-8 text-[14px] sm:!h-[49px] sm:!w-auto sm:min-w-[140px] sm:max-w-none sm:px-6"
                    onClick={playNow}
                    disabled={!playKey}
                  >
                    <FaPlay className="h-3 w-3" />
                    Play Now
                  </Button>
                  <button
                    type="button"
                    className={actionBtn}
                    aria-label={inList ? "Remove from list" : "Add to list"}
                    aria-pressed={inList}
                    onClick={() =>
                      setMyList(
                        toggleMyList(
                          movie.id,
                          movie.title,
                          movie.mediaType === "tv" ? "tv" : "movie",
                        ),
                      )
                    }
                  >
                    <IconMask src="/Icons/Plus.svg" active={inList} />
                  </button>
                  <button
                    type="button"
                    className={actionBtn}
                    aria-label={liked ? "Unlike" : "Like"}
                    aria-pressed={liked}
                    onClick={() =>
                      setLikes(
                        toggleLike(
                          movie.id,
                          movie.mediaType === "tv" ? "tv" : "movie",
                          movie.title,
                        ),
                      )
                    }
                  >
                    <IconMask src="/Icons/hand.svg" active={liked} />
                  </button>
                  <button
                    type="button"
                    className={actionBtn}
                    aria-label={muted ? "Unmute" : "Mute"}
                    onClick={() => setMuted((m) => !m)}
                  >
                    {muted ? (
                      <FaVolumeMute className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <FaVolumeUp className="h-3.5 w-3.5 text-cta sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="grid min-w-0 grid-cols-1 gap-4 bg-[#141414] sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2">
            {/* Seasonal titles only — real TMDB seasons/episodes */}
            {isSeasonal && movie.seasons ? (
              <SeasonsAndEpisodes
                seasons={movie.seasons}
                fallbackVideoKey={playKey}
                activeId={active?.id ?? null}
                onPlayEpisode={playEpisode}
              />
            ) : null}

            <InfoCard title="Description">
              <p className="text-[12px] font-normal leading-relaxed text-[#999999] sm:text-[13px]">
                {movie.overview || "No description available for this title."}
              </p>
            </InfoCard>

            <CastSection cast={movie.cast} />

            {/* Same reviews layout as movie/show detail (mobile + web) */}
            <ReviewsSection
              reviews={movie.reviews}
              mediaId={movie.id}
              mediaType={isShow ? "tv" : "movie"}
              title={movie.title}
            />
          </div>

          <aside className="min-w-0 space-y-4 sm:space-y-5">
            <InfoCard>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <FieldLabel icon={FiCalendar}>Released Year</FieldLabel>
                  <p className="text-base font-medium text-white">{year}</p>
                </div>

                <div>
                  <FieldLabel iconSrc="/Icons/Avalible Language.svg">
                    Available Languages
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {spokenLanguages.map((lang) => (
                      <span
                        key={lang.iso_639_1 || lang.english_name}
                        className={pillClass}
                      >
                        {lang.english_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Ratings</FieldLabel>
                  {/* Full width of sidebar — same span as Director / Music (movies + shows) */}
                  <div className="grid w-full grid-cols-2 gap-3">
                    <div className="min-w-0 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                      <p className="mb-1 text-[11px] font-medium text-[#999999]">
                        IMDb
                      </p>
                      <StarRow value={imdbRating} />
                    </div>
                    <div className="min-w-0 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                      <p className="mb-1 text-[11px] font-medium text-[#999999]">
                        StreamVibe
                      </p>
                      <StarRow value={streamRating} />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel iconSrc="/Icons/Genres.svg">Genres</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {(movie.genres.length
                      ? movie.genres
                      : [{ id: 0, name: "Drama" }]
                    ).map((g) => (
                      <span key={g.id || g.name} className={pillClass}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>

                {director ? (
                  <div>
                    <FieldLabel>Director</FieldLabel>
                    <div className={innerCardClass}>
                      <PersonAvatar
                        path={director.profile_path}
                        name={director.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {director.name}
                        </p>
                        <p className="text-xs text-[#999999]">
                          {director.job || "From the crew"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {music ? (
                  <div>
                    <FieldLabel>Music</FieldLabel>
                    <div className={innerCardClass}>
                      <PersonAvatar
                        path={music.profile_path}
                        name={music.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {music.name}
                        </p>
                        <p className="text-xs text-[#999999]">
                          {music.job || "Music"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </InfoCard>
          </aside>
        </div>
      </div>

      <FreeTrialBanner posters={relatedPosters.slice(0, 12)} />
      <AuthPrompt
        key={authOpen ? "auth-open" : "auth-closed"}
        open={!isMobile && authOpen && status === "anonymous"}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={() => {
          setAuthOpen(false);
          if (!playKey && !firstEpisodePlayable) return;
          setActive(
            firstEpisodePlayable ?? {
              id: "main",
              title: movie.title,
              videoKey: playKey as string,
            },
          );
          setPlaying(true);
          addWatchHistory({
            id: movie.id,
            title: movie.title,
            path: `${isShow ? "/shows" : "/movies"}/${movie.id}/watch`,
          });
        }}
      />
    </div>
  );
}
