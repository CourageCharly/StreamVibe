"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Keep in sync with PosterGrid mobile constants */
const COLS = 3;
const ROWS = 4;
const TILE_W = 134;
const TILE_H = 143;
const TILE_H_LAST = 39;
const GAP = 8;

/**
 * Mobile collage: 3×4 tiles, gap 8.
 * Sizes tiles in real pixels (no CSS scale) so YouTube iframes can play.
 * Pinned to top so nav sits on the images.
 */
export default function HeroMobileCollage({ children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [tileW, setTileW] = useState(TILE_W);
  const [tileH, setTileH] = useState(TILE_H);
  const [tileHLast, setTileHLast] = useState(TILE_H_LAST);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const apply = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const w = (width - (COLS - 1) * GAP) / COLS;
      const s = w / TILE_W;
      setTileW(w);
      setTileH(TILE_H * s);
      setTileHLast(TILE_H_LAST * s);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gridH = (ROWS - 1) * tileH + tileHLast + (ROWS - 1) * GAP;

  return (
    <div
      ref={boxRef}
      className="absolute inset-0 overflow-hidden sm:hidden"
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 grid w-full"
        style={{
          height: gridH,
          gap: GAP,
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS - 1}, ${tileH}px) ${tileHLast}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
