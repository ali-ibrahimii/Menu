export interface CartItem {
  /** شناسه‌ی محصول در دیتابیس */
  id: string;
  /** شناسه‌ی وزن/نوع (محصولات وزن‌دار فروشگاهی) */
  variant_id?: string;
  variant_label_fa?: string;
  variant_label_ar?: string;
  variant_label_en?: string;
  weight_grams?: number;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string;
  quantity: number;
  notes?: string;
  is_store_item?: boolean;
}

export interface CartStore {
  items: CartItem[];

  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNotes: (key: string, notes: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
