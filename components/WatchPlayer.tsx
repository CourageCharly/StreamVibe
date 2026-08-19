"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";

type YTPlayer = {
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration?: () => number;
  getPlayerState?: () => number;
  loadModule?: (module: string) => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
  getOption?: (module: string, option: string) => unknown;
};

const YT_PLAYING = 1;
const YT_PAUSED = 2;
const SEEK_STEP = 10;
const HIDE_MS = 2800;

/** Shared YouTube API loader (same script as FastTrailerPlayer). */
let apiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const prior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prior?.();
      resolve();
    };
    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    if (w.YT?.Player) resolve();
  });

  return apiPromise;
}

export type CaptionTrack = {
  languageCode: string;
  languageName?: string;
};

type Props = {
  videoKey: string;
  title?: string;
  muted?: boolean;
  subtitlesOn?: boolean;
  subtitleLang?: string;
  className?: string;
  /** frame = in-page theater; fullscreen = viewport — both fill actual box size */
  layout?: "frame" | "fullscreen";
  onEnded?: () => void;
  onCaptionTracks?: (tracks: CaptionTrack[]) => void;
};

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Full watch player — streaming-style UX:
 * full-width cover fill, auto-hide controls, tap to play/pause,
 * seek bar + duration, ±10s skip (web + mobile / full view).
 */
