import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  /** شناسه‌ی محصول در دیتابیس (بدون تغییر) */
  id: string;
  /**
   * شناسه‌ی نوع/وزن محصول (فقط محصولات وزن‌دار فروشگاهی).
   * با این فیلد، «نیم کیلو کشمش» و «یک کیلو کشمش» دو ردیف جدا در سبد هستند.
   */
  variant_id?: string;
  /** نام وزن در رسید و سبد خرید، مثل «نیم کیلوگرم» */
  variant_label_fa?: string;
  variant_label_ar?: string;
  variant_label_en?: string;
  /** وزن به گرم */
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

/**
 * کلید یکتای هر ردیف سبد خرید.
 * محصولات بدون وزن (رستوران) همان id قدیمی را دارند، بنابراین سبدهای
 * ذخیره‌شده‌ی قبلی بدون مشکل کار می‌کنند.
 */
export const cartKey = (item: Pick<CartItem, 'id' | 'variant_id'>): string =>
  item.variant_id ? `${item.id}::${item.variant_id}` : item.id;

/** نام وزن یک ردیف بر اساس زبان */
export const cartVariantLabel = (
  item: Pick<CartItem, 'variant_label_fa' | 'variant_label_ar' | 'variant_label_en' | 'weight_grams'>,
  language: 'fa' | 'ar' | 'en',
): string => {
  if (language === 'en') return item.variant_label_en || '';
  if (language === 'ar') return item.variant_label_ar || item.variant_label_fa || '';
  return item.variant_label_fa || '';
};

interface CartStore {
  items: CartItem[];

  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  /** `key` از تابع cartKey می‌آید (برای محصولات بدون وزن همان id است) */
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNotes: (key: string, notes: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item, quantity = 1) => {
        const addQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
        const { items } = get();
        const key = cartKey(item);
        const existingItem = items.find(i => cartKey(i) === key);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              cartKey(i) === key
                ? { ...i, quantity: i.quantity + addQty }
                : i
            )
          });
        } else {
          set({ items: [...items, { ...item, quantity: addQty }] });
        }
      },
      
      removeFromCart: (key) => {
        const { items } = get();
        set({ items: items.filter(i => cartKey(i) !== key) });
      },
      
      updateQuantity: (key, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeFromCart(key);
          return;
        }
        set({
          items: items.map(i =>
            cartKey(i) === key ? { ...i, quantity } : i
          )
        });
      },
      
      updateNotes: (key, notes) => {
        const { items } = get();
        set({
          items: items.map(i =>
            cartKey(i) === key ? { ...i, notes } : i
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
