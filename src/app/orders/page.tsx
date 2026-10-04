import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string; email?: string }>;
}) {
  const { placed, email } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, total, status, created_at, order_items(id, title, unit_price, quantity)")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as unknown as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>

      {placed && (
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
          <p className="font-medium">Order #{placed.slice(0, 8).toUpperCase()} placed. Thank you!</p>
          <p className="text-muted">
            {email === "1" ? "A confirmation email is on its way." : "We couldn't send the confirmation email, but your order is saved."}
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-medium">No orders yet</p>
          <Link href="/products" className="btn btn-primary mt-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted">{new Date(o.created_at).toLocaleString("en-NG")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(Number(o.total))}</p>
                  <p className="text-xs uppercase tracking-wide text-accent">{o.status}</p>
                </div>
              </div>
              <ul className="mt-3 divide-y divide-line border-t border-line text-sm">
                {o.order_items.map((i) => (
                  <li key={i.id} className="flex justify-between py-2">
                    <span>
                      {i.title} <span className="text-muted">× {i.quantity}</span>
                    </span>
                    <span>{formatPrice(Number(i.unit_price) * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
