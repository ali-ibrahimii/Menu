"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { Food } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";

interface AddToCartButtonProps {
  food: Food;
  getFoodName: (food: Food) => string;
}

export default function AddToCartButton({
  food,
  getFoodName,
}: AddToCartButtonProps) {
  const [showControls, setShowControls] = useState(false);
  const { items, addToCart, removeFromCart, updateQuantity } = useCartStore();

  const { language } = useLanguage();
  const t = (key: string) => {
  const langTranslations = translations[language] as Record<string, string>;
  return langTranslations[key] || key;
};

  const cartItem = items.find((item) => item.id === food.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    const cartItem: Omit<CartItem, "quantity"> = {
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar,
      name_en: food.name_en,
      price: food.price,
      image_url: food.image_url,
    };

    addToCart(cartItem);
    setShowControls(true);
  };

  const handleIncrement = () => {
    updateQuantity(food.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      setShowControls(false);
    }
    updateQuantity(food.id, quantity - 1);
  };

  if (quantity > 0 || showControls) {
    return (
      <div className="flex items-center justify-between gap-2 mt-2">
        <Button
          size="sm"
          onClick={handleDecrement}
          disabled={quantity === 0}
          className="h-8 w-8 p-0 glass-btn"
        >
          <Minus size={14} />
        </Button>

        <span className="text-sm font-medium min-w-8 text-center">
          {quantity}
        </span>

        <Button
          size="sm"
          onClick={handleIncrement}
          className="h-8 w-8 p-0 glass-btn"
        >
          <Plus size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleAddToCart}
      className="w-full mt-2 glass-btn"
    >
      <Plus size={14} className="" />
      {t("addToCart")}
    </Button>
  );
}
