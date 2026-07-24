"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useState, useMemo, useCallback, useEffect } from "react";
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
  ShoppingCart,
  Package,
  BadgeCheck,
  ImageIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
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

// اگر slug آجیل‌فروشی شما متفاوت است، همینجا اضافه/اصلاحش کن
const SHOP_BRANCH_SLUGS = [
  "vatandar-shop",
  "ajil",
  "nuts",
  "vatandar-ajil",
  "ajilforooshi-vatandar",
];

/**
 * فقط برای رنگ‌های حالت روشن/تاریک استفاده شده؛
 * ساختار، فاصله‌ها، سایزها و layout اصلی تغییر نکرده‌اند.
 */
const theme = {
  drawer:
    "border-black/10 bg-[#fff8ed]/95 text-slate-950 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 dark:text-white",
  imageCard:
    "border border-black/10 bg-slate-100 shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/35",
  pageDecor:
    "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_36%)]",
  strongText: "text-slate-950 dark:text-white",
  mutedText: "text-slate-600 dark:text-white/72",
  softText: "text-slate-500 dark:text-white/45",
  panel:
    "border border-black/10 bg-white/70 shadow-xl shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/10",
  panelSoft:
    "border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.035]",
  iconBox:
    "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:bg-white/5 dark:text-emerald-300 dark:ring-white/10",
  priceBox:
    "border border-emerald-500/15 bg-emerald-500/10 shadow-lg shadow-emerald-950/10 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:shadow-emerald-950/20",
  priceLabel: "text-emerald-700/75 dark:text-emerald-100/75",
  priceText: "text-emerald-700 dark:text-emerald-200",
  accentPill:
    "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/15",
  addButton:
    "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950 dark:hover:shadow-emerald-400/35 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:text-white/70 disabled:shadow-none dark:disabled:from-slate-500 dark:disabled:to-slate-600 dark:disabled:text-white/60",
};

