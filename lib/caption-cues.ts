export type CaptionCue = {
  start: number;
  end: number;
  text: string;
};

export function cueTextAt(cues: CaptionCue[], time: number): string {
  if (!cues.length || !Number.isFinite(time)) return "";
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cue = cues[mid];
    if (time < cue.start) hi = mid - 1;
    else if (time >= cue.end) lo = mid + 1;
    else return cue.text;
  }
  return "";
}
