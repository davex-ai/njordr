"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddToCart({ productId, stock }: { productId: number; stock: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "added">("idle");

  async function add() {
    setState("busy");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    const { data: existing } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("product_id", productId)
      .maybeSingle();
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: productId, quantity: Math.min((existing?.quantity ?? 0) + 1, 99) },
      { onConflict: "user_id,product_id" },
    );
    setState(error ? "idle" : "added");
    if (!error) setTimeout(() => setState("idle"), 1500);
  }

  return (
    <button onClick={add} disabled={stock < 1 || state === "busy"} className="btn btn-primary w-full sm:w-auto">
      {stock < 1 ? "Out of stock" : state === "added" ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
