"use client";

import WatchPlayer from "@/components/WatchPlayer";
import type { MovieDetails } from "@/lib/types";

type Props = {
  movie: MovieDetails;
  relatedPosters?: any[];
};

function bestPlayKey(movie: MovieDetails): string | null {
  if ((movie as any).trailerKey) return (movie as any).trailerKey;
  const videos = (movie as any).videos ?? [];
  const pref = videos.find((v: any) => v.type === "Trailer") ?? videos[0];
  return pref?.key ?? null;
}

export default function WatchMovieView({ movie, relatedPosters = [] }: Props) {
  const playKey = bestPlayKey(movie);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <section className="relative w-full h-screen bg-black">
        {playKey ? (
          <WatchPlayer
            key={playKey}
            videoKey={playKey}
            title={movie.title}
            muted={false}
            subtitlesOn={false}
            subtitleLang={"en"}
            layout="fullscreen"
            onCaptionTracks={() => {}}
            className="!absolute !inset-0 !h-full !w-full !min-h-full !min-w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white">No video available</div>
        )}
      </section>

      <div className="page-container py-6">
        <h2 className="text-white text-2xl font-bold">{movie.title}</h2>
        <p className="mt-2 text-subtext">{movie.overview}</p>
      </div>
    </div>
  );
}
