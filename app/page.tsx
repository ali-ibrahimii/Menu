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
import { Button } from "@/components/ui/button";
import {
  Globe,
  Instagram,
  Share2,
  PhoneCall,
  MapPin,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import CheckRestaurantStatus from '@/components/CheckRestaurantStatus'

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);

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

  // فیلتر کردن غذاها
  useEffect(() => {
    if (selectedCategory) {
      setFilteredFoods(
        foods.filter((food) => food.category === selectedCategory)
      );
    } else {
      setFilteredFoods(foods);
    }
  }, [selectedCategory, foods]);

  if (loading) {
    return (
      <div dir={language === "en" ? "ltr" : "rtl"} className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }
  

  return (
    <main dir={language === 'en' ? "ltr" : "rtl"} className="relative min-h-screen overflow-hidden">
      {/* Background Image - Fixed */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={"/bg.jpg"}
          alt={t("restaurantName")}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-white pt-8 px-4">
        <div className="flex justify-between px-2 items-center mb-4">
          {/* sidebar */}
          <Drawer direction={language === "en" ? "left" : "right"}>
            <DrawerTrigger>
              <Button variant={"outline"}>
                <Menu color="#000" />
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
                  <Link href={'/myOrders'}>
                    My orders
                  </Link>
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

          {/* Language */}
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="absolute bottom-0 w-full z-20">
        <div className="bg-linear-0 from-gray-400 from-40% to-gray-50/60 pb-15 rounded-t-[55px] pt-8 px-4">
          <div className="">
            <CheckRestaurantStatus />
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-col items-center space-y-10 w-full border">
            <div className="flex-col flex items-center space-y-1 border">
              {/* Logo */}
              <Image
                src={"/logo.png"}
                alt={t("restaurantName")}
                width={120}
                height={40}
                className="object-cover"
              />
              <div className="text-center border">
                <h1 className="text-2xl font-bold mb-2">
                  {t("restaurantName")}
                </h1>
                <div className="flex items-center justify-center gap-2 text-[.9em]">
                  <MapPin size={16} />
                  <span>{t("address1")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[.9em]">
                  <MapPin size={16} />
                  <span>{t("address")}</span>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4 border">
              <div className="flex items-center gap-3">
                <button className="p-3 rounded-full border-2 border-black">
                  <Share2 size={20} />
                </button>
                <button className="p-3 rounded-full border-2 border-black">
                  <Instagram size={20} color="#000" />
                </button>
                <button className="p-3 rounded-full border-2 border-black">
                  <Clock size={20} color="#000" />
                </button>
                <button className="p-3 rounded-full border-2 border-black">
                  <MapPin size={20} color="#000" />
                </button>
                <button className="p-3 rounded-full border-2 border-black">
                  <PhoneCall size={20} color="#000" />
                </button>
              </div>
            </div>

            {/* menu view button */}
            <Link href="/menu" className="w-full flex justify-center">
              <Button className="px-15 py-5 w-full">
                {t("viewMenu")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
