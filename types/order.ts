import { CartItem } from "./cart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customer_name: string;
  table_number?: string | null;
  branch_id: string;
  items: CartItem[];
  total_price: number;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};
