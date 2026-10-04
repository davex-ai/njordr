import CartView from "@/components/CartView";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      <CartView />
    </div>
  );
}
