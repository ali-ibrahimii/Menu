/**
 * منطق محصولات وزن‌دار شعبه‌ی فروشگاهی (سوغات وطن‌دار / آجیل‌فروشی).
 *
 * این فایل تنها جای پروژه است که «قیمت بر اساس وزن» در آن محاسبه می‌شود؛
 * هم جزئیات محصول (FoodDetails)، هم سبد خرید و هم رسید سفارش از همین توابع
 * استفاده می‌کنند تا قیمت‌ها هیچ‌وقت با هم فرق نکنند.
 *
 * ── تنظیمات سریع ────────────────────────────────────────────────
 * ۱) قیمت ثبت‌شده در دیتابیس برای چه وزنی است؟ → BASE_UNIT_GRAMS
 * ۲) چه وزن‌هایی به مشتری پیشنهاد شود؟        → DEFAULT_WEIGHT_OPTIONS
 * ۳) قیمت وزن‌های خرد چطور گِرد شود؟          → ROUND_TO_TOMAN
 * ۴) برای یک محصول خاص وزن متفاوت بخواهید؟    → در تگ‌های آن محصول
 *    عبارت «weight:500,1000» یا «وزن:250,500,1000» را اضافه کنید.
 * ───────────────────────────────────────────────────────────────
 */

export type ShopLanguage = "fa" | "ar" | "en";

/** slug شعبه‌هایی که محصولاتشان وزنی فروخته می‌شود */
export const SHOP_BRANCH_SLUGS = [
  "vatandar-shop",
  "ajil",
  "nuts",
  "vatandar-ajil",
  "ajilforooshi-vatandar",
] as const;

export function isShopBranchSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return (SHOP_BRANCH_SLUGS as readonly string[]).includes(slug);
}

/**
 * قیمت ثبت‌شده در دیتابیس، قیمت این وزن است (به گرم).
 * پیش‌فرض: ۱۰۰۰ گرم، یعنی «قیمت هر کیلوگرم».
 */
export const BASE_UNIT_GRAMS = 1000;

/**
 * قیمت نهایی به نزدیک‌ترین این عدد گِرد می‌شود (تومان).
 * ۱۰ = گرد به نزدیک‌ترین ۱۰ تومان (اختلاف ناچیز، عدد تمیز).
 * اگر می‌خواهید قیمت دقیق باشد این عدد را ۱ بگذارید.
 */
export const ROUND_TO_TOMAN = 10;

export type WeightOption = {
  /** کلید یکتای وزن؛ در سبد خرید هم همین استفاده می‌شود */
  id: string;
  /** وزن به گرم */
  grams: number;
};

export const DEFAULT_WEIGHT_OPTIONS: WeightOption[] = [
  { id: "500g", grams: 500 },
  { id: "1kg", grams: 1000 },
];

/**
 * وزن‌های پیشنهادی یک محصول.
 * اگر در تگ‌های محصول عبارت `weight:500,1000` (یا `وزن:500,1000`) باشد،
 * همان وزن‌ها استفاده می‌شود؛ در غیر این صورت DEFAULT_WEIGHT_OPTIONS.
 */
export function getWeightOptions(tags?: string[] | null): WeightOption[] {
  const raw = (tags ?? []).find((tag) =>
    /^(weight|وزن|وزني|وزنی)\s*:/i.test(String(tag ?? "").trim()),
  );

  if (!raw) return DEFAULT_WEIGHT_OPTIONS;

  const grams = String(raw)
    .slice(String(raw).indexOf(":") + 1)
    .split(/[,،\s]+/)
    .map((part) => Number(part.trim()))
    .filter((g) => Number.isFinite(g) && g > 0)
    .sort((a, b) => a - b);

  if (grams.length === 0) return DEFAULT_WEIGHT_OPTIONS;

  // حذف وزن‌های تکراری
  return Array.from(new Set(grams)).map((grams) => ({
    id: `${grams}g`,
    grams,
  }));
}

/** گِرد کردن قیمت به نزدیک‌ترین ROUND_TO_TOMAN تومان */
export function roundPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (ROUND_TO_TOMAN <= 1) return Math.round(value);
  return Math.round(value / ROUND_TO_TOMAN) * ROUND_TO_TOMAN;
}

