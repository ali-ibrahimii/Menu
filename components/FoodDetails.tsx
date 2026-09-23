"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Food } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Flame,
  Leaf,
  Minus,
  NotebookText,
  Package,
  Plus,
  Scale,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
  type LucideIcon,
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

/** تگ کنترلی وزن (مثل `weight:500,1000`) به مشتری نشان داده نمی‌شود */
const WEIGHT_TAG_PATTERN = /^(weight|وزن|وزني|وزنی)\s*:/i;

/**
 * رنگ‌های حالت روشن/تاریک.
 * نکته‌ی مهم: روی سطح اصلی کشو از backdrop-blur استفاده نمی‌کنیم؛
 * یک لایه‌ی بلورِ تمام‌صفحه که زیرش محتوای در حال اسکرول باشد، روی آیفون
 * باعث کندی محسوس اسکرول می‌شود. بلور فقط روی چیپ‌های کوچکِ روی تصویر است.
 */
const theme = {
  drawer:
    "border-black/10 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-[#09090a] dark:text-white",
  imageCard:
    "border border-black/10 bg-slate-100 shadow-[0_28px_60px_-30px_rgba(6,78,59,0.55)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]",
  glassChip:
    "border border-white/15 bg-black/40 text-white shadow-lg backdrop-blur-md",
  strongText: "text-slate-950 dark:text-white",
  mutedText: "text-slate-600 dark:text-white/70",
  softText: "text-slate-500 dark:text-white/45",
  card: "border border-black/[0.07] bg-white/80 shadow-sm shadow-emerald-950/[0.04] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-black/20",
  cardSoft:
    "border border-black/[0.07] bg-white/70 dark:border-white/10 dark:bg-white/[0.035]",
  iconBox:
    "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/15",
  priceBox:
    "border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.14] via-emerald-500/[0.06] to-teal-500/[0.13] shadow-lg shadow-emerald-950/10 dark:border-emerald-300/20 dark:from-emerald-400/[0.16] dark:via-emerald-400/[0.05] dark:to-teal-400/[0.14] dark:shadow-emerald-950/25",
  priceLabel: "text-emerald-800/70 dark:text-emerald-100/70",
  priceText: "text-emerald-700 dark:text-emerald-200",
  accentPill:
    "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/[0.16] dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/[0.18]",
  addButton:
    "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950 dark:hover:shadow-emerald-400/35 disabled:cursor-not-allowed disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-500 disabled:text-white/70 disabled:shadow-none dark:disabled:from-slate-600 dark:disabled:via-slate-600 dark:disabled:to-slate-700 dark:disabled:text-white/60",
  footerBar:
    "border-t border-black/[0.07] bg-slate-50 dark:border-white/10 dark:bg-[#0b0b0d]",
  stepperBox:
    "border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06]",
  stepperButton:
    "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 transition hover:bg-emerald-500/20 active:scale-90 disabled:pointer-events-none disabled:opacity-35 dark:bg-white/[0.07] dark:text-emerald-300 dark:hover:bg-white/[0.13]",
  weightOption: (active: boolean) =>
    [
      "group/weight relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border px-3 py-3 text-center transition-all duration-200 active:scale-[0.97]",
      active
        ? "border-transparent bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 dark:from-emerald-400 dark:to-teal-500 dark:text-slate-950 dark:shadow-emerald-500/20"
        : "border-black/10 bg-white text-slate-900 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-emerald-300/40 dark:hover:bg-white/[0.07]",
    ].join(" "),
};

/* ─────────────────────── کارتِ بخش‌ها ─────────────────────── */
/**
 * قاب یکدست برای همه‌ی بخش‌ها (توضیحات، محتویات، وزن، نظرات) تا پنل
 * ریتم بصری داشته باشد: آیکون در مربع زمردی + عنوان + بخش اختیاری سمت مقابل.
 */
