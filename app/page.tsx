// app/page.tsx
"use client";

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
import { MapPin, Clock, Menu, X, Phone } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Food, Category } from "@/types";
import { translations } from "@/translations/translation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import CheckRestaurantStatus from "@/components/CheckRestaurantStatus";
import PhoneDrawer from "@/components/SN/PhoneDrawer";
import LocationDrawer from "@/components/SN/LocationDrawer";
import ShareDrawer from "@/components/SN/ShareDrawer";
import InstagramDrawer from "@/components/SN/InstagramDrawer";
import ClockDrawer from "@/components/SN/ClockDrawer";
import { useSearchParams, useRouter } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  
  // State برای مدیریت پس‌زمینه‌های متغیر
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [bgImages] = useState<string[]>([
    "/bg.jpg",
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
  ]);
  
  // Ref برای interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Branch context و routing
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedBranch, setSelectedBranch, branches, clearSelectedBranch } = useBranch();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // تابع برای تغییر خودکار پس‌زمینه با انیمیشن
  useEffect(() => {
    const changeBackground = () => {
      if (isAnimating) return;
      
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentBgIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
      }, 100);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    };

    intervalRef.current = setInterval(changeBackground, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bgImages.length, isAnimating]);

  // خواندن پارامتر branch از URL هنگام لود صفحه
  useEffect(() => {
    const branchSlug = searchParams?.get('branch');
    if (branchSlug) {
      const branch = branches.find(b => b.slug === branchSlug);
      if (branch) {
        setSelectedBranch(branch);
      }
    }
  }, [searchParams, branches, setSelectedBranch]);

  // تابع برای گرفتن آدرس بر اساس زبان و شعبه
  const getAddress = () => {
    if (!selectedBranch) {
      return {
        address1: t("address1"),
        address: t("address")
      };
    }
    
    switch (language) {
      case 'fa':
        return {
          address1: selectedBranch.address_fa,
          address: selectedBranch.phone
        };
      case 'ar':
        return {
          address1: selectedBranch.address_ar,
          address: selectedBranch.phone
        };
      case 'en':
        return {
          address1: selectedBranch.address_en,
          address: selectedBranch.phone
        };
      default:
        return {
          address1: selectedBranch.address_fa,
          address: selectedBranch.phone
        };
    }
  };

  const { address1, address } = getAddress();

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
        const { data: foodsData, error: foodsError } = await supabase
          .from("foods")
          .select("*");

        if (foodsError) throw foodsError;
        setFoods(foodsData || []);

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
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <main
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image با یک انیمیشن */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* تصویر اصلی با انیمیشن */}
        <div
          className={`absolute inset-0 transition-all duration-2000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isAnimating
              ? "scale-105 opacity-80"
              : "scale-100 opacity-100"
          }`}
          key={currentBgIndex}
        >
          <Image
            src={bgImages[currentBgIndex]}
            alt={selectedBranch ? selectedBranch.name_fa : t("restaurantName")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </div>

      {/* نشانگر شعبه انتخاب شده */}
      {selectedBranch && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-800">
              {selectedBranch.name_fa}
            </span>
            <button
              onClick={() => {
                clearSelectedBranch();
                router.push('/branches');
              }}
              className="text-xs text-gray-500 hover:text-red-500 pr-2 border-r border-gray-300"
            >
              تغییر شعبه
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative z-10 text-white pt-8 px-4">
        <div className="flex justify-between px-2 items-center mb-4">
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
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="justify-start w-40 flex items-center"
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
                        className="justify-start w-40 flex items-center"
                      >
                        {category.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">{t("noFoods")}</p>
                  )}
                </div>
                <Link href={"/myOrders"} className="text-blue-600 hover:text-blue-800">
                  سفارشات من
                </Link>
                <Link href={"/branches"} className="text-green-600 hover:text-green-800 font-medium">
                  انتخاب / تغییر شعبه
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

          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="absolute bottom-0 w-full z-20 glass-btn-card">
        <div className="">
          <CheckRestaurantStatus />
        </div>

        <div className="flex flex-col items-center space-y-8 w-full px-8 pb-6">
          <div className="flex-col flex items-center space-y-1">
            <div className="">
              <Image
                src={"/logo.png"}
                alt={selectedBranch ? selectedBranch.name_fa : t("restaurantName")}
                width={120}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                {selectedBranch ? selectedBranch.name_fa : t("restaurantName")}
              </h1>
              <div className="flex items-center justify-center gap-2 text-[.9em]">
                <MapPin size={16} />
                <span>{address1}</span>
              </div>
              {address && (
                <div className="flex items-center justify-center gap-2 text-[.9em]">
                  <Phone size={16} />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button>
                <ShareDrawer />
              </button>
              <button>
                <InstagramDrawer />
              </button>
              <button>
                <ClockDrawer />
              </button>
              <button>
                <LocationDrawer />
              </button>
              <button>
                <PhoneDrawer />
              </button>
            </div>
          </div>

          {/* دکمه مشاهده منو */}
          <Link 
            href={selectedBranch ? `/menu?branch=${selectedBranch.slug}` : '/menu'} 
            className="w-full flex justify-center"
          >
            <button className="py-3 w-full glass-btn text-lg font-semibold">
              {t("viewMenu")}
            </button>
          </Link>

          {/* لینک تغییر شعبه (در صورتی که شعبه انتخاب نشده باشد) */}
          {!selectedBranch && (
            <Link href="/branches" className="text-blue-100 hover:text-white text-sm underline">
              انتخاب شعبه رستوران
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}