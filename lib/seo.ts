/**
 * lib/seo.ts
 * ---------------------------------------------------------------------------
 * تنظیمات مرکزی سئو + سازندهٔ Structured Data (JSON-LD) برای رستوران وطندار
 *
 * چرا این فایل وجود دارد؟
 *  - همهٔ مقادیر سئو (دامنه، برند، کلیدواژه‌ها، ساعت کاری و...) یک‌جا نگهداری
 *    می‌شوند تا تغییر آن‌ها فقط از یک نقطه انجام شود.
 *  - Structured Data به‌جای مقادیر placeholder، مستقیم از دیتابیس (جدول‌های
 *    branches / foods / categories / reviews / restaurant_info) ساخته می‌شود
 *    و نتیجه یک ساعت کش می‌شود تا روی عملکرد سایت اثر نگذارد.
 *
 * نکتهٔ مهم دربارهٔ دامنه:
 *  دامنهٔ اصلی سایت از متغیر محیطی NEXT_PUBLIC_SITE_URL خوانده می‌شود.
 *  در Vercel (Settings → Environment Variables) مقدار آن را روی دامنهٔ اصلی
 *  خود بگذارید، مثلاً:  NEXT_PUBLIC_SITE_URL=https://vatandar.ir
 *  اگر تعریف نشود، روی آدرس پیش‌فرض ورسل می‌ماند.
 * ---------------------------------------------------------------------------
 */

import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabaseServer";

/* ------------------------------- تنظیمات پایه ------------------------------ */

