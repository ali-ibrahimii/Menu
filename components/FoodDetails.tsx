"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState } from "react";
import { Food } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Flame,
  Leaf,
  ShoppingCart,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartStore } from "@/stores/cartStore";
import RatingSystem from "@/components/RatingSystem";
import { translations } from "@/translations/translation";
import { toast } from "sonner";

interface FoodDetailsProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
  getFoodName: (food: Food) => string;
  getIngredients: (food: Food) => string;
  getFoodDescription: (food: Food) => string;
}

export default function FoodDetails({
  food,
  isOpen,
  onClose,
  getFoodName,
  getIngredients,
  getFoodDescription,
}: FoodDetailsProps) {
  const { language } = useLanguage();
  const { addToCart } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const handleAddToCart = () => {
    if (!food) return;

    const cartItem = {
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar,
      name_en: food.name_en,
      price: food.price,
      image_url: food.image_url,
    };

    addToCart(cartItem);
    toast.success("به سفارشات شما اضافه شد!");
    onClose();
  };

  const images = food.images && food.images.length > 0 ? food.images : [food.image_url];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] aspect-auto">
       

        <DrawerHeader className="pt-5">
          <DrawerTitle className="text-3xl py-1 font-bold text-center">
            {getFoodName(food)}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {getIngredients(food)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* بخش تصاویر */}
            <div className="space-y-4">
              {/* تصویر اصلی */}
              <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg">
                <img
                  src={images[selectedImageIndex]}
                  alt={getFoodName(food)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* گالری تصاویر */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-green-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${getFoodName(food)} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* بخش اطلاعات */}
            <div className="space-y-6">
              {/* عنوان و قیمت */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-[26px] font-bold text-gray-900">
                    {getFoodName(food)}
                  </h1>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {food.price.toLocaleString()} تومان
                    </div>
                    <Badge
                      variant={food.is_available ? "default" : "destructive"}
                      className="mt-2 pb-1.5"
                    >
                      {food.is_available ? t("available") : t("notAvailable")}
                    </Badge>
                  </div>
                </div>

                {/* دسته‌بندی و تگ‌ها */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    {t("category")}: {food.category}
                  </Badge>

                  {food.is_spicy && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Flame size={14} />
                      {t("spicy")}
                    </Badge>
                  )}

                  {food.is_vegetarian && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Leaf size={14} />
                      {t("vegetarian")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* توضیحات */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-snug text-md">
                  {getFoodDescription(food)}
                </p>
              </div>

              {/* مشخصات فنی */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {food.cooking_time && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="text-blue-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">{t("cookingTime")}</p>
                      <p className="font-semibold">
                        {food.cooking_time} {t("minutes")}
                      </p>
                    </div>
                  </div>
                )}

                {food.serves && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Users className="text-green-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">{t("serves")}</p>
                      <p className="font-semibold">
                        {food.serves} {t("people")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* سیستم امتیازدهی */}
              <div>
                <RatingSystem foodId={food.id} />
              </div>

              {/* دکمه اقدام */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={handleAddToCart}
                  disabled={!food.is_available}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  <ShoppingCart size={20} className="ml-2" />
                  {t("addToCart")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}