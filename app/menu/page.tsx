"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Globe, X, Menu, ArrowLeft, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import { Input } from "@/components/ui/input";

export default function Home() {
  const id = useId();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<"fa" | "ar" | "en">("fa");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  
  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  // search input
  const [searchTerm, setSearchTerm] = useState("");
  
  // فیلتر نهایی: دسته‌بندی + جستجو
  const finalFilteredFoods = filteredFoods.filter((food) => {
    if (!searchTerm) return true;

    const name = getFoodName(food).toLowerCase();
    const description = getFoodDescription(food).toLowerCase();
    const search = searchTerm.toLowerCase();

    return name.includes(search) || description.includes(search);
  });

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

  const getSearchPlaceholder = () => {
    switch (language) {
      case "fa":
        return "جستجو در منو...";
      case "ar":
        return "البحث في القائمة...";
      case "en":
        return "Search in menu...";
      default:
        return "جستجو در منو...";
    }
  };

  // گرفتن اطلاعات غذاها و دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    const fetchData = async () => {
      try {
        // دریافت غذاها
        const { data: foodsData, error: foodsError } = await supabase
          .from("foods")
          .select("*");

        if (foodsError) throw foodsError;
        setFoods(foodsData || []);

        // دریافت دسته‌بندی‌ها
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          const { data: categoriesData2, error: categoriesError2 } =
            await supabase.from("category").select("*").order("name");

          if (categoriesError2) throw categoriesError2;
          setCategories(categoriesData2 || []);
        } else {
          setCategories(categoriesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // فیلتر کردن غذاها بر اساس دسته‌بندی انتخاب شده
  useEffect(() => {
    if (selectedCategory) {
      setFilteredFoods(
        foods.filter((food) => food.category === selectedCategory)
      );
    } else {
      setFilteredFoods(foods);
    }
  }, [selectedCategory, foods]);

  // تابع برای رفرش داده‌ها
  const fetchData = async () => {
    try {
      const { data: foodsData, error: foodsError } = await supabase
        .from("foods")
        .select("*");

      if (foodsError) throw foodsError;
      setFoods(foodsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // ✅ کشیدن برای رفرش (Pull to refresh)
  useEffect(() => {
    let startY = 0;
    let isPulled = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulled = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulled) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      if (distance > 80) {
        setRefreshing(true);
      }
    };

    const handleTouchEnd = async () => {
      if (refreshing) {
        await fetchData();
        setTimeout(() => setRefreshing(false), 800);
      }
      isPulled = false;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 overflow-y-auto overscroll-none touch-pan-y">
      <div
        className={`fixed top-0 left-0 right-0 flex justify-center transition-transform duration-300 z-50 ${
          refreshing ? "translate-y-4 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm shadow">
          {t("updated")}
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 w-full bg-white/95 backdrop-blur-md z-40 border-b shadow-sm">
        <div className="flex justify-between items-center p-4">
          {/* Sidebar Menu */}
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button variant={"ghost"} size="icon">
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  <div className="flex flex-col gap-5 justify-center items-center mt-10">
                    <Image
                      src="/logo.png"
                      alt="Vatandar logo"
                      width={80}
                      height={50}
                      className="object-cover"
                    />
                    <div>
                      <Image
                        src="/line.png"
                        alt="Decoration line"
                        width={200}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <div>
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="justify-start w-full"
                  >
                    {t("allFoods")}
                  </Button>

                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.slug
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedCategory(category.slug)}
                        className="justify-start w-full mt-2"
                      >
                        {category.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t("noFoods")}
                    </p>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose className="absolute top-4 left-4">
                  <Button variant="ghost" size="icon">
                    <X />
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Vatandar logo"
            width={80}
            height={50}
            className="object-cover"
          />

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="opacity-60" size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(value) =>
                  setLanguage(value as "fa" | "ar" | "en")
                }
              >
                <DropdownMenuRadioItem value="fa">فارسی</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ar">العربیه</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-6">
        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <Input
              className="peer ps-9 pe-9 rounded-full w-full h-12 text-md"
              placeholder={getSearchPlaceholder()}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-muted-foreground/80">
              <SearchIcon size={18} />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 end-0 flex items-center justify-center pe-4 text-muted-foreground/80 hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Info */}
        <div className="mb-6 text-sm text-gray-600">
          {searchTerm ? (
            <p>
              {finalFilteredFoods.length} {t("itemsCount")} برای "{searchTerm}" {t("found")}
            </p>
          ) : selectedCategory ? (
            <p>
              {t("showingCategory")}{" "}
              <span className="font-bold">
                {categories.find((cat) => cat.slug === selectedCategory)?.name}
              </span>{" "}
              ({finalFilteredFoods.length} {t("itemsCount")})
            </p>
          ) : (
            <p>
              {t("allFoods")} ({finalFilteredFoods.length} {t("itemsCount")})
            </p>
          )}
        </div>

        {/* Food Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {finalFilteredFoods.length > 0 ? (
            finalFilteredFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 border"
              >
                <div className="w-4/12 h-24 rounded-2xl p-[2px] bg-gradient-to-br from-green-400 to-green-600">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-white">
                    <img
                      src={food.image_url}
                      alt={getFoodName(food)}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-between mr-3 w-8/12">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {getFoodName(food)}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {getFoodDescription(food)}
                  </p>
                  <span className="text-base font-bold text-green-600 mt-2">
                    {food.price.toLocaleString()} {t("price")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">
                {searchTerm || selectedCategory ? t("noFoodInCategory") : t("noFoods")}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  {t("clearSearch")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8 mb-4">
          © 2025 {t("restaurantName")}
        </p>
      </div>
    </main>
  );
}