/** دامنهٔ canonical سایت (بدون / انتهایی) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vatandar-menu.vercel.app"
).replace(/\/+$/, "");

/** تبدیل مسیر نسبی به آدرس مطلق سایت */
export const absUrl = (path = "/"): string =>
  `${SITE_URL}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

export const BRAND = {
  fa: "رستوران وطندار",
  en: "Vatandar Restaurant",
  ar: "مطعم وطندار",
  shortFa: "وطندار",
} as const;

/**
 * مقادیر پیش‌فرض کسب‌وکار.
 * ⚠️ اگر ساعت کاری یا محدودهٔ قیمتی واقعی فرق دارد، فقط همین‌جا تغییر دهید.
 */
export const SEO_DEFAULTS = {
  city: "مشهد",
  region: "خراسان رضوی",
  country: "IR",
  /** ISO 3166-2 — استان خراسان رضوی */
  geoRegion: "IR-09",
  geoPosition: "36.299265;59.640879",
  cuisines: ["Iranian", "Afghan", "Breakfast", "Cafe"],
  priceRange: "$$",
  currenciesAccepted: "IRR",
  paymentAccepted: "نقدی، کارت بانکی",
  /** ساعت کاری به میلادی/۲۴ساعته برای schema.org */
  opens: "12:00",
  closes: "23:00",
  /** قیمت‌ها در دیتابیس به «تومان» هستند؛ برای schema.org به ریال تبدیل می‌کنیم */
  tomanToRial: 10,
} as const;

export const DEFAULT_DESCRIPTION =
  "منوی آنلاین رستوران وطندار مشهد؛ سفارش آنلاین غذای ایرانی و افغانی، کباب و چلوخورش، صبحانه، نوشیدنی گرم و سرد. مشاهدهٔ منو با قیمت روز، آدرس و تلفن شعبه‌ها و ثبت سفارش حضوری و بیرون‌بر.";

export const KEYWORDS = [
  "رستوران وطندار",
  "وطندار",
  "رستوران وطندار مشهد",
  "منوی آنلاین رستوران وطندار",
  "سفارش آنلاین غذا مشهد",
  "غذای افغانی مشهد",
  "غذای ایرانی مشهد",
  "کباب و چلوکباب مشهد",
  "صبحانه مشهد",
  "کافه و نوشیدنی گرم مشهد",
  "رستوران خانوادگی مشهد",
  "منوی دیجیتال رستوران",
];

/* --------------------------------- تایپ‌ها -------------------------------- */

export type SeoBranch = {
  slug: string | null;
  name_fa: string | null;
  name_en: string | null;
  name_ar: string | null;
  address_fa: string | null;
  address_en: string | null;
  phone_1: string | null;
  phone_2: string | null;
  latitude: string | null;
  longitude: string | null;
  instagram: string | null;
};

export type SeoData = {
  branches: SeoBranch[];
  /** دسته‌بندی‌ها به‌ترتیب نمایش */
  categories: { slug: string | null; name: string | null }[];
  /** آیتم‌های منو (فقط موارد موجود) برای schema.org/Menu */
  foods: { name_fa: string | null; price: number | null; category: string | null }[];
  /** میانگین امتیاز واقعی کاربران از جدول reviews */
  rating: { average: number; count: number } | null;
  social: { instagram: string | null; whatsapp: string | null };
};

/* --------------------------- خواندن داده از دیتابیس ------------------------ */

/** ردیف خام دیتابیس — برای دور زدن no-explicit-any */
type DbRow = Record<string, unknown>;
const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;
const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const EMPTY_SEO_DATA: SeoData = {
  branches: [],
  categories: [],
  foods: [],
  rating: null,
  social: { instagram: null, whatsapp: null },
};

async function fetchSeoData(): Promise<SeoData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // محیط بدون دیتابیس (مثلاً بیلد لوکال) — خروجی خالی ولی معتبر
    return EMPTY_SEO_DATA;
  }

  try {
    const db = createServerClient();

    const [branchesRes, categoriesRes, foodsRes, reviewsRes, infoRes] =
      await Promise.all([
        db
          .from("branches")
          .select(
            "slug,name_fa,name_en,name_ar,address_fa,address_en,phone_1,phone_2,latitude,longitude,Instagram"
          )
          .eq("is_active", true),
        db.from("categories").select("slug,name").order("order_number", {
          ascending: true,
          nullsFirst: false,
        }),
        db
          .from("foods")
          .select("name_fa,price,category,is_available")
          .limit(2000),
        db.from("reviews").select("rating").limit(5000),
        db
          .from("restaurant_info")
          .select("instagram_url,whatsapp_number")
          .eq("is_active", true)
          .limit(1),
      ]);

    const branches: SeoBranch[] = (branchesRes.data ?? []).map((row) => {
      const b = row as DbRow;
      return {
        slug: str(b.slug),
        name_fa: str(b.name_fa),
        name_en: str(b.name_en),
        name_ar: str(b.name_ar),
        address_fa: str(b.address_fa),
        address_en: str(b.address_en),
        phone_1: str(b.phone_1),
        phone_2: str(b.phone_2),
        latitude: str(b.latitude),
        longitude: str(b.longitude),
        instagram: str(b.Instagram),
      };
    });

    const categories = (categoriesRes.data ?? []).map((row) => {
      const c = row as DbRow;
      return {
        slug: str(c.slug),
        name: str(c.name),
      };
    });

    const foods = (foodsRes.data ?? [])
      .filter((row) => (row as DbRow).is_available !== false)
      .map((row) => {
        const f = row as DbRow;
        return {
          name_fa: str(f.name_fa),
          price: num(f.price),
          category: str(f.category),
        };
      });

    const ratings = (reviewsRes.data ?? [])
      .map((row) => Number((row as DbRow).rating))
      .filter((n: number) => Number.isFinite(n) && n > 0);

    const rating =
      ratings.length > 0
        ? {
            average:
              Math.round(
                (ratings.reduce((a: number, b: number) => a + b, 0) /
                  ratings.length) *
                  10
              ) / 10,
            count: ratings.length,
          }
        : null;

    const info = ((infoRes.data ?? [])[0] ?? null) as DbRow | null;

    return {
      branches,
      categories,
      foods,
      rating,
      social: {
        instagram: str(info?.instagram_url),
        whatsapp: str(info?.whatsapp_number),
      },
    };
  } catch (err) {
    // هر خطایی (شبکه، RLS، تایم‌اوت) نباید باعث شکست رندر صفحه شود
    console.error("[seo] failed to load SEO data:", err);
    return EMPTY_SEO_DATA;
  }
}

/** نسخهٔ کش‌شده (یک ساعت) — هم برای layout و هم برای sitemap استفاده می‌شود */
export const getSeoData = unstable_cache(fetchSeoData, ["vatandar-seo-data"], {
  revalidate: 60 * 60,
  tags: ["seo-data"],
});

/* ------------------------------ سازندهٔ JSON-LD ---------------------------- */

const DAY_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Json = Record<string, unknown>;

function buildMenuNode(data: SeoData): Json | null {
  if (data.foods.length === 0) return null;

  const byCategory = new Map<string, Json[]>();
  for (const food of data.foods) {
    const key = food.category ?? "سایر";
    const list = byCategory.get(key) ?? [];
    if (list.length >= 40) continue; // محدودسازی حجم خروجی
    list.push({
      "@type": "MenuItem",
      name: food.name_fa,
      offers: {
        "@type": "Offer",
        price: food.price != null ? food.price * SEO_DEFAULTS.tomanToRial : undefined,
        priceCurrency: SEO_DEFAULTS.currenciesAccepted,
        availability: "https://schema.org/InStock",
        url: absUrl("/menu"),
      },
    });
    byCategory.set(key, list);
  }

  const sections: Json[] = [];
  for (const [name, items] of byCategory) {
    if (sections.length >= 15) break;
    if (items.length === 0) continue;
    sections.push({
      "@type": "MenuSection",
      name,
      inLanguage: "fa",
      hasMenuItem: items,
    });
  }
  if (sections.length === 0) return null;

  return {
    "@type": "Menu",
    "@id": `${SITE_URL}/#menu`,
    name: `منوی ${BRAND.fa}`,
    inLanguage: "fa",
    hasMenuSection: sections,
  };
}

