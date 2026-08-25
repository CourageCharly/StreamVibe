import Image from "next/image";
import Link from "next/link";
import { FiClock, FiEye } from "react-icons/fi";
import { cardImageUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";
import { MEDIA_CARD_H, MEDIA_CARD_W } from "@/components/MediaRow";

type Props = {
  movie: Movie;
  showRuntime?: boolean;
  showDate?: boolean;
  showRating?: boolean;
  /** Fill grid cell width instead of fixed 285px */
  fluid?: boolean;
  /** Stretch to the parent cell's width and height */
  fill?: boolean;
  /** movie → /movies/[id]; tv → /shows/[id] */
  mediaKind?: "movie" | "tv";
};

/** Timezone-safe date label (avoids SSR/client hydration mismatches) */
function formatDate(iso?: string) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = Number(m[3]);
  const month = months[Number(m[2]) - 1];
  const year = m[1];
  if (!month || !day) return iso;
  return `${day} ${month} ${year}`;
}

/**
 * Deterministic “views” label per title (e.g. 1K, 2K, 20K) — stable for a movie id.
 */
function viewsLabel(movieId: number): string {
  const options = [
    "1K",
    "2K",
    "3K",
    "5K",
    "8K",
    "10K",
    "12K",
    "15K",
    "18K",
    "20K",
    "25K",
    "30K",
    "45K",
    "50K",
    "75K",
    "100K",
  ] as const;
  return options[Math.abs(movieId) % options.length];
}

/**
 * Deterministic runtime label per title — stable for a movie id.
 */
function durationLabel(movieId: number): string {
  const options = [
    "1h 15min",
    "1h 20min",
    "1h 25min",
    "1h 30min",
    "1h 35min",
    "1h 40min",
    "1h 45min",
    "1h 50min",
    "1h 55min",
    "2h 00min",
    "2h 05min",
    "2h 10min",
    "2h 15min",
    "2h 20min",
    "2h 30min",
    "2h 45min",
  ] as const;
  return options[Math.abs(movieId) % options.length];
}

/**
 * Must-Watch ratings: only three patterns
 *  5   → Star × 5 (all red)
 *  4.5 → Star × 4 + Half star
 *  4   → Star × 4 + Empty Star
 */
function starsFromVote(voteAverage: number, movieId = 0): 5 | 4.5 | 4 {
  const v =
    typeof voteAverage === "number" && !Number.isNaN(voteAverage)
      ? voteAverage
      : 0;

  if (v > 0) {
    // Bucket TMDB 0–10 into the three Must-Watch patterns
    if (v >= 8.6) return 5;
    if (v >= 8.0) return 4.5;
    return 4;
  }

  // No score: cycle the three patterns so the row still looks dynamic
  const cycle = [5, 4.5, 4] as const;
  return cycle[Math.abs(movieId) % 3];
}

type StarKind = "full" | "half" | "empty";

/** Only the project star icons from /public/Icons */
const STAR_ICON: Record<StarKind, string> = {
  full: "/Icons/Star.svg",
  half: "/Icons/Half star.svg",
  empty: "/Icons/Empty Star.svg",
};

function StarIcon({ kind }: { kind: StarKind }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local SVG icons with spaces in filename
    <img
      src={STAR_ICON[kind]}
      alt=""
      width={14}
      height={14}
      className="h-3 w-3 shrink-0 object-contain sm:h-3.5 sm:w-3.5"
      draggable={false}
      aria-hidden
    />
  );
}

/**
 * Always exactly 5 icons:
 *  5   → full full full full full
 *  4.5 → full full full full half
 *  4   → full full full full empty
 */
function StarRating({ value }: { value: 5 | 4.5 | 4 }) {
  const stars: StarKind[] = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    if (value >= n) return "full";
    if (value === 4.5 && n === 5) return "half";
    return "empty";
  });

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} out of 5 stars`}
      title={`${value} / 5`}
    >
      {stars.map((kind, i) => (
        <StarIcon key={`${value}-${kind}-${i}`} kind={kind} />
      ))}
    </span>
  );
}

function MetaPill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-0.5 rounded-[51px] border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[9px] font-medium leading-none text-[#999999] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px] sm:leading-normal ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Same card as Trending Now / New Releases rows on Movies page.
 */
export default function TrendingMovieCard({
  movie,
  showRuntime = true,
  showDate = false,
  showRating = false,
  fluid = false,
  fill = false,
  mediaKind = "movie",
}: Props) {
  const name = movie.title || movie.name || "Untitled";
  const src = cardImageUrl(movie, "w500");
  const date = movie.release_date || movie.first_air_date;
  const starValue = starsFromVote(
    Number(movie.vote_average) || 0,
    movie.id,
  );
  const href =
    mediaKind === "tv" ? `/shows/${movie.id}` : `/movies/${movie.id}`;

  return (
    <article
      className={`min-w-0 ${fluid || fill ? "h-full w-full" : "shrink-0"}`}
      style={fluid || fill ? undefined : { width: MEDIA_CARD_W }}
    >
      <Link
        href={href}
        className="group relative block h-full w-full overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] outline-none transition hover:border-cta/40 focus-visible:ring-2 focus-visible:ring-cta"
        style={
          fill
            ? { height: "100%", width: "100%" }
            : fluid
              ? { aspectRatio: `${MEDIA_CARD_W} / ${MEDIA_CARD_H}` }
              : { height: MEDIA_CARD_H, width: MEDIA_CARD_W }
        }
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
            sizes={fluid ? "(max-width:768px) 50vw, 25vw" : "285px"}
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-[#1A1A1A]" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-8 sm:p-3 sm:pt-10">
          <h3 className="truncate text-xs font-semibold text-white sm:text-sm">
            {name}
          </h3>
          {showDate && date ? (
            <p className="mt-0.5 truncate text-[10px] text-[#999999] sm:text-xs">
              Released at {formatDate(date)}
            </p>
          ) : null}
          <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-1 sm:mt-2 sm:gap-2">
            {showRuntime ? (
              <MetaPill className="min-w-0 shrink">
                <FiClock className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                <span className="truncate">{durationLabel(movie.id)}</span>
              </MetaPill>
            ) : (
              <span />
            )}
            {showRating ? (
              <MetaPill className="shrink-0 !gap-0.5 !px-1.5 sm:!gap-1 sm:!px-2">
                <StarRating value={starValue} />
              </MetaPill>
            ) : (
              <MetaPill className="shrink-0">
                <FiEye className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                {viewsLabel(movie.id)}
              </MetaPill>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
