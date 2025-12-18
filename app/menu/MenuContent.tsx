// app/menu/MenuContent.tsx
"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchIcon, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import AddToCartButton from "@/components/AddToCartButton";
import CartDrawer from "@/components/CartDrawer";
import FoodDetails from "@/components/FoodDetails";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useBranch } from "@/contexts/BranchContext";
import { useSearchParams, useRouter } from "next/navigation";

export default function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedBranch, branches } = useBranch();
  const branchSlug = searchParams?.get("branch");

  const id = useId();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // اگر branchSlug از URL آمده، شعبه را پیدا و تنظیم کن
  useEffect(() => {
    if (
      branchSlug &&
      branches.length > 0 &&
      selectedBranch?.slug !== branchSlug
    ) {
      const branchFromUrl = branches.find((b) => b.slug === branchSlug);
      if (branchFromUrl) {
        // می‌توانید از context برای تنظیم شعبه استفاده کنید
        // یا در اینجا پیام نشان دهید که باید شعبه انتخاب شود
      }
    }
  }, [branchSlug, branches, selectedBranch]);

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // گرفتن نام غذا بر اساس زبان
  const getFoodName = (food: Food) => {
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
  };

  const getFoodDescription = (food: Food) => {
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
  };

  const getIngredients = (food: Food) => {
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
  };

  // گرفتن اطلاعات غذاها از دیتابیس با فیلتر شعبه
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase.from("foods").select("*");

        // اگر شعبه انتخاب شده، فقط غذاهای آن شعبه را بگیر
        if (selectedBranch) {
          query = query.eq("branch_id", selectedBranch.id);
        } else {
          // اگر شعبه انتخاب نشده، همه غذاها را بگیر
          query = query.is("branch_id", null).or("branch_id.is.null");
        }

        const { data: foodsData, error: foodsError } = await query;

        if (foodsError) throw foodsError;

        // فیلتر غذاهای فعال
        const activeFoods = (foodsData || []).filter(
          (food) => food.is_available !== false
        );
        setFoods(activeFoods);

        // دریافت دسته‌بندی‌ها از جدول foods (دسته‌بندی‌های منحصر به فرد)
        const uniqueCategories = Array.from(
          new Set(activeFoods.map((food) => food.category).filter(Boolean))
        );

        // ساخت دسته‌بندی‌های ساختگی برای نمایش
        const mockCategories: Category[] = uniqueCategories.map(
          (cat, index) => ({
            id: `cat-${index}`,
            name: cat || "دسته‌بندی نشده",
            name_ar: cat || "غير مصنف",
            slug: cat || "uncategorized",
            order_number: index,
            created_at: new Date().toISOString(),
          })
        );

        setCategories(mockCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch]); // وابسته به selectedBranch

  // فیلتر کردن غذاها بر اساس دسته‌بندی انتخاب شده
  useEffect(() => {
    if (selectedCategory) {
      setFilteredFoods(
        foods.filter((food) => {
          const foodCategory = food.category?.trim();
          const selected = selectedCategory?.trim();
          return foodCategory === selected;
        })
      );
    } else {
      setFilteredFoods(foods);
    }
  }, [selectedCategory, foods]);

  // گروه‌بندی غذاها بر اساس دسته‌بندی
  const groupFoodsByCategory = (foodsList: Food[]) => {
    const grouped: Record<string, Food[]> = {};

    foodsList.forEach((food) => {
      const categoryKey = food.category || "uncategorized";
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }
      grouped[categoryKey].push(food);
    });

    return grouped;
  };

  // فیلتر غذا بر اساس جستجو
  const filterFood = filteredFoods.filter(
    (food) =>
      food.name_fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_fa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // گروه‌بندی غذاهای فیلتر شده
  const groupedFoods = groupFoodsByCategory(filterFood);

  // وزن‌دهی برای هر slug
  const categoryWeights: Record<string, number> = {
    "Afghan foods": 1,
    "Iranian foods": 2,
    Breakfast: 3,
    Drinks: 4,
    "Hot drinks": 5,
    "Cold drinks": 6,
    "Coffee-based drinks": 7,
    Dessert: 8,
    uncategorized: 999,
  };

  // مرتب‌سازی دسته‌بندی‌ها
  const sortedCategories = Object.entries(groupedFoods).sort(
    ([slugA], [slugB]) => {
      const weightA = categoryWeights[slugA] || 100;
      const weightB = categoryWeights[slugB] || 100;
      return weightA - weightB;
    }
  );

  // گرفتن نام دسته‌بندی
  const getCategoryName = (slug: string) => {
    const category = categories.find((cat) => {
      const catSlug = cat.slug?.trim().toLowerCase();
      const foodSlug = slug?.trim().toLowerCase();
      return catSlug === foodSlug;
    });

    if (!category) return slug;

    switch (language) {
      case "fa":
        return category.name;
      case "ar":
        return category.name_ar;
      case "en":
        return category.slug?.trim();
      default:
        return category.name;
    }
  };

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedFood(null);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30"></div>{" "}
          <img src="/sonati-bg.jpg" alt="" className="h-full w-full" />
        </div>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-300 mx-auto mb-4"></div>
          <p className="text-gray-200">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 text-white py-2 pt-5 overflow-y-auto overscroll-none touch-pan-y">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30"></div>{" "}
          <img src="/sonati-bg.jpg" alt="" className="h-full w-full" />
        </div>
      {/* دکمه برگشت و عنوان */}
      <div
        className={`text-3xl font-bold flex justify-between items-center ${
          language === "en" ? "" : "mb-2"
        }`}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <h1 className={`text-3xl font-bold`}>{t("menu")}</h1>

        <div className="flex items-center gap-2">
          <Link
            href={"/"}
            className="flex justify-center text-white glass-btn active:scale-95 items-center rounded-full bg-accent p-2 backdrop-blur-[2px]"
          >
            <ChevronLeft
              size={20}
              className={`${language === "en" ? "rotate-180" : ""}`}
            />
          </Link>
        </div>
      </div>

      {/* جستجو */}
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex items-center justify-center w-full space-x-1 mt-4"
      >
        <div className="*:not-first:mt-2 w-full">
          <div dir={language === "en" ? "ltr" : "rtl"} className="relative">
            <Input
              id={id}
              className="peer ps-9 pe-9 rounded-full w-full h-10 text-md"
              placeholder={t("search")}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 pt-1 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon
                size={16}
                className={`${language === "en" ? "" : "rotate-90"}`}
              />
            </div>
            <button
              className="absolute inset-y-0 end-1 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Submit search"
              type="submit"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
                className={`${language === "en" ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
        <div className="flex">
          <LanguageSwitcher />
          <CartDrawer />
        </div>
      </div>

      {/* دکمه تغییر شعبه */}
      <div className="flex justify-center mt-3">
        <Link href="/branches">
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            تغییر شعبه
          </Button>
        </Link>
      </div>

      {/* شروع دسته بندی */}
      <div className="mt-2.5">
        <ScrollArea
          dir={language === "en" ? "ltr" : "rtl"}
          className="rounded-md flex whitespace-nowrap"
        >
          <div className="flex space-x-2">
            {/* دکمه نمایش همه غذاها */}
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="justify-start flex items-center rounded-full text-[13px]"
            >
              {t("allFoods")}
            </Button>

            {/* دکمه‌های دسته‌بندی‌ها */}
            {categories.length > 0 ? (
              categories.map((category) => {
                const cleanSlug = category.slug?.trim();
                return (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === cleanSlug ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(cleanSlug)}
                    className="justify-start flex items-center rounded-full text-[13px]"
                  >
                    {language === "en"
                      ? cleanSlug
                      : language === "ar"
                      ? category.name_ar
                      : category.name}
                  </Button>
                );
              })
            ) : (
              <p className="text-sm">{t("noFoods")}</p>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
      {/* پایان دسته بندی */}

      {/* شروع کارت غذا */}
      <div className="mt-3">
        {selectedCategory ? (
          // اگر دسته‌بندی خاصی انتخاب شده
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filterFood.length > 0 ? (
              filterFood.map((food) => (
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
              <div className="col-span-full text-center py-8 text-gray-600">
                {t("noFoodInCategory")}
              </div>
            )}
          </div>
        ) : (
          // اگر "همه غذاها" انتخاب شده، دسته‌بندی‌ها را گروه‌بندی شده نشان بده
          <div className="space-y-6">
            {sortedCategories.map(([categorySlug, categoryFoods]) => (
              <div key={categorySlug} className="space-y-3">
                {/* تیتر دسته‌بندی */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    {getCategoryName(categorySlug)}
                  </h2>
                </div>

                {/* خط جداکننده */}
                <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />

                {/* کارت‌های غذا در این دسته‌بندی */}
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
            ))}

            {sortedCategories.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                {selectedBranch
                  ? `هیچ غذایی برای  ${selectedBranch.name_fa} یافت نشد`
                  : t("noFoods")}
              </div>
              
            )}
          </div>
        )}
      </div>
      {/* پایان کارت غذا */}

      {/* FoodDetails */}
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

      <p className="text-center text-gray-800 text-sm my-6">
        © 2025 Watandar Restaurant{" "}
        {selectedBranch && `• ${selectedBranch.name_fa}`}
      </p>
    </main>
  );
}

// کامپوننت کارت غذا (برای جلوگیری از تکرار کد)
function FoodCard({
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
  return (
    <div
      dir={`${language === "en" ? "ltr" : "rtl"}`}
      key={food.id}
      className="relative glass-card-menu flex items-center w-full h-35 backdrop-blur-xs bg-linear-to-t from-white/20 to-transparent border-b border-white/50 rounded-2xl shadow-lg hover:shadow-lg transition-all duration-200 active:scale-95"
    >
      {/* شروع عکس کارت غذا */}
      <div
        onClick={() => handleFoodClick(food)}
        className="w-4/12 h-full rounded-2xl p-[2.1px] bg-[linear-gradient(135deg,#10b981_0%,transparent_35%),linear-gradient(-45deg,#10b981_0%,transparent_35%)] cursor-pointer"
      >
        <div className="w-full h-full rounded-[13px] overflow-hidden bg-orange-700">
          <img
            src={food.image_url}
            alt={getFoodName(food)}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      {/* پایان عکس کارت غذا */}

      {/* شروع متن کارت غذا */}
      <div className="flex flex-col mx-3 w-8/12 overflow-hidden">
        <div onClick={() => handleFoodClick(food)} className="cursor-pointer">
          <h2 className="text-md font-semibold] truncate">
            {getFoodName(food)}
          </h2>

          {/* مواد تشکیل دهنده */}
          {getIngredients(food) && (
            <p className="text-[13px] line-clamp-2 leading-4.5">
              {getIngredients(food).toString()}
            </p>
          )}
          {/* قیمت غذا */}
          <span className="text-[14px] font-bold text-yellow-600 mt-1">
            {food.price.toLocaleString()} {t("price")}
          </span>
        </div>

        {/* دکمه افزودن به سبد خرید */}
        <div className="absolute left-2 bottom-2">
          {!food.is_available ? (
            <Badge
              variant={food.is_available ? "default" : "destructive"}
              className={`${food.is_available ? "" : "opacity-30"}`}
            >
              {food.is_available ? t("available") : t("notAvailable")}
            </Badge>
          ) : (
            <div className={`flex justify-center items-center`}>
              <AddToCartButton food={food} getFoodName={getFoodName} />
            </div>
          )}
        </div>
      </div>
      {/* پایان متن کارت غذا */}
    </div>
  );
}