export default function FoodDetails({
  food,
  isOpen,
  onClose,
  getFoodName,
  getIngredients,
  getFoodDescription,
}: FoodDetailsProps) {
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();
  const { addToCart } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
  });

  const isEnglish = language === "en";
  const isShopBranch = selectedBranch?.slug
    ? SHOP_BRANCH_SLUGS.includes(selectedBranch.slug)
    : false;

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

  const images = useMemo(() => {
    const gallery = food.images?.filter(Boolean) || [];
    if (gallery.length > 0) return gallery;
    if (food.image_url) return [food.image_url];
    return ["/bg.jpg"];
  }, [food.images, food.image_url]);

  const tags = useMemo(() => {
    if (!food.tags) return [];
    if (Array.isArray(food.tags)) return food.tags.filter(Boolean);
    return [String(food.tags)];
  }, [food.tags]);

  const priceText = useMemo(
    () => `${food.price.toLocaleString()} ${t("price")}`,
    [food.price, t],
  );

  const descriptionTitle = useMemo(() => {
    if (!isShopBranch) return t("description");
    if (language === "fa") return "توضیحات محصول";
    if (language === "ar") return "وصف المنتج";
    return "Product Description";
  }, [isShopBranch, language, t]);

  const ingredientsTitle = useMemo(() => {
    if (!isShopBranch) return t("ingredients");
    if (language === "fa") return "محتویات";
    if (language === "ar") return "المكونات";
    return "Contents";
  }, [isShopBranch, language, t]);

  const descriptionButtonText = useMemo(() => {
    if (isExpanded) {
      if (language === "fa") return "نمایش کمتر";
      if (language === "ar") return "عرض أقل";
      return "Show Less";
    }

    if (language === "fa") return "مشاهده بیشتر";
    if (language === "ar") return "عرض المزيد";
    return "Read More";
  }, [isExpanded, language]);

  const handleToggleDescription = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

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

  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
      setIsExpanded(false);
    }
  }, [food.id, isOpen]);

  const showFoodMeta = !isShopBranch && (food.cooking_time || food.serves);
  const showFoodBadges = !isShopBranch && (food.is_spicy || food.is_vegetarian);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={`h-[92vh] overflow-hidden p-0 ${theme.drawer}`}>
        <div
          dir={isEnglish ? "ltr" : "rtl"}
          className="relative h-full overflow-y-auto scrollbar-hide"
        >
          {/* Background decoration */}
          <div
            className={`pointer-events-none absolute inset-0 -z-10 ${theme.pageDecor}`}
          />

          <div className="grid min-h-full grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Image Area */}
            <section className="relative p-3 sm:p-5 lg:sticky lg:top-0 lg:h-[92vh]">
              <div
                className={`relative h-[340px] overflow-hidden rounded-[2rem] sm:h-[430px] lg:h-full ${theme.imageCard}`}
              >
                <Image
                  fill
                  src={images[selectedImageIndex] || images[0]}
                  alt={name}
                  className="object-cover transition duration-700"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

                {/* Category and rating */}
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                  <Badge className="border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:bg-black/35">
                    {food.category ||
                      (isShopBranch
                        ? language === "fa"
                          ? "محصول"
                          : language === "ar"
                            ? "منتج"
                            : "Product"
                        : t("food"))}
                  </Badge>

                  {ratingStats.totalReviews > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-yellow-300/25 bg-black/35 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-300"
                      />
                      <span>{ratingStats.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 p-2 shadow-xl backdrop-blur-md">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {images.map((img, idx) => (
                        <button
                          key={`${img}-${idx}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                            selectedImageIndex === idx
                              ? "scale-95 border-emerald-300 shadow-lg shadow-emerald-400/30"
                              : "border-white/25 opacity-80 hover:border-white/70 hover:opacity-100"
                          }`}
                          aria-label={`${name} ${idx + 1}`}
                        >
                          <Image
                            fill
                            src={img}
                            alt={`${name} ${idx + 1}`}
                            sizes="70px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Details Area */}
            <section className="flex flex-col px-5 pb-6 pt-2 sm:px-7 lg:px-8 lg:py-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={food.is_available ? "default" : "destructive"}
                      className="gap-1.5 rounded-full px-3 py-1 text-xs"
                    >
                      <BadgeCheck size={13} />
                      {food.is_available ? t("available") : t("notAvailable")}
                    </Badge>

                    {isShopBranch && (
                      <Badge className="gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/10">
                        <Package size={13} />
                        {language === "fa"
                          ? "محصول فروشگاهی"
                          : language === "ar"
                            ? "منتج متجر"
                            : "Shop Product"}
                      </Badge>
                    )}
                  </div>

                  <h1
                    className={`${
                      isEnglish ? "font-[Montserrat]" : "font-[BTitr]"
                    } text-3xl font-black leading-tight sm:text-4xl ${theme.strongText}`}
                  >
                    {name}
                  </h1>
                </div>

                <div
                  className={`shrink-0 rounded-2xl px-4 py-3 text-center ${theme.priceBox}`}
                >
                  <p className={`text-[11px] font-medium ${theme.priceLabel}`}>
                    {language === "fa"
                      ? "قیمت"
                      : language === "ar"
                        ? "السعر"
                        : "Price"}
                  </p>
                  <p
                    className={`mt-1 whitespace-nowrap text-sm font-black sm:text-base ${theme.priceText}`}
                  >
                    {priceText}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {(showFoodBadges || tags.length > 0) && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {showFoodBadges && food.is_spicy && (
                    <Badge className="gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/10 dark:border-red-300/20 dark:bg-red-400/15 dark:text-red-100 dark:hover:bg-red-400/15">
                      <Flame size={14} />
                      {t("spicy")}
                    </Badge>
                  )}

                  {showFoodBadges && food.is_vegetarian && (
                    <Badge className="gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-700 hover:bg-green-500/10 dark:border-green-300/20 dark:bg-green-400/15 dark:text-green-100 dark:hover:bg-green-400/15">
                      <Leaf size={14} />
                      {t("vegetarian")}
                    </Badge>
                  )}

                  {tags.length > 0 && (
                    <Badge className="gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-500/10 dark:border-purple-300/20 dark:bg-purple-500/20 dark:text-purple-100 dark:hover:bg-purple-500/20">
                      <Tag size={14} />
                      {tags.join(", ")}
                    </Badge>
                  )}
                </div>
              )}

              {/* Description */}
              {description && (
                <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panel}`}>
                  <h2
                    className={`mb-2 flex items-center gap-2 text-sm font-black ${theme.strongText}`}
                  >
                    <ImageIcon
                      size={16}
                      className="text-emerald-600 dark:text-emerald-300"
                    />
                    {descriptionTitle}
                  </h2>

                  <p
                    className={`text-sm font-medium leading-7 transition-all ${theme.mutedText} ${
                      isExpanded ? "line-clamp-none" : "line-clamp-4"
                    }`}
                  >
                    {description}
                  </p>

                  {description.length > 180 && (
                    <button
                      type="button"
                      onClick={handleToggleDescription}
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${theme.accentPill}`}
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
              )}

              {/* Food-only meta: برای آجیل‌فروشی نمایش داده نمی‌شود */}
              {showFoodMeta && (
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {food.cooking_time && (
                    <div
                      className={`flex items-center gap-3 rounded-[1.4rem] p-4 ${theme.panelSoft}`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBox}`}
                      >
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${theme.softText}`}>
                          {t("cookingTime")}
                        </p>
                        <p
                          className={`mt-1 text-sm font-black ${theme.strongText}`}
                        >
                          {food.cooking_time} {t("minutes")}
                        </p>
                      </div>
                    </div>
                  )}

                  {food.serves && (
                    <div
                      className={`flex items-center gap-3 rounded-[1.4rem] p-4 ${theme.panelSoft}`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBox}`}
                      >
                        <Users size={20} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${theme.softText}`}>
                          {t("serves")}
                        </p>
                        <p
                          className={`mt-1 text-sm font-black ${theme.strongText}`}
                        >
                          {food.serves} {t("people")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ingredients / Contents */}
              {ingredients && (
                <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panel}`}>
                  <h2 className={`mb-2 text-sm font-black ${theme.strongText}`}>
                    {ingredientsTitle}
                  </h2>
                  <p
                    className={`text-sm font-medium leading-7 ${theme.mutedText}`}
                  >
                    {ingredients}
                  </p>
                </div>
              )}

              {/* Rating */}
              <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panelSoft}`}>
                <RatingSystem
                  foodId={food.id}
                  onRatingStatsChange={setRatingStats}
                />
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!food.is_available}
                className={`sticky bottom-4 mt-auto flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-black transition duration-300 hover:-translate-y-0.5 ${theme.addButton}`}
              >
                <ShoppingCart size={18} />
                {food.is_available ? t("addToCart") : t("notAvailable")}
              </button>
            </section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
