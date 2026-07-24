"use client";

import { useState, useMemo, useCallback, SetStateAction } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useMenuData } from "@/hooks/useMenuData";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CategoryList from "./components/CategoryList";
import FoodSection from "./components/FoodSection";
import FoodModal from "./components/FoodModal";
import Loader from "@/components/Loader";

import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartDrawer from "@/components/CartDrawer";
import Footer from "./components/Footer";

export default function HomeContent() {
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();
  const t = useTranslate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { foods, categories, loading, error } = useMenuData({
    selectedBranchId: selectedBranch?.id,
  });

  // ========= توابع نام غذا / توضیحات / مواد تشکیل‌دهنده =========
  const getFoodName = useCallback(
    (food: { name_fa: any; name_ar: any; name_en: any }) => {
      if (language === "fa") return food.name_fa;
      if (language === "ar") return food.name_ar;
      return food.name_en;
    },
    [language],
  );

  const getIngredients = useCallback(
    (food: {
      ingredients_fa: any;
      ingredients_ar: any;
      ingredients_en: any;
    }) => {
      if (language === "fa") return food.ingredients_fa || "";
      if (language === "ar") return food.ingredients_ar || "";
      return food.ingredients_en || "";
    },
    [language],
  );

  const getFoodDescription = useCallback(
    (food: {
      description_fa: any;
      description_ar: any;
      description_en: any;
    }) => {
      if (language === "fa") return food.description_fa;
      if (language === "ar") return food.description_ar;
      return food.description_en;
    },
    [language],
  );

  // ========= جستجو =========
  const filteredFoods = useMemo(() => {
    if (!search.trim()) return foods;
    const searchLower = search.toLowerCase();

    return foods.filter(
      (f) =>
        f.name_fa.toLowerCase().includes(searchLower) ||
        f.name_ar.toLowerCase().includes(searchLower) ||
        f.name_en.toLowerCase().includes(searchLower),
    );
  }, [foods, search]);

  // ========= فیلتر دسته‌بندی =========
  const displayedFoods = useMemo(() => {
    if (!category) return filteredFoods;
    return filteredFoods.filter((f) => f.category?.trim() === category);
  }, [filteredFoods, category]);

  // ========= گروه‌بندی غذاها =========
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    displayedFoods.forEach((f) => {
      const slug = f.category || "uncategorized";
      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(f);
    });
    return groups;
  }, [displayedFoods]);

  // ========= دسته‌بندی‌های فعال =========
  const activeCategories = useMemo(() => {
    const usedSlugs = new Set(
      foods.map((f) => f.category?.trim()).filter(Boolean),
    );

    return categories
      .filter((cat) => usedSlugs.has(cat.slug?.trim()))
      .sort((a, b) => (a.order_number ?? 999) - (b.order_number ?? 999));
  }, [foods, categories]);

  // ========= انتخاب غذا =========
  const handleFoodClick = useCallback((food: SetStateAction<null>) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedFood(null);
  }, []);

  /**
   * فقط برای رنگ‌های حالت روشن/تاریک استفاده شده؛
   * ساختار، فاصله‌ها، سایزها و layout تغییر نکرده‌اند.
   */
  const theme = {
    page: "bg-[#fff8ed] text-slate-950 dark:bg-slate-950 dark:text-white transition-colors duration-500",
    panel:
      "border border-black/10 bg-white/75 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30",
    mutedText: "text-slate-600 dark:text-white/80",
    strongText: "text-slate-950 dark:text-white",
    iconBox:
      "border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    accentButton:
      "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950",
  };

  // ========= لودر =========
  if (loading) {
    return (
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className={`min-h-screen ${theme.page} flex items-center justify-center flex-col`}
      >
        <div className="flex justify-center items-center flex-col">
          <Loader />
          <p className={`mt-3 text-sm font-medium ${theme.mutedText}`}>
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className={`relative w-full min-h-screen px-5 py-5 overflow-y-auto touch-pan-y ${theme.page}`}>
      {/* هدر */}
      <Header title={t("menu")} language={language} />

      {/* سرچ */}
      <div className="mt-3 flex items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("search")}
          language={language}
        />
        <div className="flex items-center">
          <LanguageSwitcher />
          <CartDrawer />
        </div>
      </div>

      {/* دسته‌بندی‌ها */}
      <div className="mt-2">
        <CategoryList
          categories={activeCategories}
          active={category}
          onSelect={setCategory}
          t={t}
          language={language}
        />
      </div>

      {/* نمایش غذاها */}
      <div className="mt-3 space-y-8">
        {!category ? (
          Object.entries(grouped).map(([slug, items]) => {
            const categoryObj = categories.find(
              (c) => c.slug?.trim() === slug?.trim(),
            );

            const title =
              slug === "uncategorized"
                ? t("uncategorized")
                : language === "fa"
                  ? categoryObj?.name || slug
                  : language === "ar"
                    ? categoryObj?.name_ar || slug
                    : categoryObj?.slug || slug;

            return (
              <FoodSection
                key={slug}
                title={title}
                foods={items}
                language={language}
                t={t}
                getFoodName={getFoodName}
                getIngredients={getIngredients}
                onSelectFood={handleFoodClick}
              />
            );
          })
        ) : (
          <FoodSection
            title={
              (language === "fa"
                ? categories.find((c) => c.slug === category)?.name
                : language === "ar"
                  ? categories.find((c) => c.slug === category)?.name_ar
                  : category) ?? ""
            }
            foods={displayedFoods}
            language={language}
            t={t}
            getFoodName={getFoodName}
            getIngredients={getIngredients}
            onSelectFood={handleFoodClick}
          />
        )}
      </div>

      {/* مودال جزئیات */}
      <FoodModal
        food={selectedFood}
        isOpen={isDetailsOpen}
        onClose={handleCloseModal}
        getFoodName={getFoodName}
        getIngredients={getIngredients}
        getDescription={getFoodDescription}
      />

      <Footer />
    </main>
  );
}