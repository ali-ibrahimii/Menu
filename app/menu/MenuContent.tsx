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
import Loader from "@/components/Loader";
import Image from "next/image";
import { LightRays } from "@/components/ui/light-rays";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils"


export default function Home() {
  const id = useId();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { selectedBranch } = useBranch(); // اضافه کردن useBranch
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // search input
  const [searchTerm, setSearchTerm] = useState("");

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

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
      food.name_fa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description_fa?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // گروه‌بندی غذاهای فیلتر شده
  const groupedFoods = groupFoodsByCategory(filterFood);

  // گرفتن دسته‌بندی‌های فعال (آنهایی که غذا دارند)
  const getActiveCategories = () => {
    const uniqueCategorySlugs = Array.from(
      new Set(foods.map((food) => food.category?.trim()).filter(Boolean)),
    );

    return categories
      .filter((category) => uniqueCategorySlugs.includes(category.slug?.trim()))
      .sort((a, b) => {
        const orderA = a.order_number ?? 999;
        const orderB = b.order_number ?? 999;
        return orderA - orderB;
      });
  };

  // دسته‌بندی‌های فعال
  const activeCategories = getActiveCategories();

  // ترتیب دلخواه برای دسته‌بندی‌ها
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

  // مرتب‌سازی دسته‌بندی‌ها بر اساس ترتیب دلخواه
  const sortedCategories = Object.entries(groupedFoods).sort(
    ([slugA], [slugB]) => {
      const indexA = categoryOrder.indexOf(slugA);
      const indexB = categoryOrder.indexOf(slugB);

      // اگر در لیست ترتیب نیستند، بر اساس order_number مرتب کن
      if (indexA === -1 && indexB === -1) {
        const categoryA = categories.find((cat) => cat.slug?.trim() === slugA);
        const categoryB = categories.find((cat) => cat.slug?.trim() === slugB);

        const orderA = categoryA?.order_number ?? 999;
        const orderB = categoryB?.order_number ?? 999;

        return orderA - orderB;
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    },
  );

  // گرفتن نام دسته‌بندی
  const getCategoryName = (slug: string) => {
    if (!slug || slug === "uncategorized") {
      return language === "en"
        ? "Uncategorized"
        : language === "ar"
          ? "غير مصنف"
          : "دسته‌بندی نشده";
    }

    const category = categories.find((cat) => {
      // تطبیق دقیق slug
      const catSlug = cat.slug?.trim().toLowerCase();
      const foodSlug = slug?.trim().toLowerCase();
      return catSlug === foodSlug;
    });

    // اگر دسته‌بندی پیدا نشد
    if (!category) {
      // سعی کن با حذف خط تیره‌ها تطبیق بدی
      const normalizedSlug = slug.toLowerCase().replace(/-/g, " ");
      const alternativeCategory = categories.find((cat) => {
        const catName = cat.name?.toLowerCase().replace(/-/g, " ");
        return (
          catName?.includes(normalizedSlug) ||
          normalizedSlug.includes(catName || "")
        );
      });

      if (alternativeCategory) {
        switch (language) {
          case "fa":
            return alternativeCategory.name;
          case "ar":
            return alternativeCategory.name_ar || alternativeCategory.name;
          case "en":
            return alternativeCategory.slug?.trim() || slug;
          default:
            return alternativeCategory.name;
        }
      }

      // اگر باز هم پیدا نشد، slug رو برگردون
      return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // اگر دسته‌بندی پیدا شد
    switch (language) {
      case "fa":
        return category.name || slug;
      case "ar":
        return category.name_ar || category.name || slug;
      case "en":
        // برای انگلیسی، slug رو به فرمت خوانا برگردون
        const displaySlug = category.slug?.trim() || slug;
        return displaySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      default:
        return category.name || slug;
    }
  };

  // گرفتن نام برای دکمه دسته‌بندی
  const getCategoryButtonName = (category: Category) => {
    switch (language) {
      case "fa":
        return category.name || category.slug;
      case "ar":
        return category.name_ar || category.name || category.slug;
      case "en":
        // برای انگلیسی، slug رو به فرمت خوانا نمایش بده
        const displaySlug = category.slug?.trim() || "category";
        return displaySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      default:
        return category.name || category.slug;
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

  // گرفتن اطلاعات غذاها و دسته‌بندی‌ها از دیتابیس با فیلتر شعبه
  useEffect(() => {
    const fetchData = async () => {
      try {
        // دریافت غذاها با فیلتر شعبه
        let foodsQuery = supabase
          .from("foods")
          .select("*")
          .eq("is_available", true); // فقط غذاهای فعال

        // اگر شعبه انتخاب شده، فیلتر اعمال کن
        if (selectedBranch?.id) {
          // غذاهایی که branch_id برابر با شعبه انتخاب شده دارند
          // یا غذاهایی که branch_id ندارند (برای همه شعب)
          foodsQuery = foodsQuery.or(
            `branch_id.eq.${selectedBranch.id},branch_id.is.null`,
          );
        } else {
          // اگر شعبه انتخاب نشده، فقط غذاهایی که branch_id ندارند
          foodsQuery = foodsQuery.is("branch_id", null);
        }

        const { data: foodsData, error: foodsError } = await foodsQuery;

        if (foodsError) throw foodsError;

        // تمیز کردن category در غذاها
        const cleanedFoods = (foodsData || []).map((food) => ({
          ...food,
          category: food.category?.trim(),
        }));

        setFoods(cleanedFoods);

        // دریافت دسته‌بندی‌ها
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("order_number", { ascending: true, nullsFirst: false });

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          // اگر جدول categories وجود ندارد، از جدول category امتحان کنید
          const { data: categoriesData2, error: categoriesError2 } =
            await supabase.from("category").select("*").order("name");

          if (categoriesError2) throw categoriesError2;

          // تمیز کردن slugها
          const cleanedCategories =
            categoriesData2?.map((cat) => ({
              ...cat,
              slug: cat.slug?.trim(),
              name: cat.name || "",
              name_ar: cat.name_ar || "",
            })) || [];
          setCategories(cleanedCategories);
        } else {
          // تمیز کردن slugها
          const cleanedCategories =
            categoriesData?.map((cat) => ({
              ...cat,
              slug: cat.slug?.trim(),
              name: cat.name || "",
              name_ar: cat.name_ar || "",
            })) || [];
          setCategories(cleanedCategories);
        }
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
          // تطبیق با trim کردن هر دو طرف
          const foodCategory = food.category?.trim();
          const selected = selectedCategory?.trim();
          return foodCategory === selected;
        }),
      );
    } else {
      setFilteredFoods(foods);
    }
  }, [selectedCategory, foods]);

  // بررسی داده‌ها برای دیباگ

  if (loading) {
    return (
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="flex items-center justify-center flex-col">
          <Loader />
          <p className="">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full min-h-screen px-5 dark:bg-[#191919] dark:text-gray-200 py-2 pt-5 overflow-y-auto touch-pan-y">
      <div className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <DotPattern
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>

      <div className="z-[44px] h-full w-full overflow-hidden">
        <LightRays />
      </div>

      {/* دکمه برگشت به صفحه ورودی و مینو */}
      <div
        className={`text-3xl font-bold flex justify-between items-center ${
          language === "en" ? "mb-1" : "mb-2"
        }`}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <h1
          className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}
        >
          {t("menu")}
        </h1>

        <Link
          href={"/"}
          className="active:scale-95 category-card-default dark:text-white  p-2"
        >
          <ChevronLeft
            size={20}
            className={`${language === "en" ? "rotate-180" : ""}`}
          />
        </Link>
      </div>

      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex items-center justify-center w-full space-x-1"
      >
        <div className="*:not-first:mt-2 w-full">
          <div dir={language === "en" ? "ltr" : "rtl"} className="relative">
            <Input
              id={id}
              className="peer ps-10 pe-9 py-[20px]  dark:text-gray-200 dark:focus:text-gray-200 rounded-full text-md"
              placeholder={t("search")}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 pt-1 text-gray-400 peer-disabled:opacity-50">
              <SearchIcon
                size={16}
                className={`${language === "en" ? "" : "rotate-90"}`}
              />
            </div>
            <button
              className="absolute inset-y-0 end-1 flex h-full w-9 items-center justify-center rounded-e-md text-gray-400 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* شروع دسته بندی */}
      <div className="mt-3">
        <ScrollArea
          dir={language === "en" ? "ltr" : "rtl"}
          className="rounded-md flex whitespace-nowrap"
        >
          <div className="flex space-x-2 pb-2">
            {/* دکمه نمایش همه غذاها */}
            <Button
              onClick={() => setSelectedCategory(null)}
              className={`${
                selectedCategory === null
                  ? "dark:bg-white rounded-full dark:text-black"
                  : "bg-transparent border dark:text-white dark:border-white border-black rounded-full text-black"
              } text-[13px] min-w-max`}
            >
              {t("allFoods")}
            </Button>

            {/* دکمه‌های دسته‌بندی‌ها - فقط دسته‌بندی‌های فعال */}
            {activeCategories.length > 0 ? (
              activeCategories.map((category) => {
                const cleanSlug = category.slug?.trim();
                return (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(cleanSlug)}
                    className={`${
                      selectedCategory === cleanSlug
                        ? "border  dark:border-white rounded-full dark:bg-white"
                        : "bg-transparent border text-black border-black dark:border-white dark:text-white rounded-full"
                    }  text-[13px] min-w-max`}
                  >
                    {getCategoryButtonName(category)}
                  </Button>
                );
              })
            ) : (
              <p className="category-card-default px-3">
                {t("noFoodInCategory")}
              </p>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
      {/* پایان دسته بندی */}

      {/* شروع کارت غذا */}
      <div className="mt-3">
        {selectedCategory ? (
          <div>
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
                <div className="col-span-full border text-center py-8 ">
                  {t("noFoodInCategory")}
                </div>
              )}
            </div>
          </div>
        ) : (
          // اگر "همه غذاها" انتخاب شده، دسته‌بندی‌ها را گروه‌بندی شده نشان بده
          <div className="space-y-8">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(([categorySlug, categoryFoods]) => (
                <div key={categorySlug} className="space-y-4">
                  {/* تیتر دسته‌بندی */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {getCategoryName(categorySlug)}
                    </h2>
                  </div>

                  {/* خط جداکننده */}
                  <div className="h-px bg-linear-to-r from-transparent via-black dark:via-gray-200 to-transparent" />

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
              ))
            ) : (
              <div className="flex items-center justify-center min-h-[70vh] text-center py-8 dark:text-gray-300 w-full">
                {t("noFoods")}
              </div>
            )}
          </div>
        )}
      </div>
      {/* پایان کارت غذا */}

      {/* FoodDetails فقط یک بار اینجا رندر شود */}
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

      <div className="text-center dark:text-gray-200 text-sm py-6 w-full">
        <p>
          {selectedBranch &&
            `${
              language === "en"
                ? selectedBranch.name_en || selectedBranch.name_fa
                : language === "ar"
                  ? selectedBranch.name_ar || selectedBranch.name_fa
                  : selectedBranch.name_fa
            }`}
        </p>
        © 2025 Watandar Restaurant
      </div>
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
      className="relative flex items-center w-full h-34 dark:bg-white/5 border backdrop-blur-[2px] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
      onClick={() => handleFoodClick(food)}
    >
      
      {/* شروع عکس کارت غذا */}
      <div className="w-4/12 h-full z-10 rounded-2xl p-[1.5px] bg-[linear-gradient(130deg,#d62828_0%,transparent_35%),linear-gradient(-45deg,#d62828_0%,transparent_35%)]">
        <div className="w-full h-full rounded-[16px] overflow-hidden">
          <Image
            src={food.image_url}
            alt={getFoodName(food)}
            width={120}
            height={120}
            className="w-full h-full object-cover"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            unoptimized={false}
          />
        </div>
      </div>
      {/* پایان عکس کارت غذا */}

      {/* شروع متن کارت غذا */}
      <div className="flex flex-col mx-3 w-8/12 overflow-hidden py-2">
        <div className="mb-5">
          <h2 className="text-md font-bold truncate">{getFoodName(food)}</h2>

          {/* مواد تشکیل دهنده */}
          {getIngredients(food) && (
            <p className="text-[12px] line-clamp-2 leading-4.5">
              {getIngredients(food).toString()}
            </p>
          )}
          {/* قیمت غذا */}
          <span className="text-[13px] font-bold text-yellow-500 mt-1 inline-block">
            {food.price.toLocaleString()} {t("price")}
          </span>
        </div>

        {/* دکمه افزودن به سبد خرید */}
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
      {/* پایان متن کارت غذا */}
    </div>
  );
}
