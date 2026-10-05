import { createClient as createSupabase } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { sendOrderEmail } from "@/lib/brevo";

// Used by web (cookie session) and mobile (Authorization: Bearer <supabase access token>).
export async function POST(request: Request) {
  const bearer = request.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;

  const supabase = token
    ? createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      })
    : await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser(token ?? undefined);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: orderId, error } = await supabase.rpc("place_order");
  if (error || !orderId) {
    return NextResponse.json({ error: error?.message ?? "Checkout failed" }, { status: 400 });
  }

  const [{ data: order }, { data: lines }] = await Promise.all([
    supabase
      .from("orders")
      .select("total, ship_name, ship_phone, ship_address, ship_city, ship_state")
      .eq("id", orderId)
      .single(),
    supabase.from("order_items").select("title, unit_price, quantity").eq("order_id", orderId),
  ]);

  let emailSent = false;
  if (user.email && order && lines) {
    try {
      emailSent = await sendOrderEmail({
        to: user.email,
        orderId,
        lines: lines.map((l) => ({ ...l, unit_price: Number(l.unit_price) })),
        total: Number(order.total),
        address: order.ship_address
          ? [order.ship_name, order.ship_address, order.ship_city, order.ship_state, order.ship_phone].filter(Boolean).join(", ")
          : undefined,
      });
    } catch (e) {
      console.error("Order email failed", e);
    }
  }

  return NextResponse.json({ orderId, emailSent });
}
