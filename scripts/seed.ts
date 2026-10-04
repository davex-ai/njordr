// Seeds our own products table from DummyJSON (one-off).
// Run: npm run seed   (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { createClient } from "@supabase/supabase-js";

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  thumbnail: string;
  images?: string[];
  stock: number;
  rating: number;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const res = await fetch("https://dummyjson.com/products?limit=0");
  if (!res.ok) throw new Error(`DummyJSON responded ${res.status}`);
  const { products } = (await res.json()) as { products: DummyProduct[] };

  const rows = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    brand: p.brand ?? null,
    image: p.images?.[0] ?? p.thumbnail,
    stock: p.stock,
    rating: p.rating,
  }));

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from("products").upsert(rows.slice(i, i + 100));
    if (error) throw error;
  }
  console.log(`Seeded ${rows.length} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
