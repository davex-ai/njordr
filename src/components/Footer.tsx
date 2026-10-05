import Link from "next/link";
import Logo from "@/components/Logo";

const shop = [
  ["All products", "/products"],
  ["Beauty", "/products?category=beauty"],
  ["Fragrances", "/products?category=fragrances"],
  ["Home décor", "/products?category=home-decoration"],
  ["Jewellery", "/products?category=womens-jewellery"],
  ["Watches", "/products?category=mens-watches"],
];
const account = [
  ["Sign in", "/login"],
  ["My orders", "/orders"],
  ["Cart", "/cart"],
  ["Delivery address", "/account"],
];
const company = [
  ["About Njörðr", "/info/about"],
  ["Shipping", "/info/shipping"],
  ["Returns", "/info/returns"],
  ["Contact", "/info/contact"],
  ["Privacy", "/info/privacy"],
];

function Column({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm text-muted">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" aria-label="Njörðr home">
            <Logo />
          </Link>
          <p className="max-w-xs text-sm text-muted">
            A modern marketplace for beauty, home, fashion and everyday essentials, delivered to your door.
          </p>
        </div>
        <Column title="Shop" links={shop} />
        <Column title="Account" links={account} />
        <Column title="Company" links={company} />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Njörðr. All rights reserved.</p>
          <p>
            Photography via{" "}
            <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline">
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
