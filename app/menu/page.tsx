"use client";

import {
  useId,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useDeferredValue,
  useRef,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import CartDrawer from "@/components/menu/CartDrawer";
import FoodDetails from "@/components/menu/FoodDetails";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useBranch } from "@/contexts/BranchContext";
import Loader from "@/components/Loader";
import Image from "next/image";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { SearchIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/AddToCartButton";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import FoodCard from "@/components/menu/FoodCard";
import CategoryButton from "@/components/menu/CategoryButton";
import { useMenuData } from "@/hooks/useMenuData";




// ==================== کامپوننت اصلی ====================
export default function Home() {
  const id = useId();
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDeferredValue(searchInput);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const {foods, categories, loading, error, refetch} = useMenuData({ selectedBranchId: selectedBranch?.id });

  // ========== توابع ترجمه ==========
  const t = useCallback(
    (key: string) => {
      const langTranslations =
        translations[language as keyof typeof translations];
      return langTranslations[key as keyof typeof langTranslations] || key;
    },
    [language],
  );

  const getFoodName = useCallback(
    (food: Food) => {
      switch (language) {
        case "fa":
          return food.name_fa;
        case "ar":
          return food.name_ar;
        case "en":
          return food.name_en;
        default:
          return food.name_fa;
      }
    },
    [language],
  );

  const getIngredients = useCallback(
    (food: Food) => {
      let ingredients;
      switch (language) {
        case "fa":
          ingredients = food.ingredients_fa;
          break;
        case "ar":
          ingredients = food.ingredients_ar;
          break;
        case "en":
          ingredients = food.ingredients_en;
          break;
        default:
          ingredients = food.ingredients_fa;
      }
      return ingredients?.toString() || "";
    },
    [language],
  );

  const getFoodDescription = useCallback(
    (food: Food) => {
      switch (language) {
        case "fa":
          return food.description_fa;
        case "ar":
          return food.description_ar;
        case "en":
          return food.description_en;
        default:
          return food.description_fa;
      }
    },
    [language],
  );

  // ========== هندلرها ==========
  const handleFoodClick = useCallback((food: Food) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedFood(null);
  }, []);

  const handleCategoryClick = useCallback((categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ========== فیلترها ==========
  const filteredFoodsBySearch = useMemo(() => {
    if (!searchTerm.trim()) return foods;

    const searchLower = searchTerm.toLowerCase();
    return foods.filter(
      (food) =>
        food.name_fa.toLowerCase().includes(searchLower) ||
        food.name_ar.toLowerCase().includes(searchLower) ||
        food.name_en.toLowerCase().includes(searchLower),
    );
  }, [foods, searchTerm]);

  const displayedFoods = useMemo(() => {
    if (!selectedCategory) return filteredFoodsBySearch;
    return filteredFoodsBySearch.filter(
      (food) => food.category?.trim() === selectedCategory?.trim(),
    );
  }, [filteredFoodsBySearch, selectedCategory]);

  const groupedFoods = useMemo(() => {
    const grouped: Record<string, Food[]> = {};
    displayedFoods.forEach((food) => {
      const categoryKey = food.category || "uncategorized";
      if (!grouped[categoryKey]) grouped[categoryKey] = [];
      grouped[categoryKey].push(food);
    });
    return grouped;
  }, [displayedFoods]);

  const activeCategories = useMemo(() => {
    const uniqueCategorySlugs = new Set(
      foods.map((food) => food.category?.trim()).filter(Boolean),
    );
    return categories
      .filter((category) => uniqueCategorySlugs.has(category.slug?.trim()))
      .sort((a, b) => (a.order_number ?? 999) - (b.order_number ?? 999));
  }, [foods, categories]);

  const sortedCategories = useMemo(() => {
    const categoryOrder = [
      "afghan-foods",
      "iranian-foods",
      "breakfast",
      "drinks",
      "hot-drinks",
      "cold-drinks",
      "coffee-based-drinks",
      "dessert",
    ];

    return Object.entries(groupedFoods).sort(([slugA], [slugB]) => {
      const indexA = categoryOrder.indexOf(slugA);
      const indexB = categoryOrder.indexOf(slugB);
      if (indexA === -1 && indexB === -1) {
        const catA = categories.find((c) => c.slug?.trim() === slugA);
        const catB = categories.find((c) => c.slug?.trim() === slugB);
        return (catA?.order_number ?? 999) - (catB?.order_number ?? 999);
      }
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedFoods, categories]);

  const getCategoryName = useCallback(
    (slug: string) => {
      if (!slug || slug === "uncategorized") {
        return language === "en"
          ? "Uncategorized"
          : language === "ar"
            ? "غير مصنف"
            : "دسته‌بندی نشده";
      }

      const category = categories.find(
        (cat) => cat.slug?.trim().toLowerCase() === slug?.trim().toLowerCase(),
      );

      if (!category) {
        return slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      switch (language) {
        case "en":
          return slug;
        case "ar":
          return category.name_ar;
        default:
          return category.name;
      }
    },
    [categories, language],
  );

  // ========== رندر ==========
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={language === "en" ? "ltr" : "rtl"}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="flex items-center justify-center flex-col">
          <Loader />
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2"
          >
            {t("loading")}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      className="relative w-full min-h-screen px-5 dark:text-gray-200 py-2 pt-5 overflow-y-auto touch-pan-y"
    >
      <div className="fixed inset-0 -z-[1]  pointer-events-none">
        <DotPattern
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>

      {/* هدر */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`text-3xl font-bold flex justify-between items-center ${language === "en" ? "mb-1" : "mb-2"} relative z-10`}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <h1
          className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}
        >
          {t("menu")}
        </h1>
        <Link href="/" prefetch={true}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="active:scale-95 border rounded-full bg-accent dark:bg-[#191919] dark:text-white p-2"
          >
            <ChevronLeft
              size={20}
              className={`${language === "en" ? "rotate-180" : ""}`}
            />
          </motion.button>
        </Link>
      </motion.div>

      {/* جستجو */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex items-center justify-center w-full space-x-1 relative z-10"
      >
        <div className="*:not-first:mt-2 w-full">
          <div dir={language === "en" ? "ltr" : "rtl"} className="relative">
            <Input
              id={id}
              className="peer ps-10 pe-9 py-5 dark:text-gray-200 dark:focus:text-gray-200 rounded-full text-md"
              placeholder={t("search")}
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 pt-1 text-gray-400">
              <SearchIcon
                size={16}
                className={`${language === "en" ? "" : "rotate-90"}`}
              />
            </div>
          </div>
        </div>
        <div className="flex shrink-0">
          <LanguageSwitcher />
          <CartDrawer />
        </div>
      </motion.div>

      {/* دسته‌بندی‌ها */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mt-3 z-50"
      >
        <ScrollArea
          dir={language === "en" ? "ltr" : "rtl"}
          className="flex whitespace-nowrap"
        >
          <div className="flex space-x-2 pb-2">
            <CategoryButton
              isSelected={selectedCategory === null}
              onClick={() => handleCategoryClick(null)}
            >
              {t("allFoods")}
            </CategoryButton>

            <AnimatePresence>
              {activeCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CategoryButton
                    isSelected={selectedCategory === category.slug?.trim()}
                    onClick={() =>
                      handleCategoryClick(category.slug?.trim() || null)
                    }
                  >
                    {language === "en"
                      ? category.slug
                          ?.split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ") || category.name
                      : language === "ar"
                        ? category.name_ar || category.name
                        : category.name || category.slug}
                  </CategoryButton>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </motion.div>

      {/* کارت‌های غذا */}
      <div
        className="mt-3 relative z-10"
      >
          {selectedCategory ? (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
            >
              {displayedFoods.length > 0 ? (
                displayedFoods.map((food, index) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    language={language}
                    getFoodName={getFoodName}
                    getIngredients={getIngredients}
                    t={t}
                    handleFoodClick={handleFoodClick}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full border text-center py-8 rounded-lg"
                >
                  {t("noFoodInCategory")}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all-categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {sortedCategories.length > 0 ? (
                sortedCategories.map(
                  ([categorySlug, categoryFoods], categoryIndex) => (
                    <motion.div
                      key={categorySlug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                      className="space-y-4"
                    >
                      <h2 className="font-bold font-[BTitr]">
                        {getCategoryName(categorySlug)}
                      </h2>
                      <div className="h-px bg-linear-to-r from-transparent via-black dark:via-gray-200 to-transparent" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {categoryFoods.map((food, index) => (
                          <FoodCard
                            key={food.id}
                            food={food}
                            language={language}
                            getFoodName={getFoodName}
                            getIngredients={getIngredients}
                            t={t}
                            handleFoodClick={handleFoodClick}
                            index={index}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ),
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center min-h-[70vh] text-center py-8 dark:text-gray-300 w-full"
                >
                  {t("noFoods")}
                </motion.div>
              )}
            </motion.div>
          )}
      </div>

      {/* جزئیات غذا */}
      {selectedFood && (
        <FoodDetails
          food={selectedFood}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          getFoodName={getFoodName}
          getFoodDescription={getFoodDescription}
          getIngredients={getIngredients}
        />
      )}

      {/* فوتر */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center dark:text-gray-200 text-sm py-6 w-full relative z-10"
      >
        <p>{selectedBranch?.name_en || selectedBranch?.name_fa || ""}</p>© 2025
        Vatandar Restaurant
      </motion.div>
    </motion.main>
  );
}