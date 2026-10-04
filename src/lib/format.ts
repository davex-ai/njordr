// Prices are stored in USD (DummyJSON) and displayed in naira at a display-only rate.
const rate = Number(process.env.NEXT_PUBLIC_USD_NGN ?? 1500);
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatPrice = (usd: number) => naira.format(usd * rate);

export const titleCase = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
