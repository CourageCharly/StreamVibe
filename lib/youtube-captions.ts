/**
 * Timed caption cues for the watch overlay (Netflix-style renderer).
 * Track list + body come from the YouTube watch page / timedtext.
 */

import type { CaptionCue } from "@/lib/caption-cues";

export type { CaptionCue } from "@/lib/caption-cues";

export type CaptionTrackInfo = {
  languageCode: string;
  languageName?: string;
  kind?: string;
  baseUrl: string;
  isTranslatable?: boolean;
};

export type CaptionLang = {
  languageCode: string;
  languageName?: string;
  kind?: string;
  /** True when this language is served via auto-translate, not a native track */
  translation?: boolean;
};

const YT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanCaption(text: string): string {
  const decoded = decodeEntities(text);
  const lines = decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return lines.slice(0, 2).join("\n");
}

function extractPlayerResponse(html: string): Record<string, unknown> | null {
  const marker = "ytInitialPlayerResponse = ";
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const start = i + marker.length;
  let depth = 0;
  for (let p = start; p < html.length; p++) {
    const ch = html[p];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, p + 1)) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function readCaptionRenderer(player: Record<string, unknown>): {
  tracks: CaptionTrackInfo[];
  translations: CaptionLang[];
} {
  const captions = player.captions as
    | {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: Array<{
            baseUrl?: string;
            languageCode?: string;
            kind?: string;
            isTranslatable?: boolean;
            name?: { simpleText?: string };
          }>;
          translationLanguages?: Array<{
            languageCode?: string;
            languageName?: { simpleText?: string };
          }>;
        };
      }
    | undefined;
  const renderer = captions?.playerCaptionsTracklistRenderer;
  const raw = renderer?.captionTracks;
  const tracks = Array.isArray(raw)
    ? raw
        .filter((t) => t.baseUrl && t.languageCode)
        .map((t) => ({
          languageCode: t.languageCode as string,
          languageName: t.name?.simpleText,
          kind: t.kind,
          baseUrl: t.baseUrl as string,
          isTranslatable: Boolean(t.isTranslatable),
        }))
    : [];
  const translations = (renderer?.translationLanguages ?? [])
    .filter((t) => t.languageCode)
    .map((t) => ({
      languageCode: t.languageCode as string,
      languageName: t.languageName?.simpleText,
      translation: true as const,
    }));
  return { tracks, translations };
}

function langKey(code: string): string {
  return (code || "").toLowerCase().slice(0, 2);
}

function buildAvailableLanguages(tracks: CaptionTrackInfo[]): CaptionLang[] {
  const byKey = new Map<string, CaptionLang>();
  const ranked = [...tracks].sort((a, b) => {
    const aAuto = a.kind === "asr" ? 1 : 0;
    const bAuto = b.kind === "asr" ? 1 : 0;
    return aAuto - bAuto;
  });
  for (const t of ranked) {
    const key = langKey(t.languageCode);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, {
      languageCode: t.languageCode,
      languageName: t.languageName,
      kind: t.kind,
    });
  }
  const list = [...byKey.values()];
  list.sort((a, b) => {
    const ak = langKey(a.languageCode);
    const bk = langKey(b.languageCode);
    if (ak === "en") return -1;
    if (bk === "en") return 1;
    return (a.languageName || ak).localeCompare(b.languageName || bk);
  });
  return list;
}

function pickTrack(
  tracks: CaptionTrackInfo[],
  lang: string,
): CaptionTrackInfo | null {
  if (!tracks.length) return null;
  const code = (lang || "en").toLowerCase();
  const ranked = [...tracks].sort((a, b) => {
    const aAuto = a.kind === "asr" ? 1 : 0;
    const bAuto = b.kind === "asr" ? 1 : 0;
    return aAuto - bAuto;
  });
  return (
    ranked.find((t) => t.languageCode.toLowerCase() === code) ||
    ranked.find((t) => {
      const c = t.languageCode.toLowerCase();
      return c.startsWith(code) || code.startsWith(c.slice(0, 2));
    }) ||
    ranked.find((t) => t.languageCode.toLowerCase().startsWith("en")) ||
    ranked[0]
  );
}

function parseJson3(body: string): CaptionCue[] {
  try {
    const data = JSON.parse(body) as {
      events?: Array<{
        tStartMs?: number;
        dDurationMs?: number;
        segs?: Array<{ utf8?: string }>;
      }>;
    };
    const cues: CaptionCue[] = [];
    for (const event of data.events || []) {
      if (!event.segs?.length) continue;
      const text = cleanCaption(
        event.segs.map((seg) => seg.utf8 || "").join(""),
      );
      if (!text) continue;
      const start = (event.tStartMs || 0) / 1000;
      const end = start + (event.dDurationMs || 2500) / 1000;
      cues.push({ start, end, text });
    }
    return cues;
  } catch {
    return [];
  }
}

