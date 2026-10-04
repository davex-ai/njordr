"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.from("cart_items").select("quantity");
      setCount((data ?? []).reduce((n, r) => n + r.quantity, 0));
    };
    load();
    const channel = supabase
      .channel("cart-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/cart" className="hover:text-accent">
      Cart{count > 0 && <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-fg">{count}</span>}
    </Link>
  );
}
