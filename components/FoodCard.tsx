// components/FoodCard.tsx
"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import { Food } from "@/types";

interface FoodCardProps {
  food: Food;
  language: string;
  getFoodName: (food: Food) => string;
  getIngredients: (food: Food) => string;
  t: (key: string) => string;
  handleFoodClick: (food: Food) => void;
  index: number;
}

const FoodCard = memo(function FoodCard({
  food,
  language,
  getFoodName,
  getIngredients,
  t,
  handleFoodClick,
  index,
}: FoodCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        margin: "-30px",
        amount: 0.1,
      }}
      transition={{
        duration: 0.1,
        delay: Math.min(index * 0.02, 0.2),
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative flex items-center w-full h-34 glass-card-3d bg-accent dark:bg-[#191919] border dark: backdrop-blur-[2px] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer will-change-transform"
      onClick={() => handleFoodClick(food)}
      style={{ transform: "translateZ(0)" }}
      layout
    >
      <div className="w-4/12 h-full z-10 rounded-2xl p-[1.5px] bg-[linear-gradient(130deg,#d62828_0%,transparent_35%),linear-gradient(-45deg,#d62828_0%,transparent_35%)]">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
          )}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-xs text-gray-500"></span>
            </div>
          ) : (
            <Image
              src={food.image_url || "/placeholder-food.jpg"}
              alt={getFoodName(food)}
              width={120}
              height={120}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading={index < 6 ? "eager" : "lazy"}
              priority={index < 6}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
              sizes="120px"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col mx-3 w-8/12 overflow-hidden py-2">
        <div className="mb-5">
          <h2 className="text-md font-bold truncate">{getFoodName(food)}</h2>
          {getIngredients(food) && (
            <p className="text-[12px] line-clamp-2 leading-4.5">
              {getIngredients(food).toString()}
            </p>
          )}
          <span className="text-[13px] font-bold text-green-600 mt-1 inline-block">
            {food.price.toLocaleString()} {t("price")}
          </span>
        </div>

        <div>
          {!food.is_available ? (
            <Badge variant="destructive" className="opacity-80">
              {t("notAvailable")}
            </Badge>
          ) : (
            <div
              className={`absolute bottom-2 ${
                language === "en" ? "right-2" : "left-2"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <AddToCartButton food={food} getFoodName={getFoodName} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

FoodCard.displayName = "FoodCard";

export default FoodCard;