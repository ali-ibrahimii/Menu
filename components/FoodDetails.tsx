"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useState, useMemo, useCallback } from "react";
import { Food } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Star,
  Flame,
  Leaf,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartStore } from "@/stores/cartStore";
import RatingSystem, { RatingStats } from "@/components/RatingSystem";
import { translations } from "@/translations/translation";
import { toast } from "sonner";
import Image from "next/image";

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

  /** نسخه بدون خطا */
  const t = useCallback(
    (key: string) => {
      const dict = translations[language] as Record<string, string>;
      return dict[key] ?? key;
    },
    [language],
  );

  const name = useMemo(() => getFoodName(food), [food, getFoodName]);
  const description = useMemo(
    () => getFoodDescription(food) || "",
    [food, getFoodDescription],
  );
  const ingredients = useMemo(
    () => getIngredients(food) || "",
    [food, getIngredients],
  );

  const images = useMemo(
    () => (food.images?.length ? food.images : [food.image_url]),
    [food.images, food.image_url],
  );

  const priceText = useMemo(
    () => `${food.price.toLocaleString()} ${t("price")}`,
    [food.price, t],
  );

  const handleToggleDescription = useCallback(
    () => setIsExpanded((prev) => !prev),
    [],
  );

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar,
      name_en: food.name_en,
      price: food.price,
      image_url: food.image_url,
    });

    toast.success(t("addedToCart"));
    onClose();
  }, [food, addToCart, onClose, t]);

  const descriptionButtonText = useMemo(() => {
    if (isExpanded) {
      if (language === "fa") return "نمایش کمتر";
      if (language === "ar") return "عرض أقل";
      return "Show Less";
    } else {
      if (language === "fa") return "مشاهده بیشتر";
      if (language === "ar") return "عرض المزيد";
      return "Read More";
    }
  }, [isExpanded, language]);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] glass-drawer">
        <div
          dir={language === "en" ? "ltr" : "rtl"}
          className="flex-1 overflow-y-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden px-2">
            {/* تصاویر */}
            <div className="relative mb-2 p-2 rounded-3xl overflow-hidden">
              <div className="w-full h-90 rounded-3xl overflow-hidden">
                <Image
                  fill
                  src={images[selectedImageIndex]}
                  alt={name}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {images.length > 1 && (
                <div className="relative">
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2">
                    <div className="bg-black/10 backdrop-blur-[1px] rounded-md p-1.5 mb-2.5 border border-white/20">
                      <div className="px-2 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                                selectedImageIndex === idx
                                  ? "border-green-400"
                                  : "border-white/30 hover:border-white/50"
                              }`}
                            >
                              <Image
                                fill
                                src={img}
                                alt={`${name} ${idx + 1}`}
                                sizes="50px"
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* اطلاعات کامل غذا */}
            <div className="space-y-5 px-6">
              <div>
                <div className="flex justify-between items-center">
                  <Badge variant="default" className="text-[11px]">
                    {food.category || t("food")}
                  </Badge>

                  {ratingStats.totalReviews > 0 && (
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="fill-yellow-500 text-yellow-400"
                      />
                      <span className="text-[11px] font-semibold">
                        {ratingStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <h1 className="text-2xl font-bold">{name}</h1>

                  <div>
                    <div className="text-sm font-bold dark:text-yellow-300">
                      {priceText}
                    </div>
                    <Badge
                      variant={food.is_available ? "default" : "destructive"}
                    >
                      {food.is_available ? t("available") : t("notAvailable")}
                    </Badge>

                  </div>
                </div>
              </div>

              {/* تگ‌ها */}
              <div className="flex flex-wrap gap-2">
                {food.is_spicy && (
                  <Badge className="flex gap-1 text-[12px] bg-red-300/15 border-white/10">
                    <Flame size={14} />
                    {t("spicy")}
                  </Badge>
                )}

                {food.is_vegetarian && (
                  <Badge className="flex gap-1 text-[12px] bg-green-400/20 border-white/10">
                    <Leaf size={14} />
                    {t("vegetarian")}
                  </Badge>
                )}

                {food.tags && (
                  <Badge className="flex gap-1 text-[12px] bg-purple-500/70 border-white/10">
                    <Tag size={14} />
                    {food.tags.join(", ")}
                  </Badge>
                )}
              </div>

              {/* توضیحات */}
              <div>
                <h1 className="font-bold text-md">{t("description")}:</h1>
                <p
                  className={`text-[13px] leading-tight transition-all ${
                    isExpanded ? "line-clamp-none" : "line-clamp-4"
                  }`}
                >
                  {description}
                </p>

                {description.length > 200 && (
                  <button
                    onClick={handleToggleDescription}
                    className="flex items-center gap-1.5 mt-2 text-sm text-green-700"
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {descriptionButtonText}
                  </button>
                )}
              </div>

              {/* اطلاعات فنی (پخت، افراد) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {food.cooking_time && (
                  <div className="flex justify-center items-center gap-2 info-block border rounded-xl p-3">
                    <div className="p-4 border rounded-full">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs">{t("cookingTime")}</p>
                      <p className="font-bold text-sm">
                        {food.cooking_time} {t("minutes")}
                      </p>
                    </div>
                  </div>
                )}

                {food.serves && (
                  <div className="flex justify-center items-center gap-2 info-block border rounded-xl p-3">
                    <div className="p-4 border rounded-full">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs">{t("serves")}</p>
                      <p className="font-bold text-sm">
                        {food.serves} {t("people")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* مواد اولیه */}
              <div>
                <h1 className="font-bold text-md my-1">{t("ingredients")}:</h1>
                {ingredients && (
                  <p className="text-[13px] leading-tight">{ingredients}</p>
                )}
              </div>

              {/* امتیازدهی */}
              <div className="mb-6">
                <RatingSystem
                  foodId={food.id}
                  onRatingStatsChange={setRatingStats}
                />
              </div>

              {/* دکمه */}
              <button
                onClick={handleAddToCart}
                className="w-full mb-6 py-3 rounded-lg bg-accent dark:bg-card border text-white font-bold text-lg"
              >
                {t("addToCart")}
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
