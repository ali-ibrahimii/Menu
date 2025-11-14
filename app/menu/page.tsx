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
import {
  Globe,
  X,
  Menu,
  ArrowLeft,
  SearchIcon,
  CheckCircle,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddToCartButton from "@/components/AddToCartButton";
import CartDrawer from "@/components/CartDrawer";
import FoodDetails from "@/components/FoodDetails";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const id = useId();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  //   search input
  const [searchTerm, setSearchTerm] = useState("");
  const filterFood = filteredFoods.filter((food) =>
    food.name_fa.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    switch (language) {
      case "fa":
        return food.ingredients_fa;
      case "ar":
        return food.ingredients_ar;
      case "en":
        return food.ingredients_en;
      default:
        return food.ingredients_fa;
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

        // دریافت دسته‌بندی‌ها - نام جدول را یکسان کنید
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories") // ✅ اینجا را به "categories" تغییر دهید
          .select("*")
          .order("name");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          // اگر جدول categories وجود ندارد، از جدول category امتحان کنید
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

      // اینجا هم نام جدول را یکسان کنید
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories") // ✅ اینجا هم "categories"
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

  // برای دیباگ - بررسی داده‌ها
  console.log("Categories:", categories);
  console.log("Selected Category:", selectedCategory);
  console.log("Filtered Foods:", filteredFoods);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 overflow-y-auto overscroll-none touch-pan-y">
      <div
        className={`fixed top-0 left-0 right-0 flex justify-center transition-transform duration-300 ${
          refreshing ? "translate-y-4 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm shadow">
          منو به‌روزرسانی شد ✅
        </div>
      </div>

      {/* header */}
      <div className="fixed top-0 left-0 transform w-full bg-white/20 backdrop-blur-md z-40 border-b shadow-md py-2">
        <div className="flex justify-between px-4 items-center">
          {/* sidebar */}
          <Drawer direction="right">
            <DrawerTrigger>
              <Button variant={"ghost"}>
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

                    <div className="">
                      <Image
                        src="/line.png"
                        alt="Vatandar logo"
                        width={200}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <div className="">
                  {/* دکمه نمایش همه غذاها */}
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="justify-start w-40 flex items-center"
                  >
                    {t("allFoods")}
                  </Button>

                  {/* دکمه‌های دسته‌بندی‌ها */}
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
                        className="justify-start w-40 flex items-center"
                      >
                        {category.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">{t("noFoods")}</p>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose className="absolute top-6 left-2">
                  <Button variant="ghost">
                    <X />
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="flex justify-center items-center">
            <Image
              src="/logo.png"
              alt="Vatandar logo"
              width={80}
              height={50}
              className="object-cover"
            />
          </div>

          {/* language button */}
          <div>
            <LanguageSwitcher />
            <CartDrawer />
          </div>
        </div>
      </div>

      {/* دکمه دسته بندی و موتور جستجو */}
      <div className="flex items-center justify-center w-full space-x-2 mt-25">
        <div className="*:not-first:mt-2 w-11/12">
          <div className="relative">
            <Input
              id={id}
              className="peer ps-9 pe-9 rounded-md bg-accent w-full h-12 text-md px-20"
              placeholder={t("search")}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 pt-1 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
            <button
              className="absolute inset-y-0 end-1 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Submit search"
              type="submit"
            >
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="w-1/12">
          <LayoutGrid size={30} />
        </div>
      </div>

      {/* نمایش تعداد غذاهای فیلتر شده */}
      <div className="my-3 text-sm text-gray-600">
        {selectedCategory ? (
          <p>
            {t("showingCategory")}{" "}
            <span className="font-bold">
              {categories.find((cat) => cat.slug === selectedCategory)?.name ||
                selectedCategory}
            </span>{" "}
            ({filteredFoods.length} {t("itemsCount")})
          </p>
        ) : (
          <p>
            {t("allFoods")} ({filteredFoods.length} {t("itemsCount")})
          </p>
        )}
      </div>

      {/* شبکه کارت‌های غذا */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filterFood.length > 0 ? (
          filterFood.map((food) => (
            <div
              dir={`${language === "en" ? 'ltr' : 'rtl'}`}
              key={food.id}
              className="relative flex items-center w-full h-35 bg-orange-100/10 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Link
                href={`/menu/${food.id}`}
                className="w-4/12 h-full rounded-2xl p-[2.1px] bg-[linear-gradient(135deg,#10b981_0%,transparent_35%),linear-gradient(-45deg,#10b981_0%,transparent_35%)]"
              >
                <div className="w-full h-full rounded-[13px] overflow-hidden bg-orange-200">
                  <img
                    src={food.image_url}
                    alt={getFoodName(food)}
                    className="object-cover w-full h-full"
                  />
                </div>
              </Link>

              <div className="flex flex-col mx-3 w-8/12">
                <h2 className="text-md font-semibold text-gray-800 truncate">
                  {getFoodName(food)}
                </h2>

                {/* مواد تشکیل دهنده */}
                {getIngredients(food) && (
                  <p className="text-gray-600 text-[13px] leading-4.5">
                    {getIngredients(food).toString()}
                  </p>
                )}

                <span className="text-[14px] font-bold text-yellow-600 mt-1">
                  {food.price.toLocaleString()} {t("price")}
                </span>

                <div className=" flex justify-end ml-3">
                  {!food.is_available ? (
                    <Badge
                      variant={food.is_available ? "default" : "destructive"}
                      className=""
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
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {selectedCategory ? t("noFoodInCategory") : t("noFoods")}
          </div>
        )}
      </div>

      <p className="text-center text-gray-400 text-sm mt-6">
        © 2025 Watandar Restaurant
      </p>
    </main>
  );
}
