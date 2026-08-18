const KEY = "streamvibe:settings";

export type UserSettings = {
  autoplayNext: boolean;
  autoplayPreviews: boolean;
  quality: "auto" | "1080p" | "720p" | "480p";
  subtitlesDefault: boolean;
  preferredGenres: string[];
  notifyEpisodes: boolean;
  notifyWatchlist: boolean;
  notifyRecommendations: boolean;
  notifyComingSoon: boolean;
  personalizedRecs: boolean;
  saveHistory: boolean;
  maturity: "all" | "pg13" | "r";
  appLanguage: "en" | "es" | "fr";
  subtitleLanguage: string;
};

export const DEFAULT_SETTINGS: UserSettings = {
  autoplayNext: true,
  autoplayPreviews: true,
  quality: "auto",
  subtitlesDefault: true,
  preferredGenres: [],
  notifyEpisodes: true,
  notifyWatchlist: true,
  notifyRecommendations: true,
  notifyComingSoon: true,
  personalizedRecs: true,
  saveHistory: true,
  maturity: "all",
  appLanguage: "en",
  subtitleLanguage: "en",
};

export function getUserSettings(userId: string): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(`${KEY}:${userId}`);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UserSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(userId: string, next: UserSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${KEY}:${userId}`, JSON.stringify(next));
  } catch {
    /* quota */
  }
}