/**
 * قیمت یک وزن مشخص، بر اساس قیمت پایه‌ی محصول (که قیمت BASE_UNIT_GRAMS است).
 * مثال: basePrice = 350000 (هر کیلو) → ۵۰۰ گرم = ۱۷۵۰۰۰ تومان
 */
export function computeWeightPrice(basePrice: number, grams: number): number {
  if (!Number.isFinite(basePrice) || basePrice <= 0) return 0;
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  return roundPrice((basePrice * grams) / BASE_UNIT_GRAMS);
}

const NUMBER_LOCALES: Record<ShopLanguage, string> = {
  fa: "fa-IR",
  ar: "ar",
  en: "en-US",
};

/** تبدیل عدد به رشته با ارقام متناسب با زبان کاربر (۱٬۲۳۴ / 1,234) */
export function formatNumber(value: number, language: ShopLanguage): string {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return safe.toLocaleString(NUMBER_LOCALES[language] ?? "en-US");
  } catch {
    return safe.toLocaleString();
  }
}

/** مثال: «نیم کیلوگرم» / «۱ کیلوگرم» / «۲۵۰ گرم» */
export function formatWeight(grams: number, language: ShopLanguage): string {
  const num = formatNumber(grams, language);

  if (language === "fa") {
    if (grams === 500) return "نیم کیلوگرم";
    if (grams === BASE_UNIT_GRAMS) return "یک کیلوگرم";
    if (grams < BASE_UNIT_GRAMS) return `${num} گرم`;
    const kg = formatKilograms(grams, language);
    return `${kg} کیلوگرم`;
  }

  if (language === "ar") {
    if (grams === 500) return "نصف كيلو";
    if (grams < BASE_UNIT_GRAMS) return `${num} غرام`;
    const kg = formatKilograms(grams, language);
    return `${kg} كجم`;
  }

  if (grams < BASE_UNIT_GRAMS) return `${num} g`;
  const kg = formatKilograms(grams, language);
  return `${kg} kg`;
}

function formatKilograms(grams: number, language: ShopLanguage): string {
  const kg = grams / BASE_UNIT_GRAMS;
  const rounded = Math.round(kg * 100) / 100;
  // 1.5 → «۱٫۵» در فارسی/عربی و «1.5» در انگلیسی
  return formatNumber(rounded, language);
}

/** «۳۵۰٬۰۰۰ تومان» / «350,000 Toman» */
export function formatPrice(
  value: number,
  language: ShopLanguage,
  currencyWord: string,
): string {
  return `${formatNumber(Math.max(0, Math.round(value || 0)), language)} ${currencyWord}`;
}

/**
 * متن آماده برای رسید/سبد خرید، مثل «نیم کیلوگرم (۵۰۰ گرم)».
 * اگر weightLabel خالی باشد رشته‌ی خالی برمی‌گرداند.
 */
export function formatVariantLabel(
  weightLabel: string | undefined,
  grams: number | undefined,
  language: ShopLanguage,
): string {
  if (!weightLabel) return "";
  if (!grams || grams <= 0) return weightLabel;
  return `${weightLabel} (${formatNumber(grams, language)}${
    language === "en" ? "g" : " گرم"
  })`;
}

/**
 * نوع (وزن) پیش‌فرض یک محصول وزن‌دار + قیمت آن.
 * همان وزنی است که در پنل جزئیات به‌صورت پیش‌فرض انتخاب شده است؛
 * دکمه‌ی سریعِ افزودن در کارت غذا از این تابع استفاده می‌کند تا قیمتی که
 * در سبد خرید ثبت می‌شود با پنل جزئیات یکی باشد.
 */
export function getDefaultShopVariant(food: {
  price: number;
  tags?: string[] | null;
}) {
  const options = getWeightOptions(food.tags);
  const option =
    options.find((o) => o.grams === BASE_UNIT_GRAMS) ??
    options[options.length - 1];

  if (!option) return null;

  return {
    variant_id: option.id,
    weight_grams: option.grams,
    variant_label_fa: formatWeight(option.grams, "fa"),
    variant_label_ar: formatWeight(option.grams, "ar"),
    variant_label_en: formatWeight(option.grams, "en"),
    price: computeWeightPrice(food.price, option.grams),
  };
}