function parseVttTime(raw: string): number {
  const parts = raw.trim().split(":");
  if (parts.length < 2) return 0;
  const s = parts.pop() || "0";
  const m = Number(parts.pop() || 0);
  const h = Number(parts.pop() || 0);
  return h * 3600 + m * 60 + Number(s.replace(",", "."));
}

function parseVtt(body: string): CaptionCue[] {
  const cues: CaptionCue[] = [];
  const blocks = body.replace(/\r/g, "").split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [from, to] = timeLine.split("-->");
    const text = cleanCaption(
      lines
        .slice(lines.indexOf(timeLine) + 1)
        .join("\n"),
    );
    if (!text) continue;
    cues.push({
      start: parseVttTime(from),
      end: parseVttTime(to),
      text,
    });
  }
  return cues;
}

function parseSrv3(body: string): CaptionCue[] {
  const cues: CaptionCue[] = [];
  const re =
    /<p\b[^>]*\bt="(\d+)"[^>]*\bd="(\d+)"[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const start = Number(match[1]) / 1000;
    const end = start + Number(match[2]) / 1000;
    const text = cleanCaption(match[3]);
    if (!text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

function parseCaptionBody(body: string): CaptionCue[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  let cues: CaptionCue[] = [];
  if (trimmed.startsWith("{")) cues = parseJson3(trimmed);
  else if (trimmed.includes("WEBVTT") || trimmed.includes("-->")) {
    cues = parseVtt(trimmed);
  } else if (trimmed.includes("<p")) cues = parseSrv3(trimmed);
  else cues = parseJson3(trimmed);
  return cues.sort((a, b) => a.start - b.start);
}

async function fetchText(
  url: string,
  extraHeaders: Record<string, string> = {},
): Promise<{ text: string; cookie: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": YT_UA,
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: "CONSENT=YES+; SOCS=CAI",
      ...extraHeaders,
    },
    redirect: "follow",
  });
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];
  const cookie = [
    "CONSENT=YES+",
    "SOCS=CAI",
    ...setCookies.map((c) => c.split(";")[0] || ""),
  ]
    .filter(Boolean)
    .join("; ");
  if (!res.ok) return { text: "", cookie };
  return { text: await res.text(), cookie };
}

function withQuery(url: string, extra: string): string {
  if (!extra) return url;
  return url.includes("?") ? `${url}&${extra.replace(/^&/, "")}` : `${url}?${extra.replace(/^&/, "")}`;
}

async function fetchCuesFromTrack(
  track: CaptionTrackInfo,
  tlang: string | undefined,
  cookie: string,
): Promise<CaptionCue[]> {
  const extras = [
    "fmt=json3&xorb=2&xobt=3&xovt=3",
    "fmt=vtt&xorb=2&xobt=3&xovt=3",
    "fmt=srv3&xorb=2&xobt=3&xovt=3",
    "fmt=json3",
    "fmt=vtt",
  ];
  const tlangQ =
    tlang && langKey(tlang) !== langKey(track.languageCode)
      ? `tlang=${encodeURIComponent(tlang)}`
      : "";
  for (const extra of extras) {
    const url = withQuery(
      track.baseUrl,
      [tlangQ, track.baseUrl.includes("fmt=") ? "" : extra]
        .filter(Boolean)
        .join("&"),
    );
    const { text: body } = await fetchText(url, {
      Referer: "https://www.youtube.com/",
      Origin: "https://www.youtube.com",
      Accept: "application/json,text/vtt,text/xml,*/*",
      Cookie: cookie || "CONSENT=YES+; SOCS=CAI",
    });
    const cues = parseCaptionBody(body);
    if (cues.length) return cues;
    if (track.baseUrl.includes("fmt=")) break;
  }
  return [];
}

export async function getYoutubeCaptions(
  videoId: string,
  lang = "en",
): Promise<{
  cues: CaptionCue[];
  tracks: CaptionTrackInfo[];
  languages: CaptionLang[];
}> {
  const id = videoId.trim();
  if (!id) return { cues: [], tracks: [], languages: [] };

  const watch = await fetchText(
    `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
  );
  const player = extractPlayerResponse(watch.text);
  const { tracks } = player
    ? readCaptionRenderer(player)
    : { tracks: [] };
  const languages = buildAvailableLanguages(tracks);
  const native = pickTrack(tracks, lang);
  const wanted = langKey(lang);
  const useTranslate =
    !native || langKey(native.languageCode) !== wanted;
  const source =
    native && !useTranslate
      ? native
      : pickTrack(tracks, "en") || tracks[0];
  if (!source) return { cues: [], tracks, languages };

  const tlang = useTranslate && wanted ? lang : undefined;
  const cues = await fetchCuesFromTrack(source, tlang, watch.cookie);
  return { cues, tracks, languages };
}
