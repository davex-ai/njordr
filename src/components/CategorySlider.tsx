"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type CategoryCard = { slug: string; label: string; image: string; count: number };

const TINTS = ["bg-[#e8eef2]", "bg-[#efe9e1]", "bg-[#e6efe9]", "bg-[#efe6ea]", "bg-[#eceaf3]", "bg-[#f1eee0]"];

export default function CategorySlider({ categories }: { categories: CategoryCard[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Our categories</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="btn !h-9 !w-9 !p-0" aria-label="Previous categories">
            ←
          </button>
          <button onClick={() => scroll(1)} className="btn !h-9 !w-9 !p-0" aria-label="Next categories">
            →
          </button>
        </div>
      </div>

      <div ref={track} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            className={`fade-up group relative h-72 w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-line transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-64 ${TINTS[i % TINTS.length]}`}>
            <Image
              src={c.image}
              alt=""
              fill
              sizes="256px"
              className="object-contain p-6 pb-20 transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
              <p className="font-semibold">{c.label}</p>
              <p className="text-xs text-white/80">{c.count} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
