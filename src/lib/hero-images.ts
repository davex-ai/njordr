import type { SupabaseClient } from "@supabase/supabase-js";

export type HeroImage = { src: string; alt: string };

// Hero photos are limited to these themes.
const QUERIES = ["food", "jewelry", "clothes", "fashion accessories"];

// Product categories that match the same themes, used when no Unsplash key is set.
const FALLBACK_CATEGORIES = [
  "groceries",
  "womens-jewellery",
  "womens-dresses",
  "mens-shirts",
  "tops",
  "sunglasses",
  "womens-bags",
  "mens-watches",
  "womens-watches",
  "womens-shoes",
];

type UnsplashResult = { alt_description: string | null; urls: { small: string } };

export async function getHeroImages(supabase: SupabaseClient): Promise<HeroImage[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;

  if (key) {
    try {
      const groups = await Promise.all(
        QUERIES.map(async (q) => {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=portrait&content_filter=high`,
            { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 86400 } },
          );
          if (!res.ok) return [];
          const json = (await res.json()) as { results: UnsplashResult[] };
          return json.results.map((r) => ({ src: r.urls.small, alt: r.alt_description ?? q }));
        }),
      );
      const all = groups.flat();
      if (all.length >= 12) return all;
    } catch {
      // fall through to product photos
    }
  }

  const { data } = await supabase
    .from("products")
    .select("image, title")
    .in("category", FALLBACK_CATEGORIES)
    .limit(60);
  return (data ?? []).map((p) => ({ src: p.image as string, alt: p.title as string }));
}
