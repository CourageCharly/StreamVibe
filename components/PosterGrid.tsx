import PosterCard from "@/components/PosterCard";
import HeroMobileCollage from "@/components/HeroMobileCollage";
import { posterUrl } from "@/lib/media";
import type { Movie } from "@/lib/types";

type PosterGridProps = {
  posters: Movie[];
  count?: number;
  className?: string;
};

/** Desktop / sm+ play collage — design tile size */
export const HERO_TILE_W = 151.11;
export const HERO_TILE_H = 200;
export const HERO_TILE_RADIUS = 12;
export const HERO_COLS = 9;
export const HERO_ROWS = 4;
export const HERO_GAP = 8;
export const HERO_TILE_COUNT = HERO_COLS * HERO_ROWS;

/** Mobile hero collage — exact design cards */
export const MOBILE_HERO_TILE_W = 134;
export const MOBILE_HERO_TILE_H = 143;
/** 4th row is a short strip only */
export const MOBILE_HERO_TILE_H_LAST = 39;
export const MOBILE_HERO_TILE_RADIUS = 4;
export const MOBILE_HERO_COLS = 3;
export const MOBILE_HERO_ROWS = 4;
export const MOBILE_HERO_GAP = 8;
export const MOBILE_HERO_TILE_COUNT = MOBILE_HERO_COLS * MOBILE_HERO_ROWS; // 12

/**
 * Hero poster collage.
 * Mobile: 3 cols × 4 rows (rows 1–3: 143px, row 4: 39px), radius 4, gap 8.
 * Desktop: 9×4 of 151.11×200 tiles, radius 12px.
 */
export default function PosterGrid({
  posters,
  count = HERO_TILE_COUNT,
  className = "",
}: PosterGridProps) {
  const source =
    posters.length > 0
      ? posters
      : Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          title: `Poster ${i + 1}`,
          overview: "",
          poster_path: null as string | null,
          backdrop_path: null as string | null,
          vote_average: 0,
        }));

  const tiles: Movie[] = [];
  while (tiles.length < Math.max(count, MOBILE_HERO_TILE_COUNT)) {
    tiles.push(...source);
  }
  const desktopGrid = tiles.slice(0, count);
  const mobileGrid = tiles.slice(0, MOBILE_HERO_TILE_COUNT);

  const gridW = HERO_COLS * HERO_TILE_W + (HERO_COLS - 1) * HERO_GAP;
  const gridH = HERO_ROWS * HERO_TILE_H + (HERO_ROWS - 1) * HERO_GAP;

  return (
    <div
      className={["absolute inset-0 overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {/* Mobile — covers full hero including under nav (like web) */}
      <HeroMobileCollage>
        {mobileGrid.map((movie, index) => {
          const title = movie.title || movie.name || "Movie";
          const imageUrl = posterUrl(movie.poster_path, "w342");
          return (
            <div
              key={`m-${movie.id}-${index}`}
              className="relative h-full min-h-0 min-w-0 w-full overflow-hidden"
              style={{
                borderRadius: MOBILE_HERO_TILE_RADIUS,
                boxSizing: "border-box",
              }}
            >
              <PosterCard
                title={title}
                imageUrl={imageUrl}
                showLabel={false}
                showOverlays
                interactive={false}
                className="!aspect-auto absolute inset-0 !h-full !w-full !min-h-0 !min-w-0 !max-w-none !rounded-[4px] object-cover"
                sizes="40vw"
                priority={index < 8}
              />
            </div>
          );
        })}
      </HeroMobileCollage>

      {/* sm+ — oversized collage centered so tiles sit under the nav */}
      <div
        className="absolute left-1/2 top-1/2 hidden grid sm:grid"
        style={{
          width: gridW,
          height: gridH,
          gap: HERO_GAP,
          gridTemplateColumns: `repeat(${HERO_COLS}, ${HERO_TILE_W}px)`,
          gridTemplateRows: `repeat(${HERO_ROWS}, ${HERO_TILE_H}px)`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {desktopGrid.map((movie, index) => {
          const title = movie.title || movie.name || "Movie";
          const imageUrl = posterUrl(movie.poster_path, "w342");

          return (
            <div
              key={`d-${movie.id}-${index}`}
              className="relative overflow-hidden"
              style={{
                width: HERO_TILE_W,
                height: HERO_TILE_H,
                borderRadius: HERO_TILE_RADIUS,
              }}
            >
              <PosterCard
                title={title}
                imageUrl={imageUrl}
                showLabel={false}
                showOverlays
                interactive={false}
                className="!aspect-auto absolute inset-0 h-full w-full min-h-0 min-w-0"
                sizes="152px"
                priority={index < 12}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
