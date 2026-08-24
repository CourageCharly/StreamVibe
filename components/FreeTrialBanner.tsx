import Image from "next/image";
import Button from "@/components/ui/Button";
import GradientPanel from "@/components/GradientPanel";
import { posterUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";

type Props = {
  posters?: Movie[];
  /** CTA link — home free trial uses `/movies?from=free-trial` for section back */
  ctaHref?: string;
  className?: string;
};

/**
 * Start free trial card — posters + GradientPanel overlay (this card only).
 */
export default function FreeTrialBanner({
  posters = [],
  ctaHref = "/movies",
  className = "",
}: Props) {
  const pool =
    posters.length > 0
      ? posters
      : Array.from({ length: 24 }, (_, i) => ({
          id: 900 + i,
          title: `Title ${i}`,
          overview: "",
          poster_path: null as string | null,
          backdrop_path: null as string | null,
          vote_average: 0,
        }));

  const mid = Math.max(1, Math.ceil(pool.length / 2));
  const leftPool = pool.slice(0, mid);
  const rightPool =
    pool.slice(mid).length > 0 ? pool.slice(mid) : [...pool].reverse();

  function fill(source: typeof pool, count: number) {
    if (!source.length) return [] as typeof pool;
    const out: typeof pool = [];
    for (let i = 0; out.length < count; i++) {
      out.push(source[i % source.length]);
    }
    return out;
  }

  const leftTiles = fill(leftPool, 15);
  const rightTiles = fill(rightPool, 15);
  const allTiles = [...leftTiles, ...rightTiles];

  return (
    <section
      id="free-trial"
      className={["page-section min-w-0 !pb-14 sm:!pb-20 lg:!pb-24", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Card frame — taller on mobile only */}
      <div className="relative w-full min-w-0 min-h-[300px] overflow-hidden rounded-[12px] border border-[#1F1F1F] sm:min-h-[210px]">
        {/* Layer 0: movie posters */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 2,
            width: "100%",
            height: "100%",
          }}
        >
          {allTiles.map((movie, i) => {
            const src = posterUrl(movie.poster_path, "w342");
            return (
              <div
                key={`${movie.id}-${i}`}
                style={{ position: "relative", minWidth: 0, minHeight: 0 }}
              >
                {src ? (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="12vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(145deg, hsl(${(movie.id * 47) % 360} 30% 16%), hsl(${(movie.id * 47) % 360} 40% 6%)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Layer 1: gradient overlay — free trial card only */}
        <GradientPanel />

        {/* Layer 2: copy + CTA — centered on mobile, split on sm+ */}
        <div className="relative z-[3] flex min-h-[300px] min-w-0 flex-col items-center justify-center gap-8 px-4 py-10 sm:min-h-[210px] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          {/* Mobile: slightly more space subtext → CTA (gap-8); web row gap-8 unchanged */}
          <div className="w-full min-w-0 max-w-[560px] shrink-0 text-center sm:flex-1 sm:text-left">
            <h2 className="text-center text-[20px] font-bold leading-[1.2] tracking-tight text-white sm:text-left sm:text-[28px]">
              <span className="sm:hidden">
                <span className="block">Start your free trial</span>
                <span className="block">today!</span>
              </span>
              <span className="hidden sm:inline">
                Start your free trial today!
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-[32rem] text-center text-[14px] font-normal leading-[1.5] text-[#999999] sm:mx-0 sm:max-w-full sm:text-left sm:text-[16px] sm:text-pretty">
              {/* Mobile: fixed 3-line break · Web: single flowing paragraph */}
              <span className="sm:hidden">
                This is a clear and concise call to action that
                <br />
                encourages users to sign up for a free trial of
                <br />
                StreamVibe.
              </span>
              <span className="hidden sm:inline">
                This is a clear and concise call to action that encourages users
                to sign up for a free trial of StreamVibe.
              </span>
            </p>
          </div>

          <Button href={ctaHref} className="mx-auto shrink-0 sm:mx-0">
            Start a Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}