const SectionCard = memo(function SectionCard({
  icon: Icon,
  title,
  trailing,
  variant = "card",
  className = "",
  bodyClassName = "",
  children,
  cardRef,
}: {
  icon: LucideIcon;
  title: string;
  trailing?: ReactNode;
  variant?: "card" | "bare";
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  cardRef?: React.Ref<HTMLElement>;
}) {
  const isBare = variant === "bare";

  return (
    <section
      ref={cardRef as React.Ref<HTMLElement> | undefined}
      className={`${isBare ? "" : `${theme.card} overflow-hidden rounded-[1.4rem]`} ${className}`}
    >
      <header
        className={`flex items-center justify-between gap-3 ${
          isBare ? "" : "border-b border-black/[0.05] dark:border-white/[0.07]"
        } px-4 py-3`}
      >
        <h2
          className={`flex items-center gap-2.5 text-[13px] font-black ${theme.strongText}`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.iconBox}`}
          >
            <Icon size={16} />
          </span>
          {title}
        </h2>
        {trailing}
      </header>

      <div className={`${isBare ? "" : `p-4 ${bodyClassName}`}`}>
        {children}
      </div>
    </section>
  );
});

/* ───────────────────── کارت اطلاعات سریع ───────────────────── */

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3 transition-colors duration-200 hover:border-emerald-500/25 ${theme.cardSoft}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBox}`}
      >
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <p className={`truncate text-[11px] font-medium ${theme.softText}`}>
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-[13px] font-black ${theme.strongText}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
});

/* ─────────────────── گالری تصاویر (جدا و memo شده) ─────────────────── */
/**
 * بخش تصویر کاملاً از stateهای فرم/وزن جدا شده است؛ بنابراین با هر تغییر
 * انتخاب وزن یا هر تغییر در نظرات، تصاویر دوباره رندر نمی‌شوند.
 */
