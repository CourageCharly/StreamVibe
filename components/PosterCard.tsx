import Image from "next/image";
import GradientOverlay from "@/components/GradientOverlay";

export type PosterCardProps = {
  title: string;
  imageUrl: string | null;
  badge?: string;
  /** Show title/badge labels */
  showLabel?: boolean;
  /** Design fade overlay → #1A1A1A */
  showOverlays?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  interactive?: boolean;
};

function placeholderStyle(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 17) % 360;
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${h} 40% 22%), hsl(${h} 50% 8%))`,
  };
}

/**
 * Poster tile with design GradientOverlay (fade to #1A1A1A).
 */
export default function PosterCard({
  title,
  imageUrl,
  badge,
  showLabel = true,
  showOverlays = true,
  className = "",
  sizes = "(max-width: 768px) 50vw, 20vw",
  priority = false,
  interactive = false,
}: PosterCardProps) {
  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-md",
        // Default poster ratio; parent may override with className (e.g. absolute fill)
        className.includes("aspect-") || className.includes("!aspect")
          ? ""
          : "aspect-[2/3]",
        interactive ? "group cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || "Poster"}
          fill
          sizes={sizes}
          className="object-cover object-center"
          priority={priority}
        />
      ) : (
        <div
          className="absolute inset-0 h-full w-full"
          style={placeholderStyle(title || "poster")}
          aria-hidden={!title}
          aria-label={title || undefined}
        />
      )}

      {showOverlays ? (
        <GradientOverlay
          variant="poster"
          direction="to bottom"
          className="z-[1]"
        />
      ) : null}

      {interactive ? (
        <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
      ) : null}

      {showLabel ? (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          {badge ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {badge}
            </span>
          ) : null}
          {title ? (
            <h3 className="text-lg font-bold text-white drop-shadow">{title}</h3>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
