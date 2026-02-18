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
import CartDrawer from "@/components/CartDrawer";
import FoodDetails from "@/components/FoodDetails";
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

// ==================== کامپوننت کارت غذا (بدون انیمیشن) ====================
const FoodCard = memo(function FoodCard({
  food,
  language,
  getFoodName,
  getIngredients,
  t,
  handleFoodClick,
  index,
}: {
  food: Food;
  language: string;
  getFoodName: (food: Food) => string;
  getIngredients: (food: Food) => string;
  t: (key: string) => string;
  handleFoodClick: (food: Food) => void;
  index: number;
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative flex items-center w-full h-34 glass-card-3d bg-accent dark:bg-[#191919] border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer will-change-transform"
      onClick={() => handleFoodClick(food)}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="w-4/12 h-full z-10 rounded-2xl p-[1.5px] bg-[linear-gradient(130deg,#d62828_0%,transparent_35%),linear-gradient(-45deg,#d62828_0%,transparent_35%)]">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
          )}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-xs text-gray-500"></span>
            </div>
          ) : (
            <Image
              src={food.image_url || "/placeholder-food.jpg"}
              alt={getFoodName(food)}
              width={120}
              height={120}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading={index < 6 ? "eager" : "lazy"}
              priority={index < 6}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
              sizes="120px"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col mx-3 w-8/12 overflow-hidden py-2">
        <div className="mb-5">
          <h2 className="text-md font-bold truncate">{getFoodName(food)}</h2>
          {getIngredients(food) && (
            <p className="text-[12px] line-clamp-2 leading-4.5">
              {getIngredients(food).toString()}
            </p>
          )}
          <span className="text-[13px] font-bold text-green-600 mt-1 inline-block">
            {food.price.toLocaleString()} {t("price")}
          </span>
        </div>

        <div>
          {!food.is_available ? (
            <Badge variant="destructive" className="opacity-80">
              {t("notAvailable")}
            </Badge>
          ) : (
            <div
              className={`absolute bottom-2 ${
                language === "en" ? "right-2" : "left-2"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <AddToCartButton food={food} getFoodName={getFoodName} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FoodCard.displayName = "FoodCard";

// ==================== کامپوننت دکمه دسته‌بندی (بدون انیمیشن) ====================
const CategoryButton = memo(function CategoryButton({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      className={`${
        isSelected
          ? "dark:bg-white rounded-full dark:text-black border transition-all duration-200"
          : "bg-transparent border dark:text-white rounded-full text-black transition-all duration-200"
      } text-[13px] min-w-max`}
    >
      {children}
    </Button>
  );
});

CategoryButton.displayName = "CategoryButton";

// ==================== کامپوننت اصلی ====================
export default function Home() {
  const id = useId();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDeferredValue(searchInput);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // ========== گرفتن اطلاعات از دیتابیس بر اساس شعبه ==========
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // پاک کردن کش قبلی
        sessionStorage.removeItem("cached_foods");
        sessionStorage.removeItem("cached_categories");
        sessionStorage.removeItem("cache_timestamp");

        let foodsQuery = supabase
          .from("foods")
          .select("*")
          .eq("is_available", true);

        // فیلتر بر اساس شعبه انتخاب شده
        if (selectedBranch?.id) {
          foodsQuery = foodsQuery.or(
            `branch_id.eq.${selectedBranch.id},branch_id.is.null`,
          );
        } else {
          foodsQuery = foodsQuery.is("branch_id", null);
        }

        const [{ data: foodsData }, { data: categoriesData }] =
          await Promise.all([
            foodsQuery,
            supabase
              .from("categories")
              .select("*")
              .order("order_number", { ascending: true, nullsFirst: false }),
          ]);

        if (isMounted) {
          const cleanedFoods = (foodsData || []).map((food) => ({
            ...food,
            category: food.category?.trim(),
          }));
          setFoods(cleanedFoods);

          const cleanedCategories = (categoriesData || []).map((cat) => ({
            ...cat,
            slug: cat.slug?.trim(),
            name: cat.name || "",
            name_ar: cat.name_ar || "",
          }));
          setCategories(cleanedCategories);

          // ذخیره در کش با کلید مخصوص هر شعبه
          if (selectedBranch?.id) {
            sessionStorage.setItem(
              `cached_foods_${selectedBranch.id}`,
              JSON.stringify(cleanedFoods),
            );
            sessionStorage.setItem(
              `cached_categories_${selectedBranch.id}`,
              JSON.stringify(cleanedCategories),
            );
            sessionStorage.setItem(
              `cache_timestamp_${selectedBranch.id}`,
              Date.now().toString(),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // بررسی کش مخصوص هر شعبه
    const checkCache = () => {
      if (!selectedBranch?.id) return false;

      const cachedFoods = sessionStorage.getItem(
        `cached_foods_${selectedBranch.id}`,
      );
      const cachedCategories = sessionStorage.getItem(
        `cached_categories_${selectedBranch.id}`,
      );
      const cacheTimestamp = sessionStorage.getItem(
        `cache_timestamp_${selectedBranch.id}`,
      );
      const cacheAge = cacheTimestamp
        ? Date.now() - parseInt(cacheTimestamp)
        : Infinity;

      if (cachedFoods && cachedCategories && cacheAge < 5 * 60 * 1000) {
        setFoods(JSON.parse(cachedFoods));
        setCategories(JSON.parse(cachedCategories));
        setLoading(false);
        return true;
      }
      return false;
    };

    if (!checkCache()) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedBranch?.id]); // وابستگی به selectedBranch

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
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="flex items-center justify-center flex-col">
          <Loader />
          <p className="mt-2">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-screen px-5 dark:text-gray-200 py-2 pt-5 overflow-y-auto touch-pan-y"
    >
      {/* پس‌زمینه */}
      <div className="fixed inset-0 -z-1 pointer-events-none">
        <DotPattern
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>

      {/* هدر */}
      <div
        className={`text-3xl font-bold flex justify-between items-center ${language === "en" ? "mb-1" : "mb-2"} relative z-10`}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <h1
          className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}
        >
          {t("menu")}
        </h1>
          <button
            className="border rounded-full bg-accent dark:bg-[#191919] dark:text-white p-2 active:scale-95 transition-transform duration-75"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push("/");
            }
          }>
            <ChevronLeft
              size={20}
              className={`${language === "en" ? "rotate-180" : ""}`}
            />
          </button>
      </div>

      {/* جستجو */}
      <div
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
      </div>

      {/* دسته‌بندی‌ها */}
      <div className="mt-3 z-50">
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

            {activeCategories.map((category, index) => (
              <CategoryButton
                key={category.id}
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
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* کارت‌های غذا */}
      <div className="mt-3 relative z-10">
        {selectedCategory ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
              <div className="col-span-full border text-center py-8 rounded-lg">
                {t("noFoodInCategory")}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(
                ([categorySlug, categoryFoods], categoryIndex) => (
                  <div key={categorySlug} className="space-y-4">
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
                  </div>
                ),
              )
            ) : (
              <div className="flex items-center justify-center min-h-[70vh] text-center py-8 dark:text-gray-300 w-full">
                {t("noFoods")}
              </div>
            )}
          </div>
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
      <div className="text-center dark:text-gray-200 text-sm py-6 w-full relative z-10">
        <p>{selectedBranch?.name_en || selectedBranch?.name_fa || ""}</p>© 2025
        Watandar Restaurant
      </div>
    </main>
  );
}