function buildRestaurantNode(
  branch: SeoBranch | null,
  index: number,
  orgId: string,
  menuId: string | null,
  rating: SeoData["rating"],
  sameAs: string[]
): Json {
  const slug = branch?.slug || `branch-${index + 1}`;
  const lat = Number(branch?.latitude);
  const lng = Number(branch?.longitude);
  const addressText = branch?.address_fa || `${SEO_DEFAULTS.city}`;
  const mapsQuery = encodeURIComponent(`${BRAND.fa} ${addressText}`);

  const node: Json = {
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#branch-${slug}`,
    name: branch?.name_fa || BRAND.fa,
    alternateName: [branch?.name_en, branch?.name_ar].filter(Boolean),
    description: DEFAULT_DESCRIPTION,
    url: absUrl("/branches"),
    image: absUrl("/og-image.jpg"),
    telephone: branch?.phone_1 || undefined,
    servesCuisine: SEO_DEFAULTS.cuisines,
    priceRange: SEO_DEFAULTS.priceRange,
    currenciesAccepted: SEO_DEFAULTS.currenciesAccepted,
    paymentAccepted: SEO_DEFAULTS.paymentAccepted,
    acceptsReservations: true,
    address: {
      "@type": "PostalAddress",
      streetAddress: addressText,
      addressLocality: SEO_DEFAULTS.city,
      addressRegion: SEO_DEFAULTS.region,
      addressCountry: SEO_DEFAULTS.country,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...DAY_OF_WEEK],
        opens: SEO_DEFAULTS.opens,
        closes: SEO_DEFAULTS.closes,
      },
    ],
    parentOrganization: { "@id": orgId },
    sameAs,
  };

  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng)) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    };
  }

  if (menuId) node.hasMenu = { "@id": menuId };

  // امتیاز واقعی کاربران فقط روی شعبهٔ اصلی (نود اول)
  if (index === 0 && rating) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return node;
}

/**
 * گراف کامل Structured Data:
 * WebSite + Organization + یک Restaurant به‌ازای هر شعبهٔ فعال + Menu
 */
export function buildJsonLd(data: SeoData): Json {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  const instagram =
    data.social.instagram ||
    data.branches.find((b) => b.instagram)?.instagram ||
    null;
  const sameAs = [instagram].filter(Boolean) as string[];

  const menuNode = buildMenuNode(data);
  const menuId = menuNode ? `${SITE_URL}/#menu` : null;

  const restaurants =
    data.branches.length > 0
      ? data.branches.map((b, i) =>
          buildRestaurantNode(b, i, orgId, menuId, data.rating, sameAs)
        )
      : [buildRestaurantNode(null, 0, orgId, menuId, data.rating, sameAs)];

  const firstPhone = data.branches.find((b) => b.phone_1)?.phone_1 || null;

  const graph: Json[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: BRAND.fa,
      alternateName: [BRAND.en, BRAND.ar, BRAND.shortFa],
      inLanguage: "fa",
      description: DEFAULT_DESCRIPTION,
      publisher: { "@id": orgId },
      image: absUrl("/og-image.jpg"),
    },
    {
      "@type": "Organization",
      "@id": orgId,
      name: BRAND.fa,
      alternateName: [BRAND.en, BRAND.ar],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absUrl("/icons/icon-512.png"),
        width: 512,
        height: 512,
      },
      image: absUrl("/og-image.jpg"),
      sameAs,
      ...(firstPhone
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              telephone: firstPhone,
              contactType: "customer service",
              availableLanguage: ["fa", "en"],
            },
          }
        : {}),
    },
    ...restaurants,
  ];

  if (menuNode) graph.push(menuNode);

  return { "@context": "https://schema.org", "@graph": graph };
}
