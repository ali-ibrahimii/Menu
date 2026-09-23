"use client";

/**
 * ⚠️ صفحه‌ی موقتِ پیش‌نمایش دیزاین — فقط برای بررسی بصری FoodDetails و BranchDrawer.
 * هیچ ارتباطی با دیتابیس ندارد و با خیال راحت می‌شود حذفش کرد.
 */

import { useEffect, useState } from "react";
import FoodDetails from "@/components/FoodDetails";
import BranchDrawer from "@/components/home/BranchDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { translations } from "@/translations/translation";
import type { Branch, Food } from "@/types";

const RESTAURANT_BRANCH: Branch = {
  id: "preview-restaurant",
  slug: "vatandar-main",
  name_fa: "شعبه مرکزی",
  name_ar: "الفرع الرئيسي",
  name_en: "Main Branch",
  address_fa: "مشهد، بلوار وکیل‌آباد",
  address_ar: "مشهد، boulevard",
  address_en: "Mashhad, Vakilabad Blvd",
  phone_1: "05138000000",
  phone_2: "",
  Instagram: "",
  latitude: "36.29",
  longitude: "59.60",
  is_active: true,
  is_open: true,
};

const SHOP_BRANCH: Branch = {
  ...RESTAURANT_BRANCH,
  id: "preview-shop",
  slug: "vatandar-shop",
  name_fa: "سوغات وطن‌دار",
  name_ar: "متجر وطن‌دار",
  name_en: "Vatandar Shop",
};

const FOOD: Food = {
  id: "preview-food",
  name_fa: "قابلی پلو با گوشت گوسفندی",
  name_ar: "قابلي پلو باللحم",
  name_en: "Qabili Palao with Lamb",
  description_fa:
    "قابلی پلو یکی از معروف‌ترین غذاهای افغانستان است که با برنج دانه‌بلند، گوشت گوسفندی آرام‌پز، زردک رشته‌شده، کشمش و ادویه‌ی مخصوص قابلی تهیه می‌شود. این غذا در رستوران وطندار هر روز به‌صورت تازه و با گوشت گرم آماده می‌شود و همراه با سالاد فصل و نوشیدنی سنتی سرو می‌گردد. اگر به طعم اصیل و سنتی علاقه دارید، قابلی پلو انتخاب اول شما خواهد بود.",
  description_ar:
    "قابلي پلو من أشهر الأطباق الأفغانية ويُحضّر باللحم الطازج والأرز طويل الحبة.",
  description_en:
    "Qabili Palao is one of the most famous Afghan dishes, prepared with slow-cooked lamb, long-grain rice, julienned carrots, raisins and a special spice blend.",
  price: 320000,
  image_url: "/branch1/1.jpg",
  images: [
    "/branch1/1.jpg",
    "/branch1/2.jpg",
    "/branch1/3.jpg",
    "/branch1/4.jpg",
  ],
  category: "غذاهای افغانی",
  category_id: "preview-category",
  branch_id: "preview-restaurant",
  is_available: true,
  is_spicy: true,
  is_vegetarian: false,
  ingredients_fa:
    "برنج دانه‌بلند، گوشت گوسفندی، پیاز، زردک، کشمش، بادام، ادویه‌ی قابلی، زعفران",
  ingredients_ar: "أرز، لحم غنم، جزر، زبيب، مكسرات",
  ingredients_en:
    "Long-grain rice, lamb, onion, carrot, raisins, almonds, saffron",
  tags: ["وزن:500,1000,2000", "پرفروش", "سنتی"],
  cooking_time: 45,
  serves: 2,
  created_at: "",
  updated_at: "",
};

export default function DesignPreviewPage() {
  const { language, setLanguage } = useLanguage();
  const { setSelectedBranch } = useBranch();

  const [shopMode, setShopMode] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  useEffect(() => {
    setSelectedBranch(shopMode ? SHOP_BRANCH : RESTAURANT_BRANCH);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopMode]);

  const t = (key: string) =>
    (translations[language] as Record<string, string>)[key] ?? key;

  const toolbarButton =
    "rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:text-emerald-700 active:scale-95 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80 dark:hover:text-emerald-300";

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-[#0a0908] dark:text-white sm:p-8"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-lg font-black">پیش‌نمایش دیزاین (صفحه‌ی موقت)</h1>
          <p className="mt-1 text-xs opacity-60">
            این صفحه فقط برای دیدن FoodDetails و BranchDrawer با داده‌ی ساختگی
            است.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={toolbarButton}
            onClick={() => setIsDetailsOpen(true)}
          >
            باز کردن جزئیات غذا
          </button>

          <button
            type="button"
            className={toolbarButton}
            onClick={() => setShopMode((prev) => !prev)}
          >
            {shopMode ? "حالت فروشگاه (وزنی) ✓" : "حالت رستوران ✓"}
          </button>

          <span className="mx-1 h-5 w-px bg-black/10 dark:bg-white/15" />

          {(["fa", "ar", "en"] as const).map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => setLanguage(lng)}
              className={`${toolbarButton} ${
                language === lng
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : ""
              }`}
            >
              {lng.toUpperCase()}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-black/10 dark:bg-white/15" />

          <ThemeToggle variant="button" />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <BranchDrawer
            branch={shopMode ? SHOP_BRANCH : RESTAURANT_BRANCH}
            onClearBranch={() => setShopMode(false)}
            t={t}
          />
          <p className="text-xs opacity-60">
            دکمه‌ی منو را بزنید تا کشوی شعبه (و دکمه‌ی جدیدِ حالت روز/شب) را
            ببینید.
          </p>
        </div>
      </div>

      <FoodDetails
        food={FOOD}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        getFoodName={(f) =>
          language === "en"
            ? f.name_en || f.name_fa
            : language === "ar"
              ? f.name_ar || f.name_fa
              : f.name_fa
        }
        getIngredients={(f) =>
          (language === "en"
            ? f.ingredients_en
            : language === "ar"
              ? f.ingredients_ar
              : f.ingredients_fa) || ""
        }
        getFoodDescription={(f) =>
          (language === "en"
            ? f.description_en
            : language === "ar"
              ? f.description_ar
              : f.description_fa) || ""
        }
      />
    </div>
  );
}
