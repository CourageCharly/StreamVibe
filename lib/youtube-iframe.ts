/**
 * YouTube IFrame API helpers.
 * Iframes are created with a real youtube.com embed URL *before* YT.Player
 * attaches, so postMessage target origin matches the iframe (avoids the
 * "target origin does not match recipient window" console error).
 */

export type YouTubePlayerInstance = {
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration?: () => number;
  getPlayerState?: () => number;
  setPlaybackRate?: (rate: number) => void;
  loadModule?: (module: string) => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
  getOption?: (module: string, option: string) => unknown;
  stopVideo?: () => void;
};

export type YouTubePlayerEvents = {
  onReady?: (e: { target: YouTubePlayerInstance }) => void;
  onStateChange?: (e: {
    data: number;
    target: YouTubePlayerInstance;
  }) => void;
  onApiChange?: (e: { target: YouTubePlayerInstance }) => void;
  onError?: (e: { data: number; target: YouTubePlayerInstance }) => void;
};

type YouTubeNamespace = {
  Player: new (
    el: HTMLElement,
    opts: { events?: YouTubePlayerEvents },
  ) => YouTubePlayerInstance;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";
const EMBED_ORIGIN = "https://www.youtube.com";

let apiPromise: Promise<void> | null = null;

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const finish = () => {
      if (window.YT?.Player) resolve();
    };

    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        prior?.();
      } catch {
        /* ignore prior callback errors */
      }
      finish();
    };

    const existing = document.querySelector(`script[src="${API_SRC}"]`);
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = API_SRC;
      tag.async = true;
      tag.onerror = () => {
        apiPromise = null;
        resolve();
      };
      document.head.appendChild(tag);
    }

    if (window.YT?.Player) {
      finish();
      return;
    }

    const started = Date.now();
    const poll = window.setInterval(() => {
      if (window.YT?.Player || Date.now() - started > 8000) {
        window.clearInterval(poll);
        finish();
        if (!window.YT?.Player) resolve();
      }
    }, 50);
  });

  return apiPromise;
}

function embedUrl(
  videoId: string,
  playerVars: Record<string, number | string>,
): string {
  const params = new URLSearchParams();
  params.set("enablejsapi", "1");
  params.set("origin", window.location.origin);
  params.set("widget_referrer", window.location.origin);
  for (const [key, value] of Object.entries(playerVars)) {
    if (key === "enablejsapi" || key === "origin" || key === "widget_referrer") {
      continue;
    }
    params.set(key, String(value));
  }
  return `${EMBED_ORIGIN}/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

function waitForIframeLoad(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      iframe.removeEventListener("load", done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, 2000);
    iframe.addEventListener("load", done);
  });
}

export function youtubeIframeReady(host: HTMLElement | null): boolean {
  const iframe = host?.querySelector("iframe");
  return (
    iframe instanceof HTMLIFrameElement &&
    Boolean(iframe.contentWindow) &&
    iframe.src.startsWith(EMBED_ORIGIN)
  );
}

export async function mountYouTubePlayer(
  host: HTMLElement,
  videoId: string,
  playerVars: Record<string, number | string>,
  events: YouTubePlayerEvents,
): Promise<YouTubePlayerInstance | null> {
  await loadYouTubeIframeApi();
  if (!window.YT?.Player) return null;

  host.replaceChildren();

  const iframe = document.createElement("iframe");
  iframe.title = "YouTube player";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0;display:block";

  const loaded = waitForIframeLoad(iframe);
  iframe.src = embedUrl(videoId, playerVars);
  host.appendChild(iframe);
  await loaded;
  if (!iframe.isConnected) return null;

  try {
    return new window.YT.Player(iframe, { events });
  } catch {
    return null;
  }
}

export function destroyYouTubePlayer(
  player: YouTubePlayerInstance | null,
  host?: HTMLElement | null,
) {
  const iframe = host?.querySelector("iframe");
  const canTalk =
    iframe instanceof HTMLIFrameElement &&
    Boolean(iframe.contentWindow) &&
    iframe.src.startsWith(EMBED_ORIGIN);

  if (canTalk && player) {
    try {
      player.stopVideo?.();
    } catch {
      /* iframe may already be navigating */
    }
    try {
      player.destroy();
    } catch {
      /* ignore */
    }
  } else {
    try {
      iframe?.remove();
    } catch {
      /* ignore */
    }
  }

  try {
    host?.replaceChildren();
  } catch {
    /* ignore */
  }
}
