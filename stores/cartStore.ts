import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.id === item.id 
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      
      removeFromCart: (id) => {
        const { items } = get();
        set({ items: items.filter(i => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          items: items.map(i =>
            i.id === id ? { ...i, quantity } : i
          )
        });
      },
      
      updateNotes: (id, notes) => {
        const { items } = get();
        set({
          items: items.map(i =>
            i.id === id ? { ...i, notes } : i
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);