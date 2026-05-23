"use client";

import { memo, useState, useCallback, useMemo } from "react";
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

  /** جلوگیری از ساخت توابع جدید هر رندر */
  const onClickCard = useCallback(() => handleFoodClick(food), [food, handleFoodClick]);

  const onImageLoad = useCallback(() => setIsImageLoading(false), []);
  const onImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError(true);
  }, []);

  /** از محاسبات تکراری جلوگیری می‌شود */
  const foodName = useMemo(() => getFoodName(food), [food, getFoodName]);
  const ingredients = useMemo(() => getIngredients(food), [food, getIngredients]);

  const priceText = useMemo(() => {
    return `${food.price.toLocaleString()} ${t("price")}`;
  }, [food.price, t]);

  const hasIngredients = ingredients && ingredients.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.12 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative flex items-center w-full h-34 bg-accent dark:bg-[#191919] rounded-2xl border overflow-hidden cursor-pointer shadow-sm transition-all"
      onClick={onClickCard}
      style={{ transform: "translateZ(0)" }}
    >
      {/* تصویر غذا */}
      <div className="w-4/12 h-full relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
        )}

        {!imageError ? (
          <Image
            src={food.image_url || "/placeholder-food.jpg"}
            alt={foodName}
            width={120}
            height={120}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading={index < 4 ? "eager" : "lazy"}
            priority={index < 4}
            onLoad={onImageLoad}
            onError={onImageError}
            sizes="120px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* اطلاعات غذا */}
      <div className="flex flex-col mx-3 w-8/12 overflow-hidden py-2">
        <div className="mb-4">
          <h2 className="text-md font-bold truncate">{foodName}</h2>

          {hasIngredients && (
            <p className="text-[12px] line-clamp-2 leading-4.5 opacity-70">
              {ingredients}
            </p>
          )}

          <span className="text-[13px] font-bold text-green-600 mt-1 inline-block">
            {priceText}
          </span>
        </div>

        {/* دکمه افزودن به سبد */}
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
    </motion.div>
  );
});

FoodCard.displayName = "FoodCard";

export default FoodCard;