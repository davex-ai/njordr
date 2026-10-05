"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { CartLine } from "@/lib/types";

type Address = { full_name: string; phone: string; address_line: string; city: string; state: string };

export default function CartView() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [address, setAddress] = useState<Address | null | undefined>(undefined);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await createClient()
      .from("cart_items")
      .select("id, quantity, products(id, title, price, image, stock)")
      .order("created_at");
    setLines((data ?? []) as unknown as CartLine[]);
  }, []);

  useEffect(() => {
    createClient()
      .from("profiles")
      .select("full_name, phone, address_line, city, state")
      .maybeSingle()
      .then(({ data }) => setAddress((data as Address | null) ?? null));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // Live sync: changes made on another device (web or mobile) appear here immediately.
    // Load on (re)subscribe so no change is missed between the first fetch and the subscription.
    const channel = supabase
      .channel("cart-view")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, load)
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") load();
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  async function setQty(line: CartLine, qty: number) {
    const supabase = createClient();
    if (qty < 1) await supabase.from("cart_items").delete().eq("id", line.id);
    else await supabase.from("cart_items").update({ quantity: Math.min(qty, 99) }).eq("id", line.id);
    load();
  }

  async function placeOrder() {
    setPlacing(true);
    setError("");
    const res = await fetch("/api/checkout", { method: "POST" });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Checkout failed");
      setPlacing(false);
      return;
    }
    router.push(`/orders?placed=${body.orderId}&email=${body.emailSent ? 1 : 0}`);
  }

  if (lines === null) return <p className="text-muted">Loading your cart…</p>;
  if (lines.length === 0)
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="mt-1 text-muted">Find something you like in the shop.</p>
        <Link href="/products" className="btn btn-primary mt-5">
          Browse products
        </Link>
      </div>
    );

  const hasAddress = !!(address && address.full_name && address.phone && address.address_line && address.city && address.state);
  const total = lines.reduce((n, l) => n + l.products.price * l.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 rounded-xl bg-background">
              <Image src={l.products.image} alt={l.products.title} fill sizes="80px" className="object-contain p-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.products.title}</p>
              <p className="text-sm text-muted">{formatPrice(l.products.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="btn !px-3 !py-1" onClick={() => setQty(l, l.quantity - 1)} aria-label="Decrease quantity">
                  −
                </button>
                <span className="w-6 text-center text-sm">{l.quantity}</span>
                <button className="btn !px-3 !py-1" onClick={() => setQty(l, l.quantity + 1)} aria-label="Increase quantity">
                  +
                </button>
                <button className="ml-3 text-sm text-muted hover:text-foreground" onClick={() => setQty(l, 0)}>
                  Remove
                </button>
              </div>
            </div>
            <p className="font-semibold">{formatPrice(l.products.price * l.quantity)}</p>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-4 rounded-xl border border-line p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Deliver to</span>
            <Link href="/account?next=/cart" className="text-accent">
              {hasAddress ? "Change" : "Add address"}
            </Link>
          </div>
          {address === undefined ? (
            <p className="mt-1 text-muted">Loading…</p>
          ) : hasAddress ? (
            <p className="mt-1 text-muted">
              {address!.full_name}, {address!.address_line}, {address!.city}, {address!.state}
              <br />
              {address!.phone}
            </p>
          ) : (
            <p className="mt-1 text-muted">Add a delivery address to place your order.</p>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary mt-5 w-full" onClick={placeOrder} disabled={placing || !hasAddress}>
          {placing ? "Placing order…" : "Place order"}
        </button>
        <p className="mt-3 text-xs text-muted">Demo checkout: no payment is taken.</p>
      </aside>
    </div>
  );
}
