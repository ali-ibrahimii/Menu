"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Food } from "@/types";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";

interface Props {
  food: Food;
  language?: string;
  getFoodName?: (food: Food) => string;
  getIngredients?: (food: Food) => string;
  t?: (key: string) => string;
  handleFoodClick?: (food: Food) => void;
}

const FoodCard = memo(function FoodCard({
  food,
  language = "fa",
  getFoodName = (f) => f.name_fa,
  getIngredients = () => "",
  t = (k) => k,
  handleFoodClick,
}: Props) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      onClick={() => handleFoodClick?.(food)}
      className="relative flex items-center w-full h-32 bg-accent dark:bg-[#191919] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <div className="w-4/12 h-full relative">
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        )}

        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700" />
        ) : (
          <Image
            src={food.image_url || "/placeholder-food.jpg"}
            alt={getFoodName(food)}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadingComplete={() => setIsImageLoading(false)}
            onError={() => {
              setImageError(true);
              setIsImageLoading(false);
            }}
            sizes="(max-width:768px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="flex flex-col mx-3 w-8/12 py-2 overflow-hidden">
        <h2 className="text-md font-bold truncate">
          {getFoodName(food)}
        </h2>

        {getIngredients(food) && (
          <p className="text-xs line-clamp-2">
            {getIngredients(food)}
          </p>
        )}

        <span className="text-sm font-bold text-green-600 mt-1">
          {food.price?.toLocaleString()} {t("price")}
        </span>

        {!food.is_available && (
          <Badge variant="destructive" className="mt-1">
            {t("notAvailable")}
          </Badge>
        )}

        {food.is_available && (
          <div className="absolute bottom-2 right-2">
            <AddToCartButton food={food} />
          </div>
        )}
      </div>
    </div>
  );
});

export default FoodCard;
