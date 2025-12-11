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
  Star,
  Flame,
  Leaf,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartStore } from "@/stores/cartStore";
import RatingSystem, { RatingStats } from "@/components/RatingSystem";
import { translations } from "@/translations/translation";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
  });

  const handleRatingStatsChange = (stats: RatingStats) => {
    setRatingStats(stats);
  };
  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };
  const getDescriptionButtonText = () => {
    if (isExpanded) {
      return language === "fa"
        ? "نمایش کمتر"
        : language === "ar"
        ? "عرض أقل"
        : "Show Less";
    } else {
      return language === "fa"
        ? "مشاهده بیشتر"
        : language === "ar"
        ? "عرض المزيد"
        : "Read More";
    }
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

  const images =
    food.images && food.images.length > 0 ? food.images : [food.image_url];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] glass-details">
        <div
          dir={language === "en" ? "ltr" : "rtl"}
          className="flex-1 overflow-y-auto p-5 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-t-4xl overflow-hidden">
            {/* بخش تصاویر */}
            <div className="relative mb-2 rounded-3xl overflow-hidden">
              {/* تصویر اصلی */}
              <div className="aspect-square">
                <img
                  src={images[selectedImageIndex]}
                  alt={getFoodName(food)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* گالری تصاویر */}
              {images.length > 1 && (
                <div className="relative">
                  <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-black/10 backdrop-blur-[1px] rounded-xl p-1.5 mb-2.5 border border-white/20">
                      {/* اسکرول افقی فعال */}
                      <div className="w-[270px] px-2 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                selectedImageIndex === index
                                  ? "border-green-400"
                                  : "border-white/30 hover:border-white/50 hover:scale-105"
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
                      </div>
                    </div>
                  </div>

                  {/* شمارنده */}
                  {/* {images.length > 4 && (
                    <div className="absolute left-1/2 bottom-5 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )} */}
                </div>
              )}
            </div>

            {/* بخش اطلاعات */}
            <div className="space-y-3">
              {/* عنوان و قیمت */}
              <div>
                <div className="">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {food.category}{" "}
                    </Badge>

                    {ratingStats.totalReviews > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="text-[11px] font-semibold">
                            {ratingStats.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs">
                          {/* ({ratingStats.totalReviews}) */}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <h1 className="text-[25px] font-bold">
                      {getFoodName(food)}
                    </h1>
                    <div className={`${language === 'en' ? 'text-right' : 'text-left'}`}>
                    <Badge
                      variant={food.is_available ? "default" : "destructive"}
                      className=""
                    >
                      {food.is_available ? t("available") : t("notAvailable")}
                    </Badge>
                    <div className="text-sm font-bold text-green-600">
                      {food.price.toLocaleString()} {t("price")}
                    </div>
                  </div>
                  </div>
                </div>

                {/* دسته‌بندی و تگ‌ها */}
                <div className="flex flex-wrap gap-2">
                  {food.is_spicy && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-white"
                    >
                      <Flame size={14} />
                      {t("spicy")}
                    </Badge>
                  )}

                  {food.is_vegetarian && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-white"
                    >
                      <Leaf size={14} />
                      {t("vegetarian")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* توضیحات */}
              <div className="prose max-w-none">
                <h1 className="font-bold text-lg my-1">
                  {language === "fa"
                    ? "توضیحات"
                    : language === "ar"
                    ? "الوصف"
                    : "Description"}
                </h1>
                <div className="relative">
                  <p
                    className={`leading-relaxed text-[15px] transition-all duration-300 ${
                      isExpanded ? "line-clamp-none" : "line-clamp-5"
                    }`}
                  >
                    {getFoodDescription(food)}
                  </p>

                  {/* دکمه نمایش بیشتر/کمتر */}
                  {getFoodDescription(food).length > 120 && (
                    <div className="flex justify-start mt-3">
                      <button
                        onClick={toggleDescription}
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-sm font-medium transition-colors bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full"
                      >
                        {getDescriptionButtonText()}
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* مشخصات فنی */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {food.cooking_time && (
                  <div className="flex items-center justify-center gap-3 rounded-xl border py-2">
                    <div className="p-4 rounded-full bg-accent/40">
                      <Clock className="" size={20} />
                    </div>
                    <div>
                      <p className="text-[13px]">
                        {t("cookingTime")}
                      </p>
                      <p className="font-medium">
                        {food.cooking_time} {t("minutes")}
                      </p>
                    </div>
                  </div>
                )}

                {food.serves && (
                  <div className="flex items-center justify-center gap-3  rounded-xl border py-2">
                    <div className="p-4 rounded-full bg-accent/40">
                      <Users className="" size={20} />
                    </div>
                    <div>
                      <p className="text-[13px]">{t("serves")}</p>
                      <p className="font-medium">
                        {food.serves} {t("people")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* سیستم امتیازدهی */}
              <div>
                <RatingSystem
                  foodId={food.id}
                  onRatingStatsChange={handleRatingStatsChange}
                />
              </div>
            </div>
          </div>
          {/* دکمه اقدام */}
        </div>
        <DrawerFooter className="p-0 w-full">
          <div className="flex items-center justify-center p-2 w-full">
            <Button
              onClick={handleAddToCart}
              disabled={!food.is_available}
              className="flex w-8/12 bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-md"
            >
              <ShoppingCart size={20} />
              {t("addToCart")}
            </Button>
          </div>
            

        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
