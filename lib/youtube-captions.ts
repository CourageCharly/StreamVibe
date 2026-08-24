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

function readTracks(player: Record<string, unknown>): CaptionTrackInfo[] {
  const captions = player.captions as
    | {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: Array<{
            baseUrl?: string;
            languageCode?: string;
            kind?: string;
            name?: { simpleText?: string };
          }>;
        };
      }
    | undefined;
  const raw = captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t.baseUrl && t.languageCode)
    .map((t) => ({
      languageCode: t.languageCode as string,
      languageName: t.name?.simpleText,
      kind: t.kind,
      baseUrl: t.baseUrl as string,
    }));
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
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": YT_UA,
      "Accept-Language": "en-US,en;q=0.9",
      ...extraHeaders,
    },
    redirect: "follow",
  });
  if (!res.ok) return "";
  return res.text();
}

async function fetchCuesFromTrack(track: CaptionTrackInfo): Promise<CaptionCue[]> {
  const extras = [
    "&fmt=json3&xorb=2&xobt=3&xovt=3",
    "&fmt=vtt&xorb=2&xobt=3&xovt=3",
    "&fmt=srv3&xorb=2&xobt=3&xovt=3",
    "&fmt=json3",
    "&fmt=vtt",
  ];
  for (const extra of extras) {
    const url = track.baseUrl.includes("fmt=")
      ? track.baseUrl
      : `${track.baseUrl}${extra}`;
    const body = await fetchText(url, {
      Referer: "https://www.youtube.com/",
      Origin: "https://www.youtube.com",
      Accept: "application/json,text/vtt,text/xml,*/*",
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
): Promise<{ cues: CaptionCue[]; tracks: CaptionTrackInfo[] }> {
  const id = videoId.trim();
  if (!id) return { cues: [], tracks: [] };

  const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
  const player = extractPlayerResponse(html);
  const tracks = player ? readTracks(player) : [];
  const track = pickTrack(tracks, lang);
  if (!track) return { cues: [], tracks };

  const cues = await fetchCuesFromTrack(track);
  return { cues, tracks };
}
