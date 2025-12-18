// app/branches/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Check, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CheckRestaurantStatus from "@/components/CheckRestaurantStatus";
import {Branch} from '@/types/index'

// لیست عکس‌های هر شعبه
const branchImageGalleries: Record<string, string[]> = {
  main: ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"],
  branch2: [
    "/branche2/1.jpg",
    "/branche2/2.jpg",
    "/branche2/3.jpg",
    "/branche2/4.jpg",
    "/branche2/5.jpg",
    "/branche2/6.jpg",
    "/branche2/7.jpg",
  ],

  // عکس‌های پیش‌فرض برای شعبه‌های دیگر
  default: [
    "/bg.jpg",
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/sonati-bg.jpg",
    "/sonati1-bg.jpg",
  ],
};

// تابع برای گرفتن گالری عکس مناسب برای هر شعبه
const getBranchImageGallery = (branchSlug: string) => {
  if (branchImageGalleries[branchSlug]) {
    return branchImageGalleries[branchSlug];
  }

  // اگر گالری مخصوص نداشت، از گالری پیش‌فرض استفاده کن
  return branchImageGalleries["default"];
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();

  // برای هر شعبه، index عکس فعلی را ذخیره می‌کنیم
  const [currentImageIndexes, setCurrentImageIndexes] = useState<
    Record<string, number>
  >({});

  // Ref برای interval‌ها
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  useEffect(() => {
    fetchBranches();

    return () => {
      // پاک کردن تمام interval‌ها هنگام unmount
      Object.values(intervalRefs.current).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBranches(data || []);

      // مقداردهی اولیه index عکس‌ها
      const initialIndexes: Record<string, number> = {};
      data?.forEach((branch) => {
        initialIndexes[branch.id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);

      // شروع تغییر خودکار عکس‌ها برای همه شعبه‌ها
      data?.forEach((branch) => {
        const images = getBranchImageGallery(branch.slug);
        startImageRotation(branch.id, images);
      });
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branch: Branch) => {
    // ذخیره شعبه
    setSelectedBranch(branch);
    // هدایت به صفحه اصلی
    router.push("/");
  };

  // تغییر عکس برای یک شعبه خاص
  const changeImage = (branchId: string, images: string[]) => {
    setCurrentImageIndexes((prev) => {
      const currentIndex = prev[branchId] || 0;
      const newIndex = (currentIndex + 1) % images.length;

      return {
        ...prev,
        [branchId]: newIndex,
      };
    });
  };

  // شروع اتوماتیک تغییر عکس‌ها برای یک شعبه
  const startImageRotation = (branchId: string, images: string[]) => {
    // اگر قبلاً interval داشت، پاکش کن
    if (intervalRefs.current[branchId]) {
      clearInterval(intervalRefs.current[branchId]);
    }

    // شروع interval جدید
    intervalRefs.current[branchId] = setInterval(() => {
      changeImage(branchId, images);
    }, 5000); // تغییر عکس هر ۳ ثانیه
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
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
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative min-h-screen overflow-hidden "
    >
      <div className="fixed inset-0 -z-10 overflow-hidden w-screen h-screen">
        <img src="/sonati-bg.jpg" className="h-full w-full" />
      </div>
      <div className="z-10 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white">
            <LanguageSwitcher />
          </div>
          {/* هدر */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center">
              <div className="relative w-30 h-30">
                <Image
                  src="/logo.png"
                  alt="رستوران وطندار"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-200 mb-3">
              {t("restaurantName")}
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              {t("selectBranchReq")}
            </p>
          </div>

          {/* کارت‌های شعبه */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {branches.map((branch) => {
              const images = getBranchImageGallery(branch.slug);
              const currentIndex = currentImageIndexes[branch.id] || 0;
              const currentImage = images[currentIndex];

              return (
                <div
                  key={branch.id}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer h-64 mx-4" // ارتفاع کم
                >
                  {/* عکس پس‌زمینه */}
                  <div className="absolute inset-0">
                    <Image
                      src={currentImage}
                      alt={`${branch.name_fa} - عکس ${currentIndex + 1}`}
                      fill
                      className="object-cover transition-all duration-1000"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={currentIndex === 0}
                    />

                    {/* Gradient overlay برای خوانایی متن */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30"></div>

                    {/* نقاط نشانگر */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-1.5 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? "bg-green-400 w-4"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* تمام محتوا روی عکس */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* بخش بالایی: نام و وضعیت */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">
                            {language === "en"
                              ? branch.name_en
                              : language === "fa"
                              ? branch.name_fa
                              : branch.name_ar}
                          </h3>
                        </div>
                      </div>

                      <div className="glass-check-status-branch text-[11px]">
                        <CheckRestaurantStatus />
                      </div>
                    </div>

                    {/* بخش میانی: اطلاعات */}
                    <div className="space-y-3">
                      <div className="flex items-start jus gap-2">
                        <div className="p-2 rounded-sm bg-accent/15 backdrop-blur-[2px]">
                          <MapPin className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-white/90 line-clamp-2">
                          {language === "en"
                            ? branch.address_en
                            : language === "fa"
                            ? branch.address_fa
                            : branch.address_ar}
                        </p>
                      </div>

                      {/* شماره تماس اول */}
                      {branch.phone_1 && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-sm bg-accent/15 backdrop-blur-[2px]">
                            <Phone className="w-4 h-4 text-green-300 flex-shrink-0" />
                          </div>
                          <p className="text-sm text-white/90">
                            {branch.phone_1}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* بخش پایینی: دکمه */}
                    <Button
                      className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-full font-semibold shadow-lg transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBranch(branch);
                      }}
                    >
                      <Check className="w-5 h-5 ml-2" />
                      {t("selectBranch")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* اگر شعبه‌ای وجود نداشت */}
          {branches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 p-6 bg-accent/10 text-white rounded-full inline-flex"><Building2 size={50} /></div>
              <h3 className="text-2xl font-bold text-white mb-3">
                هیچ شعبه فعالی یافت نشد
              </h3>
              <p className="text-green-200">لطفاً بعداً مجدداً مراجعه کنید</p>
            </div>
          )}

          {/* فوتر */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-green-300">© ۱۴۰۳ رستوران وطندار</p>
          </div> */}
        </div>
      </div>
      <div className="bg-black/50 backdrop-blur-[1px] inset-0 -z-10 absolute top-0 w-full h-full left-0"></div>
    </div>
  );
}
