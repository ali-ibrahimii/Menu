"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useCartStore, CartItem, cartKey } from "@/stores/cartStore";
import type { Food } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { translations } from "@/translations/translation";
import { getDefaultShopVariant, isShopBranchSlug } from "@/lib/shopWeights";

interface AddToCartButtonProps {
  food: Food;
  getFoodName: (food: Food) => string;
}

export default function AddToCartButton({
  food,
  getFoodName,
}: AddToCartButtonProps) {
  const [showControls, setShowControls] = useState(false);
  const { items, addToCart, updateQuantity } = useCartStore();
  const { selectedBranch } = useBranch();

  const { language } = useLanguage();
  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  /**
   * در شعبه‌ی فروشگاهی (سوغات وطن‌دار) محصولات وزنی هستند؛ دکمه‌ی سریع
   * همان وزن پیش‌فرض پنل جزئیات (۱ کیلوگرم) را به سبد اضافه می‌کند تا
   * قیمت سبد با پنل جزئیات یکی باشد.
   */
  const isShopBranch = isShopBranchSlug(selectedBranch?.slug);
  const shopVariant = useMemo(
    () => (isShopBranch ? getDefaultShopVariant(food) : null),
    [food, isShopBranch],
  );

  const lineKey = shopVariant
    ? `${food.id}::${shopVariant.variant_id}`
    : food.id;

  const cartItem = items.find((item) => cartKey(item) === lineKey);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    const newCartItem: Omit<CartItem, "quantity"> = {
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar || food.name_fa,
      name_en: food.name_en || food.name_fa,
      price: shopVariant ? shopVariant.price : food.price,
      image_url: food.image_url,
      is_store_item: !!food.is_store_item || isShopBranch,
      ...(shopVariant
        ? {
            variant_id: shopVariant.variant_id,
            weight_grams: shopVariant.weight_grams,
            variant_label_fa: shopVariant.variant_label_fa,
            variant_label_ar: shopVariant.variant_label_ar,
            variant_label_en: shopVariant.variant_label_en,
          }
        : {}),
    };

    addToCart(newCartItem);
    setShowControls(true);
  };

  const handleIncrement = () => {
    updateQuantity(lineKey, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      setShowControls(false);
    }
    updateQuantity(lineKey, quantity - 1);
  };

  if (quantity > 0 || showControls) {
    return (
      <div className="flex items-center justify-between gap-2 mt-2">
        <Button
          size="sm"
          onClick={handleDecrement}
          disabled={quantity === 0}
          className="h-8 w-8 p-0 glass-cart-btn"
        >
          <Minus size={14} />
        </Button>

        <span className="text-sm font-medium min-w-8 text-center">
          {quantity}
        </span>

        <Button
          size="sm"
          onClick={handleIncrement}
          className="h-8 w-8 p-0 glass-cart-btn"
        >
          <Plus size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={handleAddToCart} className="mt-2 glass-cart-btn">
      <Plus size={14} className="" />
      {t("addToCart")}
    </Button>
  );
}
