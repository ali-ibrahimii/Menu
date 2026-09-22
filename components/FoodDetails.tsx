"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  Scale,
  Minus,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { useCartStore } from "@/stores/cartStore";
import RatingSystem, { RatingStats } from "@/components/RatingSystem";
import { translations } from "@/translations/translation";
import {
  BASE_UNIT_GRAMS,
  computeWeightPrice,
  formatNumber,
  formatPrice,
  formatWeight,
  getWeightOptions,
  isShopBranchSlug,
  type ShopLanguage,
  type WeightOption,
} from "@/lib/shopWeights";
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

const MAX_QUANTITY = 99;

/**
 * رنگ‌های حالت روشن/تاریک.
 * نکته‌ی مهم: روی سطح اصلی کشو از backdrop-blur استفاده نمی‌کنیم؛
 * یک لایه‌ی بلورِ تمام‌صفحه که زیرش محتوای در حال اسکرول باشد، روی آیفون
 * باعث کندی محسوس اسکرول می‌شود.
 */
const theme = {
  drawer:
    "border-black/10 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-[#09090a] dark:text-white",
  imageCard:
    "border border-black/10 bg-slate-100 shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/35",
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
  footerBar:
    "border-t border-black/10 bg-accent dark:border-white/10 dark:bg-[#09090a]",
  stepperBox:
    "border border-black/10 bg-white dark:border-white/10 dark:bg-white/5",
  stepperButton:
    "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 transition active:scale-90 disabled:opacity-40 dark:bg-white/5 dark:text-emerald-300",
  weightOption: (active: boolean) =>
    [
      "flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition active:scale-[0.97]",
      active
        ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-950/10 dark:border-emerald-300/40 dark:bg-emerald-400/10"
        : "border-black/10 bg-white/70 hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/[0.04]",
    ].join(" "),
};

/* ─────────────────── گالری تصاویر (جدا و memo شده) ─────────────────── */
/**
 * بخش تصویر کاملاً از stateهای فرم/وزن جدا شده است؛ بنابراین با هر تغییر
 * انتخاب وزن یا هر تغییر در نظرات، تصاویر دوباره رندر نمی‌شوند.
 */
