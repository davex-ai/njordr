import Image from "next/image";
import Link from "next/link";
import { formatPrice, titleCase } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/products/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-background">
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-4 transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted">{titleCase(p.category)}</span>
        <h3 className="line-clamp-2 text-sm font-medium">{p.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">{formatPrice(p.price)}</span>
          <span className="text-xs text-muted">★ {Number(p.rating).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
