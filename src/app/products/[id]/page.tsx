import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import { formatPrice, titleCase } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const p = data as Product;

  return (
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
  );
}
