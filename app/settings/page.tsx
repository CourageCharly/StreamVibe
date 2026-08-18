"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiChevronRight } from "react-icons/fi";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { SettingsSkeleton } from "@/components/skeletons/PageSkeletons";
import { CATEGORIES } from "@/lib/constants";
import {
  DEFAULT_SETTINGS,
  getUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/user-settings";

const SECTIONS = [
  { id: "account", label: "Account", hint: "Name and email" },
  { id: "playback", label: "Playback", hint: "Autoplay, quality, subtitles" },
  { id: "watch", label: "Watch preferences", hint: "Genres you like" },
  { id: "notifications", label: "Notifications", hint: "Alerts for titles and lists" },
  { id: "privacy", label: "Privacy", hint: "History and personalization" },
  { id: "parental", label: "Parental controls", hint: "Maturity rating" },
  { id: "language", label: "Language & region", hint: "App and subtitle language" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsPage() {
  return (
    <RequireAuth fallback={<SettingsSkeleton />}>
      <SettingsInner />
    </RequireAuth>
  );
}

function SettingsInner() {
  const { user } = useAuth();
  const [open, setOpen] = useState<SectionId | null>("account");
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (user) setSettings(getUserSettings(user.id));
  }, [user]);

  if (!user) return null;

  function patch(partial: Partial<UserSettings>) {
    if (!user) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    saveUserSettings(user.id, next);
    toast.success("Settings saved.");
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
          <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
            Settings
          </h1>
          <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
            Manage your StreamVibe account the way you would on IMDb — by
            category.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A]">
            {SECTIONS.map((section, i) => {
              const active = open === section.id;
              return (
                <div
                  key={section.id}
                  className={i === 0 ? "" : "border-t border-[#262626]"}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(active ? null : section.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                  >
                    <span>
                      <span className="block text-[16px] font-semibold text-white sm:text-[18px]">
                        {section.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-[#999999]">
                        {section.hint}
                      </span>
                    </span>
                    <FiChevronRight
                      className={`h-5 w-5 shrink-0 text-[#999999] transition ${
                        active ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {active ? (
                    <div className="border-t border-[#262626] px-4 py-4 sm:px-5">
                      {section.id === "account" ? (
                        <div className="space-y-2 text-[14px]">
                          <p className="text-white">
                            {[user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(" ") || "Member"}
                          </p>
                          <p className="text-[#999999]">{user.email}</p>
                          <Link
                            href="/profile"
                            className="inline-block pt-1 text-[14px] font-semibold text-white hover:text-cta"
                          >
                            View profile
                          </Link>
                        </div>
                      ) : null}

                      {section.id === "playback" ? (
                        <div className="space-y-4">
                          <Toggle
                            label="Autoplay next episode"
                            checked={settings.autoplayNext}
                            onChange={(v) => patch({ autoplayNext: v })}
                          />
                          <Toggle
                            label="Autoplay previews"
                            checked={settings.autoplayPreviews}
                            onChange={(v) => patch({ autoplayPreviews: v })}
                          />
                          <Toggle
                            label="Show subtitles by default"
                            checked={settings.subtitlesDefault}
                            onChange={(v) => patch({ subtitlesDefault: v })}
                          />
                          <label className="block text-[13px] font-medium">
                            Video quality
                            <select
                              value={settings.quality}
                              onChange={(e) =>
                                patch({
                                  quality: e.target.value as UserSettings["quality"],
                                })
                              }
                              className="mt-2 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5 text-[14px] text-white outline-none"
                            >
                              <option value="auto">Auto</option>
                              <option value="1080p">Full HD (1080p)</option>
                              <option value="720p">HD (720p)</option>
                              <option value="480p">Standard (480p)</option>
                            </select>
                          </label>
                        </div>
                      ) : null}

                      {section.id === "watch" ? (
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map((cat) => {
                            const on = settings.preferredGenres.includes(cat.key);
                            return (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => {
                                  const next = on
                                    ? settings.preferredGenres.filter(
                                        (k) => k !== cat.key,
                                      )
                                    : [...settings.preferredGenres, cat.key];
                                  patch({ preferredGenres: next });
                                }}
                                className={`rounded-lg border px-3 py-2 text-[14px] font-semibold ${
                                  on
                                    ? "border-cta bg-cta text-white"
                                    : "border-[#262626] bg-[#141414] text-[#999999]"
                                }`}
                              >
                                {cat.name}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {section.id === "notifications" ? (
                        <div className="space-y-4">
                          <Toggle
                            label="New episodes"
                            checked={settings.notifyEpisodes}
                            onChange={(v) => patch({ notifyEpisodes: v })}
                          />
                          <Toggle
                            label="Watchlist is now available"
                            checked={settings.notifyWatchlist}
                            onChange={(v) => patch({ notifyWatchlist: v })}
                          />
                          <Toggle
                            label="Recommendations"
                            checked={settings.notifyRecommendations}
                            onChange={(v) => patch({ notifyRecommendations: v })}
                          />
                          <Toggle
                            label="Coming soon reminders"
                            checked={settings.notifyComingSoon}
                            onChange={(v) => patch({ notifyComingSoon: v })}
                          />
                          <Link
                            href="/notifications"
                            className="inline-block text-[14px] font-semibold text-white hover:text-cta"
                          >
                            View notification activity
                          </Link>
                        </div>
                      ) : null}

                      {section.id === "privacy" ? (
                        <div className="space-y-4">
                          <Toggle
                            label="Personalized recommendations"
                            checked={settings.personalizedRecs}
                            onChange={(v) => patch({ personalizedRecs: v })}
                          />
                          <Toggle
                            label="Save watch history"
                            checked={settings.saveHistory}
                            onChange={(v) => patch({ saveHistory: v })}
                          />
                        </div>
                      ) : null}

                      {section.id === "parental" ? (
                        <label className="block text-[13px] font-medium">
                          Maturity rating
                          <select
                            value={settings.maturity}
                            onChange={(e) =>
                              patch({
                                maturity: e.target
                                  .value as UserSettings["maturity"],
                              })
                            }
                            className="mt-2 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5 text-[14px] text-white outline-none"
                          >
                            <option value="all">All titles</option>
                            <option value="pg13">PG-13 and below</option>
                            <option value="r">R and below</option>
                          </select>
                        </label>
                      ) : null}

                      {section.id === "language" ? (
                        <div className="space-y-4">
                          <label className="block text-[13px] font-medium">
                            App language
                            <select
                              value={settings.appLanguage}
                              onChange={(e) =>
                                patch({
                                  appLanguage: e.target
                                    .value as UserSettings["appLanguage"],
                                })
                              }
                              className="mt-2 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5 text-[14px] text-white outline-none"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                            </select>
                          </label>
                          <label className="block text-[13px] font-medium">
                            Subtitle language
                            <select
                              value={settings.subtitleLanguage}
                              onChange={(e) =>
                                patch({ subtitleLanguage: e.target.value })
                              }
                              className="mt-2 w-full rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5 text-[14px] text-white outline-none"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-[14px] text-white">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-cta" : "bg-[#333]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
