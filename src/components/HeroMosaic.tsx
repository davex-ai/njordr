"use client";

import { useEffect, useState } from "react";
import type { HeroImage } from "@/lib/hero-images";

type Column = { sets: [HeroImage[], HeroImage[]]; dir: "up" | "down"; seconds: number };

const SET_SIZE = 6;
const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]"];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomSet(pool: HeroImage[]): HeroImage[] {
  const s = shuffle(pool).slice(0, SET_SIZE);
  // Small pools: repeat so the set is always long enough to fill the column.
  while (s.length < SET_SIZE) s.push(pool[s.length % pool.length]);
  return s;
}

export default function HeroMosaic({ images }: { images: HeroImage[] }) {
  const [cols, setCols] = useState<Column[]>([]);

  useEffect(() => {
    if (images.length === 0) return;
    const count = window.matchMedia("(min-width: 1024px)").matches ? 4 : 3;
    const next: Column[] = Array.from({ length: count }, () => ({
      sets: [randomSet(images), randomSet(images)],
      dir: Math.random() < 0.5 ? "up" : "down",
      seconds: 30 + Math.random() * 25,
    }));
    // Make sure not every column moves the same way.
    if (next.every((c) => c.dir === next[0].dir)) next[next.length - 1].dir = next[0].dir === "up" ? "down" : "up";
    // Randomised after mount (not during render) so server and client markup match.
    const frame = requestAnimationFrame(() => setCols(next));
    return () => cancelAnimationFrame(frame);
  }, [images]);

  // At the end of each loop the visible set becomes the off-screen one and a fresh random set
  // is brought in on the other side, so the swap is invisible and new photos keep arriving.
  function onLoop(i: number) {
    setCols((prev) =>
      prev.map((c, idx) => {
        if (idx !== i) return c;
        const fresh = randomSet(images);
        return { ...c, sets: c.dir === "up" ? [c.sets[1], fresh] : [fresh, c.sets[0]] };
      }),
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative grid h-[26rem] gap-3 overflow-hidden rounded-2xl transition-opacity duration-700 sm:h-[30rem] ${cols.length ? "opacity-100" : "opacity-0"}`}
      style={{
        gridTemplateColumns: `repeat(${Math.max(cols.length, 1)}, minmax(0, 1fr))`,
        maskImage: "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)",
      }}>
      {cols.map((col, i) => (
        <div key={i} className="marquee-col overflow-hidden">
          <div
            className={`marquee-y ${col.dir === "down" ? "reverse" : ""}`}
            style={{ ["--dur" as string]: `${col.seconds}s` }}
            onAnimationIteration={() => onLoop(i)}>
            {col.sets.flat().map((img, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={k}
                src={img.src}
                alt=""
                loading="lazy"
                className={`mb-3 w-full rounded-xl bg-background object-cover ${ASPECTS[(k + i) % ASPECTS.length]}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
