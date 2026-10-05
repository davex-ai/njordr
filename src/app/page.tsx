import Link from "next/link";
import CategorySlider, { type CategoryCard } from "@/components/CategorySlider";
import HeroMosaic from "@/components/HeroMosaic";
import ProductCard from "@/components/ProductCard";
import { titleCase } from "@/lib/format";
import { getHeroImages } from "@/lib/hero-images";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: featured }, { data: all }, heroImages] = await Promise.all([
    supabase.from("products").select("*").order("rating", { ascending: false }).limit(8),
    supabase.from("products").select("category, image, rating"),
    getHeroImages(supabase),
  ]);

  // One card per category, pictured with its best-rated product.
  const byCategory = new Map<string, CategoryCard & { best: number }>();
  for (const p of all ?? []) {
    const cur = byCategory.get(p.category);
    const rating = Number(p.rating);
    if (!cur) byCategory.set(p.category, { slug: p.category, label: titleCase(p.category), image: p.image, count: 1, best: rating });
    else {
      cur.count++;
      if (rating > cur.best) Object.assign(cur, { image: p.image, best: rating });
    }
  }
  const categories = [...byCategory.values()].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-12 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Trade, reimagined</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Things worth having, <span className="text-accent">delivered.</span>
          </h1>
          <p className="mt-5 max-w-md text-muted">
            Njörðr brings a curated range of beauty, home, fashion and everyday essentials to one clean, fast storefront.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary !px-6 !py-3">
              Shop now
            </Link>
            <a href="#categories" className="btn !px-6 !py-3">
              Browse categories
            </a>
          </div>
        </div>
        <HeroMosaic images={heroImages} />
      </section>

      {categories.length > 0 && (
        <section id="categories" className="scroll-mt-24">
          <CategorySlider categories={categories} />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Top rated</h2>
          <Link href="/products" className="text-sm text-accent">
            View all →
          </Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(featured as Product[]).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No products yet. Run the seed script to load the catalog.</p>
        )}
      </section>
    </div>
  );
}