export default function WatchPlayer({
  videoKey,
  title = "Video",
  muted = false,
  subtitlesOn = false,
  subtitleLang = "en",
  className = "",
  layout = "frame",
  onEnded,
  onCaptionTracks,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const coverBoxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEndedRef = useRef(onEnded);
  const onTracksRef = useRef(onCaptionTracks);
  const mutedRef = useRef(muted);
  const subtitlesOnRef = useRef(subtitlesOn);
  const subtitleLangRef = useRef(subtitleLang);
  const reactId = useId().replace(/:/g, "");
  const elId = `watch-yt-${videoKey}-${reactId}`;

  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [coverSize, setCoverSize] = useState<{ w: number; h: number } | null>(
    null,
  );

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    onTracksRef.current = onCaptionTracks;
  }, [onCaptionTracks]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    subtitlesOnRef.current = subtitlesOn;
  }, [subtitlesOn]);
  useEffect(() => {
    subtitleLangRef.current = subtitleLang;
  }, [subtitleLang]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fill the container's actual width and height (object-fit: cover).
  useEffect(() => {
    if (!mounted) return;
    const el = coverBoxRef.current;
    if (!el) return;

    const apply = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0 || height <= 0) return;
      const videoRatio = 16 / 9;
      const boxRatio = width / height;
      if (boxRatio > videoRatio) {
        setCoverSize({ w: width, h: width / videoRatio });
      } else {
        setCoverSize({ w: height * videoRatio, h: height });
      }
    };

    apply();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => apply())
        : null;
    ro?.observe(el);
    window.addEventListener("resize", apply);
    const t1 = window.setTimeout(apply, 50);
    const t2 = window.setTimeout(apply, 300);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", apply);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mounted, videoKey, layout]);

  const bumpControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      // Keep controls visible while paused (standard streaming UX)
      setShowControls((prev) => {
        const state = playerRef.current?.getPlayerState?.();
        if (state === YT_PAUSED || state === 0) return true;
        return false;
      });
    }, HIDE_MS);
  }, []);

  // Progress / duration tick
  useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p || dragging) return;
      try {
        setCurrentTime(p.getCurrentTime?.() ?? 0);
        const d = p.getDuration?.() ?? 0;
        if (d > 0) setDuration(d);
      } catch {
        /* ignore */
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [mounted, videoKey, dragging]);

  /** Resolve best caption track for a language (streaming-standard matching). */
  function resolveCaptionTrack(
    list: CaptionTrack[] | undefined,
    lang: string,
  ): { languageCode: string } {
    const code = (lang || "en").toLowerCase();
    if (!list?.length) return { languageCode: code };
    const exact = list.find(
      (t) => (t.languageCode || "").toLowerCase() === code,
    );
    if (exact?.languageCode) return { languageCode: exact.languageCode };
    const prefix = list.find((t) => {
      const c = (t.languageCode || "").toLowerCase();
      if (!c) return false;
      return c.startsWith(code) || code.startsWith(c.slice(0, 2));
    });
    if (prefix?.languageCode) return { languageCode: prefix.languageCode };
    // Prefer English track, else first available
    const en = list.find((t) =>
      (t.languageCode || "").toLowerCase().startsWith("en"),
    );
    const fallback = en?.languageCode || list[0]?.languageCode || code;
    return { languageCode: fallback };
  }

  function readTrackList(player: YTPlayer): CaptionTrack[] {
    try {
      const a = player.getOption?.("captions", "tracklist") as
        | CaptionTrack[]
        | undefined;
      const b = player.getOption?.("cc", "tracklist") as
        | CaptionTrack[]
        | undefined;
      const list = Array.isArray(a) && a.length ? a : b;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  /**
   * Standard streaming flow: language selection drives the subtitle track.
   * CC on → show captions in selected language; CC off → hide.
   */
  function applyCaptions(player: YTPlayer) {
    try {
      player.loadModule?.("captions");
      player.loadModule?.("cc");
      const list = readTrackList(player);
      if (list.length) {
        onTracksRef.current?.(
          list.map((t) => ({
            languageCode: t.languageCode,
            languageName: t.languageName,
          })),
        );
      }

      if (subtitlesOnRef.current) {
        const track = resolveCaptionTrack(list, subtitleLangRef.current || "en");
        player.setOption?.("captions", "track", track);
        player.setOption?.("cc", "track", track);
        try {
          player.setOption?.("captions", "fontSize", 1);
          player.setOption?.("captions", "displaySettings", {
            background: "#000000",
            backgroundOpacity: 75,
            windowOpacity: 0,
            fontSizeIncrease: 0,
            color: "#ffffff",
            textOpacity: 100,
          });
        } catch {
          /* optional */
        }
      } else {
        // Hide captions (keep modules loaded for fast re-enable)
        player.setOption?.("captions", "track", {});
        player.setOption?.("cc", "track", {});
      }
    } catch {
      /* captions not available for this video */
    }
  }

  useEffect(() => {
    if (!mounted || !videoKey) return;
    let cancelled = false;

    async function mount() {
      await loadYouTubeApi();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const YT = (window as any).YT;
      if (cancelled || !hostRef.current || !YT?.Player) return;

      hostRef.current.id = elId;

      playerRef.current = new YT.Player(hostRef.current, {
        videoId: videoKey,
        playerVars: {
          autoplay: 1,
          mute: mutedRef.current ? 1 : 0,
          // Custom chrome only — hide YT bar (standard app player)
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          fs: 0,
          disablekb: 0,
          iv_load_policy: 3,
          // Always request captions (standard streaming: CC available on play)
          cc_load_policy: 1,
          cc_lang_pref: subtitleLangRef.current || "en",
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            try {
              if (mutedRef.current) e.target.mute();
              else e.target.unMute();
              e.target.playVideo();
              setIsPlaying(true);
              // Retry captions — tracks often appear after a short delay
              applyCaptions(e.target);
              setTimeout(() => applyCaptions(e.target), 400);
              setTimeout(() => applyCaptions(e.target), 1200);
              setTimeout(() => applyCaptions(e.target), 2500);
              const d = e.target.getDuration?.() ?? 0;
              if (d > 0) setDuration(d);
            } catch {
              /* ignore */
            }
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (e.data === YT_PLAYING) {
              setIsPlaying(true);
              try {
                if (mutedRef.current) e.target.mute();
                else e.target.unMute();
                applyCaptions(e.target);
                const d = e.target.getDuration?.() ?? 0;
                if (d > 0) setDuration(d);
              } catch {
                /* ignore */
              }
            } else if (e.data === YT_PAUSED) {
              setIsPlaying(false);
              setShowControls(true);
            } else if (e.data === 0) {
              setIsPlaying(false);
              setShowControls(true);
              onEndedRef.current?.();
            }
          },
          onApiChange: (e: { target: YTPlayer }) => {
            applyCaptions(e.target);
          },
        },
      }) as YTPlayer;
    }

    void mount();
    bumpControls();

    return () => {
      cancelled = true;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, videoKey, elId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (muted) player.mute();
      else player.unMute();
    } catch {
      /* not ready */
    }
  }, [muted]);

  // Language change → switch subtitle track (streaming standard)
  useEffect(() => {
    subtitlesOnRef.current = subtitlesOn;
    subtitleLangRef.current = subtitleLang;
    const player = playerRef.current;
    if (!player) return;
    applyCaptions(player);
    // Tracks may load late — re-apply shortly after language change
    const t1 = window.setTimeout(() => applyCaptions(player), 300);
    const t2 = window.setTimeout(() => applyCaptions(player), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitlesOn, subtitleLang]);

  const togglePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const state = player.getPlayerState?.();
      if (state === YT_PLAYING) {
        player.pauseVideo();
        setIsPlaying(false);
        setShowControls(true);
      } else {
        player.playVideo();
        setIsPlaying(true);
        bumpControls();
      }
    } catch {
      /* not ready */
    }
  }, [bumpControls]);

  const seekBy = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const now = player.getCurrentTime?.() ?? 0;
        const raw = player.getDuration?.() ?? duration;
        const dur = raw > 0 ? raw : Number.POSITIVE_INFINITY;
        const next = Math.min(Math.max(0, now + delta), dur);
        player.seekTo(next, true);
        setCurrentTime(next);
        bumpControls();
      } catch {
        /* not ready */
      }
    },
    [bumpControls, duration],
  );

  const seekToRatio = useCallback(
    (ratio: number) => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const dur = player.getDuration?.() ?? duration;
        if (!dur || dur <= 0) return;
        const next = Math.min(Math.max(0, ratio * dur), dur);
        player.seekTo(next, true);
        setCurrentTime(next);
        bumpControls();
      } catch {
        /* not ready */
      }
    },
    [bumpControls, duration],
  );

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const transportBtn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95 sm:h-12 sm:w-12";

  return (
    <div
      ref={coverBoxRef}
      className={`absolute inset-0 h-full w-full overflow-hidden bg-black [container-type:size] ${className}`}
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
    >
      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden",
          "[&>iframe]:!absolute [&>iframe]:!inset-0",
          "[&>iframe]:!h-full [&>iframe]:!w-full",
          "[&>iframe]:!object-cover [&>iframe]:!object-center",
          "[&>iframe]:!max-h-none [&>iframe]:!max-w-none",
          "[&>iframe]:!min-h-full [&>iframe]:!min-w-full [&>iframe]:!border-0",
          "[&>iframe]:!pointer-events-none",
        ].join(" ")}
        style={
          coverSize
            ? { width: coverSize.w, height: coverSize.h }
            : {
                width: "max(100%, 177.78%)",
                height: "max(100%, 100%)",
              }
        }
      >
        <div
          ref={hostRef}
          id={elId}
          title={title}
          className="relative h-full w-full"
        />
      </div>

      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={() => {
          bumpControls();
          togglePlayPause();
        }}
      />

      <div
        className={[
          "absolute inset-0 z-20 transition-opacity duration-300",
          showControls
            ? "pointer-events-none opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 sm:gap-8">
          <button
            type="button"
            className={`pointer-events-auto ${transportBtn}`}
            aria-label={`Rewind ${SEEK_STEP} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              seekBy(-SEEK_STEP);
            }}
          >
            <span className="relative inline-flex items-center justify-center">
              <FiRotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute text-[8px] font-bold sm:text-[9px]">
                {SEEK_STEP}
              </span>
            </span>
          </button>
          <button
            type="button"
            className={`pointer-events-auto ${transportBtn} !h-14 !w-14 sm:!h-16 sm:!w-16`}
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            {isPlaying ? (
              <FaPause className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <FaPlay className="h-5 w-5 translate-x-0.5 sm:h-6 sm:w-6" />
            )}
          </button>
          <button
            type="button"
            className={`pointer-events-auto ${transportBtn}`}
            aria-label={`Forward ${SEEK_STEP} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              seekBy(SEEK_STEP);
            }}
          >
            <span className="relative inline-flex items-center justify-center">
              <FiRotateCw className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute text-[8px] font-bold sm:text-[9px]">
                {SEEK_STEP}
              </span>
            </span>
          </button>
        </div>

        <div
          className={[
            "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 sm:px-5 lg:px-6",
            showControls
              ? "pt-10 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-16 sm:pb-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.25rem))]"
              : "pt-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-10 sm:pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.75rem))]",
          ].join(" ")}
        >
          <div
            className="pointer-events-auto w-full sm:mx-auto sm:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Centered caption well (Netflix / IMDb) */}
            <div
              className="mx-auto mb-1.5 min-h-[1.75rem] w-[min(86%,34rem)] text-center sm:mb-3 sm:min-h-[3rem]"
              aria-hidden
            />
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-medium tabular-nums text-white/90 sm:text-[12px]">
              <span>{formatTime(currentTime)}</span>
              <span className="rounded bg-black/50 px-1.5 py-0.5 text-white/95">
                {formatTime(duration)}
              </span>
            </div>
            <label className="block cursor-pointer">
              <span className="sr-only">Seek</span>
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={Math.round(progress * 1000)}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-[#E50000] sm:h-1.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cta sm:[&::-webkit-slider-thumb]:h-4 sm:[&::-webkit-slider-thumb]:w-4"
                style={{
                  background: `linear-gradient(to right, #E50000 0%, #E50000 ${progress * 100}%, rgba(255,255,255,0.25) ${progress * 100}%, rgba(255,255,255,0.25) 100%)`,
                }}
                onPointerDown={() => {
                  setDragging(true);
                  bumpControls();
                }}
                onPointerUp={() => {
                  setDragging(false);
                  bumpControls();
                }}
                onChange={(e) => {
                  const ratio = Number(e.target.value) / 1000;
                  setCurrentTime(ratio * (duration || 0));
                  seekToRatio(ratio);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
