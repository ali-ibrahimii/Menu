"use client";

import { memo, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import { Food } from "@/types";


const theme = {
  page: "bg-accent/50 text-slate-950 dark:bg-[#0a0908] dark:text-white transition-colors duration-500",
  panel:
    "border border-black/10 bg-white/75 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30",
  mutedText: "text-slate-600 dark:text-white/60",
  strongText: "text-slate-950 dark:text-white",
  iconBox:
    "border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-300",
  accentButton:
    "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950",
};

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

  const onClickCard = useCallback(
    () => handleFoodClick(food),
    [food, handleFoodClick],
  );

  const onImageLoad = useCallback(() => setIsImageLoading(false), []);

  const onImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError(true);
  }, []);

  const foodName = useMemo(() => getFoodName(food), [food, getFoodName]);

  const ingredients = useMemo(
    () => getIngredients(food),
    [food, getIngredients],
  );

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
      className={`relative flex items-center w-full h-34 ${theme.page} rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden cursor-pointer shadow-md shadow-black/5 dark:shadow-black/30 transition-all backdrop-blur-xl`}
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
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* اطلاعات غذا */}
      <div className="flex flex-col mx-3 w-8/12 overflow-hidden py-2">
        <div className="mb-4">
          <h2
            className={`text-md font-bold truncate ${theme.strongText} ${
              language === "en" ? "font-[Montserrat]" : ""
            }`}
          >
            {foodName}
          </h2>

          {hasIngredients && (
            <p className="text-[12px] line-clamp-2 leading-4.5 ${theme.mutedText} mt-1">
              {ingredients}
            </p>
          )}

          <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-300 mt-1 inline-block">
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
