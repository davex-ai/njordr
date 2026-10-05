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
  ship_name: string | null;
  ship_phone: string | null;
  ship_address: string | null;
  ship_city: string | null;
  ship_state: string | null;
  order_items: OrderItem[];
};
