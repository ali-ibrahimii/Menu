"use client";

import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useMenuData } from "@/hooks/useMenuData";
import { Food } from "@/types";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CategoryList from "./components/CategoryList";
import FoodSection from "./components/FoodSection";
import FoodModal from "./components/FoodModal";
import Footer from "./components/Footer";
import Loader from "@/components/Loader";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartDrawer from "@/components/CartDrawer";

/**
 * فقط برای پوشش حالت روشن/تاریک استفاده شده؛
 * ساختار، فاصله‌ها، سایزها و layout اصلی صفحه تغییر نکرده‌اند.
 */
const theme = {
  page: "bg-[#fff8ed] text-slate-950 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  mutedText: "text-slate-600 dark:text-white/80",
};

export default function HomeContent() {
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();
  const t = useTranslate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { foods, categories, loading } = useMenuData({
    selectedBranchId: selectedBranch?.id,
  });

  // ========= توابع نام غذا / توضیحات / مواد تشکیل‌دهنده =========
  const getFoodName = useCallback(
    (food: Food) => {
      if (language === "fa") return food.name_fa;
      if (language === "ar") return food.name_ar;
      return food.name_en;
    },
    [language],
  );

  const getIngredients = useCallback(
    (food: Food) => {
      if (language === "fa") return food.ingredients_fa || "";
      if (language === "ar") return food.ingredients_ar || "";
      return food.ingredients_en || "";
    },
    [language],
  );

  const getFoodDescription = useCallback(
    (food: Food) => {
      if (language === "fa") return food.description_fa || "";
      if (language === "ar") return food.description_ar || "";
      return food.description_en || "";
    },
    [language],
  );

  // ========= جستجو =========
  const filteredFoods = useMemo(() => {
    if (!search.trim()) return foods;

    const searchLower = search.toLowerCase();

    return foods.filter(
      (f) =>
        f.name_fa?.toLowerCase().includes(searchLower) ||
        f.name_ar?.toLowerCase().includes(searchLower) ||
        f.name_en?.toLowerCase().includes(searchLower),
    );
  }, [foods, search]);

  // ========= فیلتر دسته‌بندی =========
  const displayedFoods = useMemo(() => {
    if (!category) return filteredFoods;
    return filteredFoods.filter((f) => f.category?.trim() === category);
  }, [filteredFoods, category]);

  // ========= گروه‌بندی غذاها =========
  const grouped = useMemo(() => {
    const groups: Record<string, Food[]> = {};

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
  const handleFoodClick = useCallback((food: Food) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedFood(null);
  }, []);

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
    <main
      dir={language === "en" ? "ltr" : "rtl"}
      className={`relative w-full min-h-screen px-5 py-5 overflow-y-auto touch-pan-y ${theme.page} flex flex-col`}
    >
      {/* محتوای اصلی - flex-1 باعث می‌شود Footer پایین صفحه بماند */}
      <div className="flex-1">
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

      {/* فوتر */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
}
