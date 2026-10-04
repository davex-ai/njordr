export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string | null;
  image: string;
  stock: number;
  rating: number;
};

export type CartLine = {
  id: string;
  quantity: number;
  products: Pick<Product, "id" | "title" | "price" | "image" | "stock">;
};

export type OrderItem = { id: string; title: string; unit_price: number; quantity: number };
export type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};
