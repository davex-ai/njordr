import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartBadge from "@/components/CartBadge";
import Logo from "@/components/Logo";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Njörðr home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/products" className="hover:text-accent">
            Shop
          </Link>
          {user ? (
            <>
              <Link href="/orders" className="hover:text-accent">
                Orders
              </Link>
              <Link href="/account" className="hover:text-accent">
                Account
              </Link>
              <CartBadge />
              <form action="/auth/signout" method="post">
                <button className="text-muted hover:text-foreground">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