const GallerySection = memo(function GallerySection({
  images,
  selectedIndex,
  onSelect,
  onStep,
  onClose,
  alt,
  categoryLabel,
  closeLabel,
  previousLabel,
  nextLabel,
  language,
  isRTL,
}: {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onStep: (delta: number) => void;
  onClose: () => void;
  alt: string;
  categoryLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  language: ShopLanguage;
  isRTL: boolean;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hasMany = images.length > 1;

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const point = event.touches[0];
      touchStart.current = { x: point.clientX, y: point.clientY };
    },
    [],
  );

  /** سوایپ افقی روی تصویر = رفتن به عکس قبلی/بعدی (در RTL جهت برعکس است) */
  const handleTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || !hasMany) return;

      const point = event.changedTouches[0];
      const dx = point.clientX - start.x;
      const dy = point.clientY - start.y;

      // آستانه‌ی کافی تا با اسکرول عمودیِ کشو قاطی نشود
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

      if (isRTL) onStep(dx > 0 ? 1 : -1);
      else onStep(dx > 0 ? -1 : 1);
    },
    [hasMany, isRTL, onStep],
  );

  return (
    <section className="relative p-3 sm:p-5 lg:sticky lg:top-0 lg:h-[calc(92vh-7rem)] lg:self-start lg:p-6">
      <div
        className={`group relative h-[300px] overflow-hidden rounded-[1.75rem] sm:h-[400px] lg:h-full ${theme.imageCard}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* لایه‌های تصویر؛ با محو تدریجی جابه‌جا می‌شوند */}
        {images.map((img, idx) => (
          <Image
            key={`${img}-${idx}`}
            fill
            src={img}
            alt={idx === selectedIndex ? alt : `${alt} ${idx + 1}`}
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority={idx === 0}
            className={`object-cover transition-all duration-700 ease-out ${
              idx === selectedIndex
                ? "scale-100 opacity-100"
                : "scale-[1.06] opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/30" />
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />

        {/* ردیف بالا: دسته‌بندی + شماره تصویر + بستن */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md ${theme.glassChip}`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.55)]" />
              <span className="truncate">{categoryLabel}</span>
            </span>

            {hasMany && (
              <span
                className={`hidden shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold tabular-nums backdrop-blur-md sm:inline-flex ${theme.glassChip}`}
              >
                {formatNumber(selectedIndex + 1, language)} /{" "}
                {formatNumber(images.length, language)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition hover:bg-black/60 active:scale-90 ${theme.glassChip}`}
          >
            <X size={17} />
          </button>
        </div>

        {/* پیکان‌های جابه‌جایی تصویر (فقط دسکتاپ) */}
        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label={previousLabel}
              className={`absolute start-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 backdrop-blur-md transition-all hover:bg-black/60 focus-visible:opacity-100 active:scale-90 lg:flex lg:group-hover:opacity-100 ${theme.glassChip}`}
            >
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label={nextLabel}
              className={`absolute end-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 backdrop-blur-md transition-all hover:bg-black/60 focus-visible:opacity-100 active:scale-90 lg:flex lg:group-hover:opacity-100 ${theme.glassChip}`}
            >
              {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </>
        )}

        {/* تصاویر کوچک */}
        {hasMany && (
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-2xl border border-white/10 bg-black/40 p-2 shadow-xl backdrop-blur-md">
              {images.map((img, idx) => {
                const active = idx === selectedIndex;
                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => onSelect(idx)}
                    aria-current={active}
                    aria-label={`${alt} ${idx + 1}`}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      active
                        ? "border-emerald-400 opacity-100 shadow-lg shadow-emerald-500/30"
                        : "border-white/20 opacity-60 hover:border-white/60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      fill
                      src={img}
                      alt=""
                      sizes="64px"
                      className="object-cover"
                    />
                    {active && (
                      <span className="absolute inset-0 bg-emerald-400/10" />
                    )}
                  </button>
                );
              })}
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
    <SectionCard
      icon={Scale}
      title={title}
      trailing={
        <span
          className={`shrink-0 rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-bold tabular-nums dark:bg-white/[0.06] ${theme.softText}`}
        >
          {perUnitLabel}: {formatNumber(basePrice, language)}
        </span>
      }
      bodyClassName="p-3.5"
    >
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
              {active && (
                <span className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/25 ring-1 ring-white/40">
                  <Check size={11} strokeWidth={3.5} />
                </span>
              )}

              <span className="text-[13px] font-black leading-tight">
                {formatWeight(option.grams, language)}
              </span>
              <span
                className={`text-[12px] font-black tabular-nums ${
                  active ? "opacity-95" : theme.priceText
                }`}
              >
                {formatPrice(
                  computeWeightPrice(basePrice, option.grams),
                  language,
                  currencyWord,
                )}
              </span>
              {isBaseUnit && (
                <span
                  className={`text-[10px] font-bold ${
                    active
                      ? "opacity-75"
                      : "text-emerald-700/70 dark:text-emerald-200/70"
                  }`}
                >
                  {perUnitLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* <p className={`mt-3 text-[11px] leading-5 ${theme.softText}`}>{note}</p> */}
    </SectionCard>
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

  const reviewsRef = useRef<HTMLElement | null>(null);

  const isEnglish = language === "en";
  const isRTL = !isEnglish;
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

  /** تگ کنترلی وزن فقط برای محاسبه است و به مشتری نمایش داده نمی‌شود */
  const visibleTags = useMemo(
    () => tags.filter((tag) => !WEIGHT_TAG_PATTERN.test(String(tag).trim())),
    [tags],
  );

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
      ratingStats.totalReviews > 0
        ? ratingStats.averageRating.toFixed(1)
        : null,
    [ratingStats.averageRating, ratingStats.totalReviews],
  );

  /* ── رویدادها ───────────────────────────────────────────── */

  const handleSelectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleStepImage = useCallback(
    (delta: number) => {
      setSelectedImageIndex((prev) => {
        const total = images.length;
        if (total <= 1) return prev;
        return (prev + delta + total) % total;
      });
    },
    [images.length],
  );

  const handleToggleDescription = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleIncrease = useCallback(() => {
    setQuantity((prev) => Math.min(MAX_QUANTITY, prev + 1));
  }, []);

  const handleDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  /** با کلیک روی امتیاز، مستقیم به بخش نظرات می‌رویم */
  const handleScrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const metaCount = (food.cooking_time ? 1 : 0) + (food.serves ? 1 : 0);
  const isLongDescription = description.length > 180;

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
          className="relative flex min-h-0 flex-1 flex-col"
        >
          {/* هاله‌ی ملایم زمردی پشت هدر (بدون بلور تا اسکرول سنگین نشود) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)] dark:bg-[radial-gradient(70%_100%_at_50%_0%,rgba(16,185,129,0.16),transparent_70%)]" />

          {/* محتوای اسکرول‌شونده */}
          <div className="smooth-scroll-area scrollbar-hide relative min-h-0 flex-1 overflow-y-auto">
            <div className="grid min-h-full grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <GallerySection
                images={images}
                selectedIndex={selectedImageIndex}
                onSelect={handleSelectImage}
                onStep={handleStepImage}
                onClose={onClose}
                alt={name}
                categoryLabel={categoryLabel}
                closeLabel={t("close")}
                previousLabel={t("previousImage")}
                nextLabel={t("nextImage")}
                language={lang}
                isRTL={isRTL}
              />

              {/* بخش جزئیات */}
              <section className="flex flex-col gap-4 px-4 pb-6 pt-4 sm:px-6 lg:px-7 lg:py-7">
                {/* سربرگ: نشان‌ها + نام + قیمت */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      className={`gap-2 rounded-full px-3 py-1 text-[11px] font-bold hover:bg-transparent ${
                        food.is_available
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                          : "border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-200"
                      }`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        {food.is_available && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                            food.is_available
                              ? "bg-emerald-500 dark:bg-emerald-400"
                              : "bg-rose-500 dark:bg-rose-400"
                          }`}
                        />
                      </span>
                      {food.is_available ? t("available") : t("notAvailable")}
                    </Badge>

                    {isShopBranch && (
                      <Badge className="gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-500/10 dark:border-teal-300/20 dark:bg-teal-400/10 dark:text-teal-200 dark:hover:bg-teal-400/10">
                        <Package size={13} />
                        {t("shopProduct")}
                      </Badge>
                    )}

                    {ratingLabel && (
                      <button
                        type="button"
                        onClick={handleScrollToReviews}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-400/20 active:scale-95 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-200 dark:hover:bg-amber-300/20"
                      >
                        <Star
                          size={13}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="tabular-nums">{ratingLabel}</span>
                        <span className="tabular-nums opacity-60">
                          ({formatNumber(ratingStats.totalReviews, lang)})
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h1
                        className={`text-[1.7rem] font-black leading-[1.2] tracking-tight sm:text-4xl ${
                          isEnglish ? "font-[Montserrat]" : "font-[BTitr]"
                        } ${theme.strongText}`}
                      >
                        {name}
                      </h1>

                      {/* خط تزئینی زیر نام */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                        <span className="h-1 w-1.5 rounded-full bg-emerald-500/40" />
                        <span className="h-1 w-1.5 rounded-full bg-emerald-500/20" />
                      </div>
                    </div>

                    {/* کاشی قیمت */}
                    <div
                      className={`relative flex w-full shrink-0 items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-3 sm:w-auto sm:flex-col sm:items-start sm:justify-center sm:gap-0.5 ${theme.priceBox}`}
                    >
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(80%_120%_at_100%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
                      <p
                        className={`relative text-[10px] font-bold tracking-wide ${theme.priceLabel}`}
                      >
                        {selectedWeight
                          ? formatWeight(selectedWeight.grams, lang)
                          : t("priceLabel")}
                      </p>
                      <p
                        className={`relative whitespace-nowrap text-base font-black tabular-nums sm:text-lg ${theme.priceText}`}
                      >
                        {priceText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ویژگی‌ها و تگ‌ها */}
                {(showFoodBadges || visibleTags.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {showFoodBadges && food.is_spicy && (
                      <Badge className="gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-500/10 dark:border-rose-300/20 dark:bg-rose-400/15 dark:text-rose-100 dark:hover:bg-rose-400/15">
                        <Flame size={13} />
                        {t("spicy")}
                      </Badge>
                    )}

                    {showFoodBadges && food.is_vegetarian && (
                      <Badge className="gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[11px] font-bold text-green-700 hover:bg-green-500/10 dark:border-green-300/20 dark:bg-green-500/15 dark:text-green-100 dark:hover:bg-green-500/15">
                        <Leaf size={13} />
                        {t("vegetarian")}
                      </Badge>
                    )}

                    {visibleTags.map((tag) => (
                      <span
                        key={String(tag)}
                        className={`inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.03] px-3 py-1.5 text-[11px] font-bold dark:border-white/10 dark:bg-white/[0.05] ${theme.mutedText}`}
                      >
                        <Tag
                          size={12}
                          className="text-emerald-600 dark:text-emerald-300"
                        />
                        {String(tag)}
                      </span>
                    ))}
                  </div>
                )}

                {/* اطلاعات غذا (برای محصولات فروشگاهی نمایش داده نمی‌شود) */}
                {showFoodMeta && (
                  <div
                    className={`grid gap-2.5 ${
                      metaCount > 1 ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {food.cooking_time && (
                      <StatCard
                        icon={Clock}
                        label={t("cookingTime")}
                        value={`${formatNumber(food.cooking_time, lang)} ${t(
                          "minutes",
                        )}`}
                      />
                    )}

                    {food.serves && (
                      <StatCard
                        icon={Users}
                        label={t("serves")}
                        value={`${formatNumber(food.serves, lang)} ${t(
                          "people",
                        )}`}
                      />
                    )}
                  </div>
                )}

                {/* توضیحات */}
                {description && (
                  <SectionCard
                    icon={NotebookText}
                    title={descriptionTitle}
                    trailing={
                      isLongDescription ? (
                        <button
                          type="button"
                          onClick={handleToggleDescription}
                          aria-expanded={isExpanded}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${theme.accentPill}`}
                        >
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                          {descriptionButtonText}
                        </button>
                      ) : undefined
                    }
                  >
                    <div className="relative">
                      <p
                        className={`text-sm font-medium leading-7 ${
                          theme.mutedText
                        } ${isExpanded ? "" : "line-clamp-4"}`}
                      >
                        {description}
                      </p>

                      {/* محو تدریجی انتهای متن وقتی بسته است */}
                      {isLongDescription && !isExpanded && (
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-white to-transparent dark:from-[#0e0e10]" />
                      )}
                    </div>
                  </SectionCard>
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

                {/* مواد تشکیل‌دهنده / محتویات */}
                {ingredients && (
                  <SectionCard
                    icon={isShopBranch ? Package : ChefHat}
                    title={ingredientsTitle}
                  >
                    <p
                      className={`text-sm font-medium leading-7 ${theme.mutedText}`}
                    >
                      {ingredients}
                    </p>
                  </SectionCard>
                )}

                {/* نظرات */}
                <SectionCard
                  icon={Star}
                  title={t("reviews")}
                  variant="bare"
                  className="pt-1"
                  cardRef={reviewsRef}
                >
                  <RatingSystem
                    foodId={food.id}
                    onRatingStatsChange={setRatingStats}
                  />
                </SectionCard>
              </section>
            </div>
          </div>

          {/* نوار پایین: تعداد + قیمت + افزودن به سبد */}
          <footer
            className={`relative shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 ${theme.footerBar}`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex shrink-0 items-center gap-0.5 rounded-2xl p-1 ${theme.stepperBox}`}
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
                  className={`min-w-9 px-1 text-center text-sm font-black tabular-nums ${theme.strongText}`}
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
                className={`group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-4 py-3 transition-all duration-300 active:scale-[0.98] ${theme.addButton}`}
              >
                {/* برقِ عبوری هنگام هاور */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {food.is_available ? (
                  <ShoppingCart size={18} className="relative shrink-0" />
                ) : (
                  <BadgeCheck size={18} className="relative shrink-0" />
                )}
                <span className="relative flex min-w-0 flex-col items-start leading-tight">
                  <span className="truncate text-sm font-black">
                    {food.is_available ? addButtonLabel : t("notAvailable")}
                  </span>
                  <span className="truncate text-[11px] font-bold tabular-nums opacity-90">
                    {food.is_available
                      ? quantity > 1
                        ? `${formatNumber(quantity, lang)} × ${totalText}`
                        : totalText
                      : t("guideBranch")}
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
  