// app/HomeContent.tsx
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
import { Building2, Clock, Menu, X, Phone, Store, Instagram } from "lucide-react";
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

// گالری عکس‌های هر شعبه
const branchImageGalleries: Record<string, string[]> = {
  main: [
    "/branch1/1.jpg",
    "/branch1/2.jpg",
    "/branch1/3.jpg",
    "/branch1/4.jpg",
  ],
  branch2: [
    "/branch2/1.jpg",
    "/branch2/2.jpg",
    "/branch2/3.jpg",
    "/branch2/4.jpg",
    "/branch2/5.jpg",
    "/branch2/6.jpg",
    "/branch2/7.jpg",
  ],
  default: ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"],
};

// تابع برای گرفتن گالری عکس مناسب برای هر شعبه
const getBranchImageGallery = (branchSlug: string) => {
  return branchImageGalleries[branchSlug] || branchImageGalleries["default"];
};

export default function HomeContent() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);

  // State برای مدیریت پس‌زمینه‌های متغیر
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [bgImages, setBgImages] = useState<string[]>([]);

  // Ref برای interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Branch context و routing
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedBranch, setSelectedBranch, clearSelectedBranch } =
    useBranch();

  // State برای بررسی اینکه آیا در حال redirect هستیم یا نه
  const [isRedirecting, setIsRedirecting] = useState(true);

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // بررسی شعبه هنگام لود صفحه
  useEffect(() => {
    const checkBranch = async () => {
      // تاخیر برای UX بهتر
      await new Promise((resolve) => setTimeout(resolve, 500));

      const branchSlug = searchParams?.get("branch");

      // اگر branch در URL وجود دارد
      if (branchSlug) {
        // گرفتن شعبه از دیتابیس
        try {
          const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("slug", branchSlug)
            .eq("is_active", true)
            .single();

          if (!error && data) {
            setSelectedBranch(data);
            // تنظیم عکس‌های این شعبه
            const gallery = getBranchImageGallery(data.slug);
            setBgImages(gallery);
            setIsRedirecting(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching branch from URL:", error);
        }
      }

      // اگر شعبه در localStorage وجود دارد
      const storedBranch = localStorage.getItem("selectedBranch");
      if (storedBranch) {
        try {
          const branch = JSON.parse(storedBranch);
          setSelectedBranch(branch);
          // تنظیم عکس‌های این شعبه
          const gallery = getBranchImageGallery(branch.slug);
          setBgImages(gallery);
          setIsRedirecting(false);
          return;
        } catch (error) {
          console.error("Error parsing stored branch:", error);
        }
      }

      // اگر شعبه انتخاب نشده، به صفحه انتخاب شعبه هدایت کن
      setIsRedirecting(false);
      router.push("/branches");
    };

    checkBranch();
  }, [searchParams, setSelectedBranch, router]);

  // تابع برای تغییر خودکار پس‌زمینه با انیمیشن
  useEffect(() => {
    if (isRedirecting || bgImages.length === 0) return;

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
  }, [bgImages, isAnimating, isRedirecting]);

  // خواندن اطلاعات رستوران و غذاها
  useEffect(() => {
    if (isRedirecting || !selectedBranch) return;

    const fetchData = async () => {
      try {
        // گرفتن غذاهای این شعبه
        const { data: foodsData, error: foodsError } = await supabase
          .from("foods")
          .select("*")
          .eq("branch_id", selectedBranch.id);

        if (foodsError) throw foodsError;
        setFoods(foodsData || []);

        // گرفتن دسته‌بندی‌ها
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) {
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
  }, [selectedBranch, isRedirecting]);

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
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-300 mx-auto mb-4"></div>
          <p className="">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // اگر شعبه انتخاب نشده (این حالت نباید اتفاق بیفتد چون قبلاً redirect کردیم)
  if (!selectedBranch || bgImages.length === 0) {
    return null;
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
            isAnimating ? "scale-105 opacity-80" : "scale-100 opacity-100"
          }`}
          key={currentBgIndex}
        >
          <Image
            src={bgImages[currentBgIndex]}
            alt={selectedBranch.name_fa}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-white pt-8 px-4">
        <div className="flex justify-between px-2 items-center mb-4">
          <Drawer direction={language === "en" ? "left" : "right"}>
            <DrawerTrigger>
              <Button className="p-2 glass-cart-btn text-gray-300">
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              className={`glass-side ${
                language === "en" ? "rounded-r-[55px]" : "rounded-l-[55px]"
              }`}
            >
              <DrawerHeader>
                <DrawerTitle>
                  <div className="flex flex-col gap-5 justify-center p-5 rounded-3xl bg-gray-100/5 border-[0.1px] border-gray-500/60 items-center mt-10">
                    <Image
                      src="/logo.png"
                      alt="Watandar logo"
                      width={80}
                      height={50}
                      className="object-cover"
                    />
                  </div>
                </DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <div className="text-center mb-4">
                  <div className="flex items-center flex-col justify-center gap-2 mb-2">
                    <h1 className="font-bold text-2xl">
                      {t("restaurantName")}
                    </h1>
                    <span className="font-medium">
                      {language === "en"
                        ? selectedBranch.name_en || selectedBranch.name_fa
                        : language === "ar"
                        ? selectedBranch.name_ar || selectedBranch.name_fa
                        : selectedBranch.name_fa}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href={"/branches"}
                    className="block font-medium p-2 bg-gray-600/20 rounded-md text-center text-white/80"
                    onClick={() => clearSelectedBranch()}
                  >
                    انتخاب / تغییر شعبه
                  </Link>
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

          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="absolute bottom-0 w-full z-20 glass-card">
        <div className="glass-check-status absolute left-0 top-20">
          <CheckRestaurantStatus />
        </div>

        <div className="flex flex-col items-center space-y-5 w-full px-8 ">
          <div className="flex-col flex items-center">
            <div className="">
              <Image
                src={"/logo.png"}
                alt={selectedBranch.name_fa}
                width={120}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{t("restaurantName")}</h1>
              <h1 className="text-lg">
                {language === "ar"
                  ? selectedBranch.name_ar
                  : language === "en"
                  ? selectedBranch.name_en
                  : selectedBranch.name_fa}
              </h1>
            </div>
          </div>

          {/* Social Icons */}
          {/* <div className="flex items-center gap-4"> */}
          <div className="flex items-center gap-3 z-50 inset-0">
            <>
            <Link href="/branches">
            <button className="glass-btn glass-small flex items-center justify-center">
              <Building2 />
            </button>
            </Link>
            </>
            <>
            <Link href="https://www.instagram.com/vatandar_restaurant?igsh=N3R3a3VlOXUwYXF6ZQ==" target="_blank" rel="noopener noreferrer" >
              <button
                className="glass-btn glass-small flex items-center justify-center"
                
                >
                <Instagram size={20} />
              </button>
              </Link>
                
            </>
            <>
              <ClockDrawer />
            </>
            <>
              <LocationDrawer />
            </>
            <>
              <PhoneDrawer />
            </>
          </div>
          {/* </div> */}

          {/* دکمه اصلی مشاهده منو */}
          <Link
            href={`/menu?branch=${selectedBranch.slug}`}
            className="w-full flex justify-center glass-btn"
          >
            <button className="py-2 w-full text-lg font-semibold">
              {t("viewMenu")}
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
