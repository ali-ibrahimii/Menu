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
import { LightRays } from "@/components/ui/light-rays";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { ArrowLeft, SearchIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/AddToCartButton";
import { useRouter } from "next/navigation";

// ==================== تابع debounce اختصاصی ====================
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

// ==================== کامپوننت کارت غذا ====================
const FoodCard = memo(function FoodCard({
  food,
  language,
  getFoodName,
  getIngredients,
  t,
  handleFoodClick,
}: {
  food: Food;
  language: string;
  getFoodName: (food: Food) => string;
  getIngredients: (food: Food) => string;
  t: (key: string) => string;
  handleFoodClick: (food: Food) => void;
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative flex items-center w-full h-34 glass-card-3d border backdrop-blur-[2px] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer will-change-transform"
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
              <span className="text-xs text-gray-500">خطا</span>
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
              quality={70}
              loading="lazy"
              onLoadingComplete={() => setIsImageLoading(false)}
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
          <span className="text-[13px] font-bold text-yellow-500 mt-1 inline-block">
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
  const searchTerm = useDeferredValue(searchInput); // استفاده از useDeferredValue به جای debounce
  const [isDataFetched, setIsDataFetched] = useState(false);
  const router = useRouter();

  // ========== توابع ترجمه ==========
  const t = useCallback(
    (key: string) => {
      const langTranslations = translations[language] as Record<string, string>;
      return langTranslations[key] || key;
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

  // ========== گرفتن اطلاعات از دیتابیس ==========
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isDataFetched) return;

      try {
        setLoading(true);

        let foodsQuery = supabase
          .from("foods")
          .select("*")
          .eq("is_available", true);

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
          setIsDataFetched(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch, isDataFetched]);

  // ========== فیلترها ==========
  const filteredFoodsBySearch = useMemo(() => {
    if (!searchTerm.trim()) return foods;

    const searchLower = searchTerm.toLowerCase();
    return foods.filter(
      (food) =>
        food.name_fa.toLowerCase().includes(searchLower) ||
        food.name_ar.toLowerCase().includes(searchLower) ||
        food.name_en.toLowerCase().includes(searchLower) ||
        food.description_en?.toLowerCase().includes(searchLower) ||
        food.description_ar?.toLowerCase().includes(searchLower) ||
        food.description_fa?.toLowerCase().includes(searchLower),
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
    <main className="relative w-full min-h-screen px-5 dark:bg-[#191919] dark:text-gray-200 py-2 pt-5 overflow-y-auto touch-pan-y">
      {/* الگوهای تزئینی */}

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
        <Button
          onClick={() => router.push("/")}
          className="active:scale-95 category-card-default dark:text-white p-2"
        >
          <ChevronLeft
            size={20}
            className={`${language === "en" ? "rotate-180" : ""}`}
          />
        </Button>
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
      <div className="mt-3 relative z-50">
        <ScrollArea
          dir={language === "en" ? "ltr" : "rtl"}
          className="rounded-md flex whitespace-nowrap"
        >
          <div className="flex space-x-2 pb-2">
            <Button
              onClick={() => handleCategoryClick(null)}
              className={`${
                selectedCategory === null
                  ? "dark:bg-white rounded-full dark:text-black"
                  : "bg-transparent border dark:text-white dark:border-white border-black rounded-full text-black"
              } text-[13px] min-w-max transition-colors duration-150`}
            >
              {t("allFoods")}
            </Button>

            {activeCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() =>
                  handleCategoryClick(category.slug?.trim() || null)
                }
                className={`${
                  selectedCategory === category.slug?.trim()
                    ? "dark:bg-white rounded-full dark:text-black border dark:border-white"
                    : "bg-transparent border dark:text-white dark:border-white border-black rounded-full text-black"
                } text-[13px] min-w-max transition-colors duration-150`}
              >
                {language === "en"
                  ? category.slug
                      ?.split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ") || category.name
                  : language === "ar"
                    ? category.name_ar || category.name
                    : category.name || category.slug}
              </Button>
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
              displayedFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  language={language}
                  getFoodName={getFoodName}
                  getIngredients={getIngredients}
                  t={t}
                  handleFoodClick={handleFoodClick}
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
              sortedCategories.map(([categorySlug, categoryFoods]) => (
                <div key={categorySlug} className="space-y-4">
                  <h2 className="text-xl font-bold">{categorySlug}</h2>
                  <div className="h-px bg-linear-to-r from-transparent via-black dark:via-gray-200 to-transparent" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {categoryFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        language={language}
                        getFoodName={getFoodName}
                        getIngredients={getIngredients}
                        t={t}
                        handleFoodClick={handleFoodClick}
                      />
                    ))}
                  </div>
                </div>
              ))
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
      <div className="fixed inset-0 -z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex h-[500px] w-full flex-col items-center justify-center overflow-hidden pointer-events-none">
        <DotPattern
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>
    </main>
  );
}