const GallerySection = memo(function GallerySection({
  images,
  selectedIndex,
  onSelect,
  alt,
  categoryLabel,
  ratingLabel,
}: {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  alt: string;
  categoryLabel: string;
  ratingLabel: string | null;
}) {
  return (
    <section className="relative p-3 sm:p-5 lg:sticky lg:top-0 lg:h-[calc(92vh-7rem)] lg:self-start">
      <div
        className={`relative h-[300px] overflow-hidden rounded-[2rem] sm:h-[400px] lg:h-full ${theme.imageCard}`}
      >
        <Image
          fill
          src={images[selectedIndex] || images[0]}
          alt={alt}
          className="object-cover transition duration-700"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

        {/* دسته‌بندی و امتیاز */}
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <Badge className="border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:bg-black/35">
            {categoryLabel}
          </Badge>

          {ratingLabel && (
            <div className="flex items-center gap-1.5 rounded-full border border-yellow-300/25 bg-black/35 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
              <Star size={14} className="fill-yellow-400 text-yellow-300" />
              <span>{ratingLabel}</span>
            </div>
          )}
        </div>

        {/* تصاویر کوچک */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 p-2 shadow-xl backdrop-blur-md">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity duration-300 ${
                    selectedIndex === idx
                      ? "border-emerald-300 opacity-100 shadow-lg shadow-emerald-400/30"
                      : "border-white/25 opacity-70 hover:border-white/70 hover:opacity-100"
                  }`}
                  aria-label={`${alt} ${idx + 1}`}
                >
                  <Image
                    fill
                    src={img}
                    alt={`${alt} ${idx + 1}`}
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
  );
});

/* ─────────────────────── انتخاب وزن ─────────────────────── */

const WeightSelector = memo(function WeightSelector({
  options,
  selectedId,
  basePrice,
  currencyWord,
  language,
  title,
  perUnitLabel,
  note,
  onSelect,
}: {
  options: WeightOption[];
  selectedId: string;
  basePrice: number;
  currencyWord: string;
  language: ShopLanguage;
  title: string;
  perUnitLabel: string;
  note: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panel}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          className={`flex items-center gap-2 text-sm font-black ${theme.strongText}`}
        >
          <Scale size={16} className="text-emerald-600 dark:text-emerald-300" />
          {title}
        </h2>
        <span className={`text-[11px] font-bold ${theme.softText}`}>
          {perUnitLabel}: {formatNumber(basePrice, language)}
        </span>
      </div>

      <div
        className={`grid gap-2.5 ${
          options.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
        }`}
      >
        {options.map((option) => {
          const active = option.id === selectedId;
          const isBaseUnit = option.grams === BASE_UNIT_GRAMS;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={active}
              className={theme.weightOption(active)}
            >
              <span
                className={`text-sm font-black ${theme.strongText}`}
              >
                {formatWeight(option.grams, language)}
              </span>
              <span
                className={`text-[13px] font-black ${theme.priceText} border`}
              >
                {formatPrice(
                  computeWeightPrice(basePrice, option.grams),
                  language,
                  currencyWord,
                )}
              </span>
              {isBaseUnit && (
                <span className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-200/70">
                  {perUnitLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* <p className={`mt-3 text-[11px] leading-5 ${theme.softText}`}>{note}</p> */}
    </div>
  );
});

/* ─────────────────────── کامپوننت اصلی ─────────────────────── */

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
  const [selectedWeightId, setSelectedWeightId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isEnglish = language === "en";
  const lang = language as ShopLanguage;

  /** شعبه‌ی فروشگاهی (سوغات وطن‌دار / آجیل‌فروشی) → فروش وزنی */
  const isShopBranch = isShopBranchSlug(selectedBranch?.slug);

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

  /* ── وزن‌ها ─────────────────────────────────────────────── */

  const weightOptions = useMemo(
    () => (isShopBranch ? getWeightOptions(tags) : []),
    [isShopBranch, tags],
  );

  const selectedWeight = useMemo<WeightOption | null>(() => {
    if (weightOptions.length === 0) return null;
    const explicit = weightOptions.find((w) => w.id === selectedWeightId);
    if (explicit) return explicit;
    // پیش‌فرض: وزن پایه (۱ کیلوگرم) که همان قیمت ثبت‌شده در منو است
    return (
      weightOptions.find((w) => w.grams === BASE_UNIT_GRAMS) ??
      weightOptions[weightOptions.length - 1]
    );
  }, [selectedWeightId, weightOptions]);

  /** قیمت یک واحد از چیزی که به سبد اضافه می‌شود */
  const unitPrice = useMemo(() => {
    if (!selectedWeight) return food.price;
    return computeWeightPrice(food.price, selectedWeight.grams);
  }, [food.price, selectedWeight]);

  const totalPrice = unitPrice * quantity;

  const priceText = useMemo(
    () => formatPrice(unitPrice, lang, t("price")),
    [lang, t, unitPrice],
  );

  const totalText = useMemo(
    () => formatPrice(totalPrice, lang, t("price")),
    [lang, t, totalPrice],
  );

  const descriptionTitle = useMemo(
    () => (isShopBranch ? t("productDescription") : t("description")),
    [isShopBranch, t],
  );

  const ingredientsTitle = useMemo(
    () => (isShopBranch ? t("productContents") : t("ingredients")),
    [isShopBranch, t],
  );

  const descriptionButtonText = useMemo(
    () => (isExpanded ? t("showLess") : t("showMore")),
    [isExpanded, t],
  );

  const categoryLabel = useMemo(
    () => food.category || (isShopBranch ? t("product") : t("food")),
    [food.category, isShopBranch, t],
  );

  const ratingLabel = useMemo(
    () =>
      ratingStats.totalReviews > 0 ? ratingStats.averageRating.toFixed(1) : null,
    [ratingStats.averageRating, ratingStats.totalReviews],
  );

  /* ── رویدادها ───────────────────────────────────────────── */

  const handleSelectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleToggleDescription = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleIncrease = useCallback(() => {
    setQuantity((prev) => Math.min(MAX_QUANTITY, prev + 1));
  }, []);

  const handleDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleAddToCart = useCallback(() => {
    const variant = selectedWeight
      ? {
          variant_id: selectedWeight.id,
          weight_grams: selectedWeight.grams,
          variant_label_fa: formatWeight(selectedWeight.grams, "fa"),
          variant_label_ar: formatWeight(selectedWeight.grams, "ar"),
          variant_label_en: formatWeight(selectedWeight.grams, "en"),
        }
      : {};

    addToCart(
      {
        id: food.id,
        name_fa: food.name_fa,
        name_ar: food.name_ar || food.name_fa,
        name_en: food.name_en || food.name_fa,
        // قیمتِ همان وزنی که کاربر انتخاب کرده است
        price: unitPrice,
        image_url: food.image_url,
        is_store_item: !!food.is_store_item || isShopBranch,
        ...variant,
      },
      quantity,
    );

    toast.success(t("addedToCart"));
    onClose();
  }, [
    addToCart,
    food.id,
    food.image_url,
    food.is_store_item,
    food.name_ar,
    food.name_en,
    food.name_fa,
    isShopBranch,
    onClose,
    quantity,
    selectedWeight,
    t,
    unitPrice,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedImageIndex(0);
    setIsExpanded(false);
    setQuantity(1);
    setSelectedWeightId(null);
  }, [food.id, isOpen]);

  const showFoodMeta = !isShopBranch && (food.cooking_time || food.serves);
  const showFoodBadges = !isShopBranch && (food.is_spicy || food.is_vegetarian);

  const addButtonLabel = selectedWeight
    ? `${t("addToCart")} — ${formatWeight(selectedWeight.grams, lang)}`
    : t("addToCart");

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      shouldScaleBackground={false}
    >
      <DrawerContent
        className={`h-[92vh] max-h-[92vh] overflow-hidden rounded-t-[1.75rem] p-0 ${theme.drawer}`}
      >
        <DrawerTitle className="sr-only">{name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          {description || name}
        </DrawerDescription>

        <div
          dir={isEnglish ? "ltr" : "rtl"}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* محتوای اسکرول‌شونده */}
          <div className="smooth-scroll-area scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            <div className="grid min-h-full grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <GallerySection
                images={images}
                selectedIndex={selectedImageIndex}
                onSelect={handleSelectImage}
                alt={name}
                categoryLabel={categoryLabel}
                ratingLabel={ratingLabel}
              />

              {/* بخش جزئیات */}
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
                          {t("shopProduct")}
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
                      {selectedWeight
                        ? formatWeight(selectedWeight.grams, lang)
                        : language === "fa"
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

                {/* تگ‌ها */}
                {(showFoodBadges || tags.length > 0) && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {showFoodBadges && food.is_spicy && (
                      <Badge className="gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/10 dark:border-red-300/20 dark:bg-red-400/15 dark:text-red-100 dark:hover:bg-red-400/15">
                        <Flame size={14} />
                        {t("spicy")}
                      </Badge>
                    )}

                    {showFoodBadges && food.is_vegetarian && (
                      <Badge className="gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-700 hover:bg-green-500/10 dark:border-green-300/20 dark:bg-green-500/15 dark:text-green-100 dark:hover:bg-green-500/15">
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

                {/* توضیحات */}
                {description && (
                  <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panel}`}>
                    <h2
                      className={`mb-2 flex items-center gap-2 text-sm font-black ${theme.strongText}`}
                    >
                      {descriptionTitle}
                    </h2>

                    <p
                      className={`text-sm font-medium leading-7 ${theme.mutedText} ${
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

                {/* انتخاب وزن — فقط شعبه‌ی فروشگاهی */}
                {isShopBranch && selectedWeight && (
                  <WeightSelector
                    options={weightOptions}
                    selectedId={selectedWeight.id}
                    basePrice={food.price}
                    currencyWord={t("price")}
                    language={lang}
                    title={t("selectWeight")}
                    perUnitLabel={t("pricePerKilo")}
                    note={t("weightPricingNote")}
                    onSelect={setSelectedWeightId}
                  />
                )}

                {/* اطلاعات غذا (برای محصولات فروشگاهی نمایش داده نمی‌شود) */}
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

                {/* مواد تشکیل‌دهنده / محتویات */}
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

                {/* نظرات */}
                <div className={`mb-5 rounded-[1.6rem] p-4 ${theme.panelSoft}`}>
                  <RatingSystem
                    foodId={food.id}
                    onRatingStatsChange={setRatingStats}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* نوار پایین: تعداد + قیمت + افزودن به سبد */}
          <footer
            className={`shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 ${theme.footerBar}`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex shrink-0 items-center gap-1 rounded-2xl p-1 ${theme.stepperBox}`}
                aria-label={t("quantityLabel")}
              >
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || !food.is_available}
                  className={theme.stepperButton}
                  aria-label="-"
                >
                  <Minus size={16} />
                </button>
                <span
                  className={`w-8 text-center text-sm font-black ${theme.strongText}`}
                >
                  {formatNumber(quantity, lang)}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={!food.is_available}
                  className={theme.stepperButton}
                  aria-label="+"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!food.is_available}
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-4 py-3 transition duration-300 active:scale-[0.98] ${theme.addButton}`}
              >
                <ShoppingCart size={18} className="shrink-0" />
                <span className="flex min-w-0 flex-col items-start leading-tight">
                  <span className="truncate text-sm font-black">
                    {food.is_available ? addButtonLabel : t("notAvailable")}
                  </span>
                  <span className="truncate text-[11px] font-bold opacity-90">
                    {totalText}
                  </span>
                </span>
              </button>
            </div>
          </footer>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
