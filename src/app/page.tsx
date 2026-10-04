import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { titleCase } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: featured }, { data: cats }] = await Promise.all([
    supabase.from("products").select("*").order("rating", { ascending: false }).limit(8),
    supabase.from("products").select("category"),
  ]);
  const categories = [...new Set((cats ?? []).map((c) => c.category as string))].slice(0, 8);

  return (
    <div className="space-y-16">
      <section className="rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-12 sm:py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Trade, reimagined</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Things worth having, <span className="text-accent">delivered.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted">
          Njörðr brings a curated range of beauty, home, tech and everyday essentials to one clean, fast storefront.
        </p>
        <Link href="/products" className="btn btn-primary mt-8 !px-6 !py-3">
          Shop now
        </Link>
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Browse by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c} href={`/products?category=${c}`} className="btn">
                {titleCase(c)}
              </Link>
            ))}
          </div>
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
