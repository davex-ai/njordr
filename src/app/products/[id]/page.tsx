import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import BackButton from "@/components/BackButton";
import ProductCard from "@/components/ProductCard";
import { formatPrice, titleCase } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const SIMILAR = 4;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const p = data as Product;

  // Same category first, topped up with the best-rated others if the category is small.
  const { data: sameCategory } = await supabase
    .from("products")
    .select("*")
    .eq("category", p.category)
    .neq("id", p.id)
    .order("rating", { ascending: false })
    .limit(SIMILAR);
  let similar = (sameCategory ?? []) as Product[];
  if (similar.length < SIMILAR) {
    const { data: more } = await supabase
      .from("products")
      .select("*")
      .neq("category", p.category)
      .order("rating", { ascending: false })
      .limit(SIMILAR - similar.length);
    similar = [...similar, ...((more ?? []) as Product[])];
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton />
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/products?category=${p.category}`} className="hover:text-foreground">
            {titleCase(p.category)}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{p.title}</span>
        </nav>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square rounded-3xl border border-line bg-surface">
          <Image src={p.image} alt={p.title} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-8" />
        </div>
        <div className="flex flex-col gap-4">
          <Link href={`/products?category=${p.category}`} className="text-sm uppercase tracking-wide text-accent">
            {titleCase(p.category)}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
          {p.brand && <p className="text-muted">by {p.brand}</p>}
          <p className="text-2xl font-semibold">{formatPrice(p.price)}</p>
          <p className="text-sm text-muted">
            ★ {Number(p.rating).toFixed(1)} · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </p>
          <p className="leading-relaxed text-muted">{p.description}</p>
          <div className="pt-2">
            <AddToCart productId={p.id} stock={p.stock} />
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-line pt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Similar products</h2>
            <Link href={`/products?category=${p.category}`} className="text-sm text-accent">
              More in {titleCase(p.category)} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {similar.map((s) => (
              <ProductCard key={s.id} p={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
