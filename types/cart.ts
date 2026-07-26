export interface CartItem {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string;
  quantity: number;
  notes?: string;
}

export interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
