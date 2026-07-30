"use client";

import Image from "next/image";
import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { FiArrowDown, FiArrowUp, FiClock } from "react-icons/fi";
import { posterUrl } from "@/lib/media";
import type { ShowEpisode, ShowSeason } from "@/lib/types";

type Props = {
  seasons: ShowSeason[];
  fallbackVideoKey?: string | null;
  activeId?: string | null;
  onPlayEpisode: (ep: ShowEpisode, season: ShowSeason) => void;
};

/**
 * Seasons and Episodes.
 * Mobile: card layout from design ref Epsiode.png
 *   (full-width still, ep # on thumb, duration badge, title, description).
 * Desktop: list rows with dividers (existing layout).
 */
export default function SeasonsAndEpisodes({
  seasons,
  fallbackVideoKey = null,
  activeId = null,
  onPlayEpisode,
}: Props) {
  const defaultOpen = seasons[0]?.id ?? null;
  const [openId, setOpenId] = useState<number | null>(defaultOpen);

  return (
    <section className="min-w-0 sm:rounded-xl sm:border sm:border-[#262626] sm:bg-[#1A1A1A] sm:p-5 md:p-6">
      <h2 className="mb-4 text-[18px] font-semibold text-white sm:mb-4 sm:text-[14px] sm:font-medium sm:text-[#999999]">
        Seasons and Episodes
      </h2>
      <div className="space-y-3 sm:space-y-3">
        {seasons.map((season) => {
          const open = openId === season.id;
          const count = season.episodes.length || season.episodeCount;
          const label =
            season.seasonNumber > 0
              ? `Season ${String(season.seasonNumber).padStart(2, "0")}`
              : season.name;

          return (
            <div
              key={season.id}
              className="min-w-0 overflow-hidden rounded-xl border border-[#262626] bg-[#0F0F0F]"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : season.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition hover:bg-white/[0.03] sm:gap-3 sm:px-5 sm:py-3.5"
                aria-expanded={open}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-white sm:text-[15px]">
                    {label}
                  </span>
                  <span className="text-[13px] text-[#999999]">
                    {count} {count === 1 ? "Episode" : "Episodes"}
                  </span>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#999999]"
                  aria-hidden
                >
                  {open ? (
                    <FiArrowUp className="h-4 w-4" />
                  ) : (
                    <FiArrowDown className="h-4 w-4" />
                  )}
                </span>
              </button>

              {open ? (
                <>
                  {/* ——— Mobile: image left · number right · no subtext (Epsiode.png) ——— */}
                  <ul className="space-y-5 px-3 pb-4 sm:hidden">
                    {season.episodes.map((ep) => {
                      const epId = `s${season.seasonNumber}e${ep.episodeNumber}`;
                      const active = activeId === epId;
                      const thumb = ep.stillPath
                        ? posterUrl(ep.stillPath, "w500")
                        : null;
                      const duration =
                        typeof ep.runtime === "number" && ep.runtime > 0
                          ? ep.runtime
                          : null;
                      const num = String(ep.episodeNumber).padStart(2, "0");

                      return (
                        <li key={ep.id}>
                          <button
                            type="button"
                            onClick={() => onPlayEpisode(ep, season)}
                            className={[
                              "flex w-full min-w-0 flex-col overflow-hidden rounded-xl border-0 bg-[#141414] p-3 text-left transition",
                              active
                                ? "bg-[#1A1A1A]"
                                : "hover:bg-[#1A1A1A]",
                            ].join(" ")}
                          >
                            {/* Video left · episode number right */}
                            <div className="flex w-full min-w-0 items-center gap-3">
                              <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-[#262626] bg-[#1A1A1A] aspect-[16/9]">
                                {thumb ? (
                                  <Image
                                    src={thumb}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="80vw"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-[#1A1A1A]" />
                                )}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white">
                                    <FaPlay className="ml-0.5 h-3 w-3" />
                                  </span>
                                </span>
                              </div>
                              <span className="w-10 shrink-0 text-center text-[24px] font-semibold tabular-nums text-[#999999]">
                                {num}
                              </span>
                            </div>

                            {/* Duration — border only, no fill */}
                            {duration != null ? (
                              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md border border-[#262626] bg-transparent px-2 py-1 text-[11px] font-medium text-[#999999]">
                                <FiClock className="h-3 w-3 shrink-0" />
                                {duration} min
                              </span>
                            ) : null}

                            {/* Title only — no description */}
                            <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-white">
                              {ep.title}
                            </h3>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* ——— Desktop: list rows with dividers ——— */}
                  <ul className="hidden sm:block">
                    {season.episodes.map((ep, epIndex) => {
                      const epId = `s${season.seasonNumber}e${ep.episodeNumber}`;
                      const active = activeId === epId;
                      const thumb = ep.stillPath
                        ? posterUrl(ep.stillPath, "w342")
                        : null;
                      const duration =
                        typeof ep.runtime === "number" && ep.runtime > 0
                          ? ep.runtime
                          : null;
                      const isLast = epIndex === season.episodes.length - 1;

                      return (
                        <li
                          key={ep.id}
                          className={active ? "bg-white/[0.03]" : ""}
                        >
                          <div
                            className="mx-5 border-t border-[#262626]"
                            aria-hidden
                          />
                          <button
                            type="button"
                            onClick={() => onPlayEpisode(ep, season)}
                            className="flex w-full min-w-0 items-start gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04]"
                          >
                            <span className="w-7 shrink-0 self-center text-center text-sm font-semibold text-[#999999]">
                              {String(ep.episodeNumber).padStart(2, "0")}
                            </span>

                            <div className="relative h-[80px] w-[140px] shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A]">
                              {thumb ? (
                                <Image
                                  src={thumb}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="140px"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-[#1A1A1A]" />
                              )}
                              <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white">
                                  <FaPlay className="ml-0.5 h-3 w-3" />
                                </span>
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-[15px] font-semibold leading-snug text-white">
                                  {ep.title}
                                </h3>
                                {duration != null ? (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#262626] bg-[#141414] px-2 py-1 text-[11px] font-medium text-[#999999]">
                                    <FiClock className="h-3 w-3" />
                                    {duration} min
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#999999]">
                                {ep.overview || "No description available."}
                              </p>
                            </div>
                          </button>
                          {isLast ? (
                            <div
                              className="mx-5 border-t border-[#262626]"
                              aria-hidden
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
