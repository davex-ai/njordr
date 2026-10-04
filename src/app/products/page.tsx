import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { titleCase } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const supabase = await createClient();

  let query = supabase.from("products").select("*", { count: "exact" }).order("id");
  if (q) query = query.ilike("title", `%${q.replace(/[%,]/g, "")}%`);
  if (category) query = query.eq("category", category);
  const from = (pageNum - 1) * PAGE_SIZE;
  const [{ data, count }, { data: cats }] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    supabase.from("products").select("category"),
  ]);
  const categories = [...new Set((cats ?? []).map((c) => c.category as string))].sort();
  const pages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const href = (over: Record<string, string>) => {
    const params = new URLSearchParams({ q, category, page: "1", ...over });
    [...params.keys()].forEach((k) => !params.get(k) && params.delete(k));
    return `/products?${params}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{category ? titleCase(category) : "All products"}</h1>
        <form action="/products" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input name="q" defaultValue={q} placeholder="Search products" className="input sm:w-64" aria-label="Search products" />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={href({ category: "" })} className={`btn ${!category ? "btn-primary" : ""}`}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c} href={href({ category: c })} className={`btn ${category === c ? "btn-primary" : ""}`}>
            {titleCase(c)}
          </Link>
        ))}
      </div>

      {data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(data as Product[]).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No products match your search.</p>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          {pageNum > 1 && (
            <Link href={href({ page: String(pageNum - 1) })} className="btn">
              ← Previous
            </Link>
          )}
          <span className="text-muted">
            Page {pageNum} of {pages}
          </span>
          {pageNum < pages && (
            <Link href={href({ page: String(pageNum + 1) })} className="btn">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
