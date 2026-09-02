"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TrailerClip } from "@/lib/types";
import {
  destroyYouTubePlayer,
  mountYouTubePlayer,
  youtubeIframeReady,
  type YouTubePlayerInstance,
} from "@/lib/youtube-iframe";

type Props = {
  clip: TrailerClip;
  className?: string;
  /** Playback speed (home grid uses 2; hero uses 1) */
  playbackRate?: number;
  /** Loop the trailer (default true) */
  loop?: boolean;
  /** When true, audio is muted (default true for autoplay policy) */
  muted?: boolean;
  /**
   * cover — crop to fill parent (default for every player)
   * contain — fit inside parent (letterbox)
   */
  objectFit?: "cover" | "contain";
  onEnded?: () => void;
};

/**
 * YouTube trailer via IFrame API (autoplay; mute controlled by prop).
 * Default fills the container (object-fit: cover), never letterbox.
 */
export default function FastTrailerPlayer({
  clip,
  className = "",
  playbackRate = 2,
  loop = true,
  muted = true,
  objectFit = "cover",
  onEnded,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const readyRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const mutedRef = useRef(muted);
  const reactId = useId().replace(/:/g, "");
  const elId = `yt-${clip.key}-${reactId}`;
  // Only mount YT after client hydration so SSR markup stays a plain div
  const [mounted, setMounted] = useState(false);
  /** Outer cover box — measured so the 16:9 player fully covers width + height */
  const coverBoxRef = useRef<HTMLDivElement>(null);
  const [coverSize, setCoverSize] = useState<{ w: number; h: number } | null>(
    null,
  );

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Size the 16:9 video layer to always cover the cell (object-fit: cover)
  useEffect(() => {
    if (objectFit !== "cover") return;
    const el = coverBoxRef.current;
    if (!el) return;

    const apply = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0 || height <= 0) return;
      const videoRatio = 16 / 9;
      const boxRatio = width / height;
      let w: number;
      let h: number;
      if (boxRatio > videoRatio) {
        // Wider than 16:9 → match width, grow height past the cell
        w = width;
        h = width / videoRatio;
      } else {
        // Taller than 16:9 → match height, grow width past the cell
        h = height;
        w = height * videoRatio;
      }
      setCoverSize({ w, h });
    };

    apply();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => apply())
        : null;
    ro?.observe(el);
    window.addEventListener("resize", apply);
    // Remeasure after layout / iframe paint
    const t1 = window.setTimeout(apply, 50);
    const t2 = window.setTimeout(apply, 300);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", apply);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [objectFit, mounted, clip.key]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    readyRef.current = false;

    async function mount() {
      if (!hostRef.current) return;
      hostRef.current.id = elId;

      const player = await mountYouTubePlayer(
        hostRef.current,
        clip.key,
        {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          loop: loop ? 1 : 0,
          ...(loop ? { playlist: clip.key } : {}),
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
        },
        {
          onReady: (e) => {
            if (cancelled) return;
            readyRef.current = true;
            try {
              if (mutedRef.current) e.target.mute();
              else e.target.unMute();
              e.target.setPlaybackRate?.(playbackRate);
              e.target.playVideo();
              // Remeasure cover after iframe mounts (esp. mobile)
              if (objectFit === "cover" && coverBoxRef.current) {
                const box = coverBoxRef.current;
                const width = box.clientWidth;
                const height = box.clientHeight;
                if (width > 0 && height > 0) {
                  const videoRatio = 16 / 9;
                  const boxRatio = width / height;
                  let w: number;
                  let h: number;
                  if (boxRatio > videoRatio) {
                    w = width;
                    h = width / videoRatio;
                  } else {
                    h = height;
                    w = height * videoRatio;
                  }
                  setCoverSize({ w, h });
                }
              }
            } catch {
              /* ignore API timing edges */
            }
          },
          onStateChange: (e) => {
            if (cancelled) return;
            // Re-apply speed if player resets it
            if (e.data === 1 /* PLAYING */) {
              try {
                e.target.setPlaybackRate?.(playbackRate);
                if (mutedRef.current) e.target.mute();
                else e.target.unMute();
              } catch {
                /* ignore */
              }
            }
            // ENDED
            if (e.data === 0) {
              onEndedRef.current?.();
            }
          },
        },
      );

      if (cancelled) {
        destroyYouTubePlayer(player, hostRef.current);
        return;
      }
      playerRef.current = player;
    }

    void mount();

    return () => {
      cancelled = true;
      readyRef.current = false;
      destroyYouTubePlayer(playerRef.current, hostRef.current);
      playerRef.current = null;
    };
  }, [mounted, clip.key, elId, playbackRate, loop, objectFit]);

  // Live mute / unmute without remounting the player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current || !youtubeIframeReady(hostRef.current)) {
      return;
    }
    try {
      if (muted) player.mute();
      else player.unMute();
    } catch {
      /* player not ready yet */
    }
  }, [muted]);

  const cover = objectFit === "cover";

  /* cover: crop like object-cover — fills parent completely (no letterbox) */
  if (cover) {
    return (
      <div
        ref={coverBoxRef}
        className={`absolute inset-0 h-full w-full min-h-0 min-w-0 overflow-hidden bg-black [container-type:size] ${className}`}
      >
        {/*
          CSS cover via container units (works on mobile tall heroes) +
          measured size when available for precision.
        */}
        <div
          className={[
            "pointer-events-none absolute left-1/2 top-1/2",
            "-translate-x-1/2 -translate-y-1/2",
            "[&_iframe]:!absolute [&_iframe]:!left-0 [&_iframe]:!top-0",
            "[&_iframe]:!h-full [&_iframe]:!w-full",
            "[&_iframe]:!max-h-none [&_iframe]:!max-w-none [&_iframe]:!min-h-full [&_iframe]:!min-w-full",
            "[&_iframe]:!border-0",
          ].join(" ")}
          style={
            coverSize
              ? { width: coverSize.w, height: coverSize.h }
              : {
                  // 16:9 cover of the parent (cqw/cqh = parent size)
                  width: "max(100cqw, 177.78cqh)",
                  height: "max(100cqh, 56.25cqw)",
                }
          }
        >
          <div
            ref={hostRef}
            id={elId}
            title={clip.title}
            className="relative h-full w-full"
          />
        </div>
      </div>
    );
  }

  // contain still fills the box when possible (absolute inset)
  return (
    <div
      className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden bg-black ${className}`}
    >
      <div
        ref={hostRef}
        id={elId}
        title={clip.title}
        className="absolute inset-0 h-full w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-h-none [&_iframe]:max-w-none"
      />
    </div>
  );
}
