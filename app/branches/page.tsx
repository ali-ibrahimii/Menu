// app/branches/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { Branch } from "@/types/index";
import Loader from "@/components/Loader";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import React from "react";

// لیست عکس‌های هر شعبه (بهبود یافته)
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
  default: [
    "/bg.jpg",
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/sonati-bg.jpg",
    "/sonati1-bg.jpg",
  ],
};

const getBranchImageGallery = (branchSlug: string) => {
  return branchImageGalleries[branchSlug] || branchImageGalleries["default"];
};

// کامپوننت مجزا برای هر کارت (برای جلوگیری از رندر مجدد همه کارت‌ها)
const BranchCard = React.memo(({ 
  branch, 
  language, 
  onSelect,
  currentImageIndex,
  images 
}: { 
  branch: Branch; 
  language: string; 
  onSelect: (branch: Branch) => void;
  currentImageIndex: number;
  images: string[];
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // فقط یکبار
    onSelect(branch);
  }, [branch, onSelect]);

  const currentImage = images[currentImageIndex];

  return (
    <div
      className="group relative rounded-3xl overflow-hidden cursor-pointer h-64 mx-4"
      onClick={handleClick} // یک handler بیشتر نداریم
    >
      {/* عکس پس‌زمینه */}
      <div className="absolute inset-0 border border-white/10 rounded-3xl overflow-hidden">
        <Image
          src={currentImage}
          alt={`${branch.name_fa} - عکس ${currentImageIndex + 1}`}
          className="object-cover transition-all duration-1000"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading={currentImageIndex === 0 ? "eager" : "lazy"}
          priority={currentImageIndex === 0}
        />

        {/* گرادیانت برای خوانایی متن */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />

        {/* نقاط نشانگر */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-green-400 w-4"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* محتوا */}
      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* بخش بالایی */}
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

        {/* اطلاعات */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
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

        {/* دکمه - حالا بدون onClick مجزا */}
        <button
          className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          onClick={handleClick} // همان handler را استفاده می‌کنیم
        >
          <Check className="w-5 h-5" />
          {translations[language as keyof typeof translations]?.selectBranch || "انتخاب شعبه"}
        </button>
      </div>
    </div>
  );
});

BranchCard.displayName = 'BranchCard';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();

  // استفاده از useRef برای interval‌ها
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({});

  // مموری‌سازی تابع ترجمه
  const t = useCallback((key: string) => {
    const langTranslations = translations[language as keyof typeof translations] as Record<string, string>;
    return langTranslations[key] || key;
  }, [language]);

  // تابع انتخاب شعبه - بهینه شده
  const handleSelectBranch = useCallback((branch: Branch) => {
    // استفاده از requestAnimationFrame برای بهینه‌سازی
    requestAnimationFrame(() => {
      setSelectedBranch(branch);
      router.push("/");
    });
  }, [setSelectedBranch, router]);

  // تغییر عکس
  const changeImage = useCallback((branchId: string, images: string[]) => {
    setCurrentImageIndexes((prev) => {
      const currentIndex = prev[branchId] || 0;
      const newIndex = (currentIndex + 1) % images.length;
      
      // اگر ایندکس تغییر نکرده، state را به‌روز نکن
      if (currentIndex === newIndex) return prev;
      
      return {
        ...prev,
        [branchId]: newIndex,
      };
    });
  }, []);

  // شروع چرخش عکس
  const startImageRotation = useCallback((branchId: string, images: string[]) => {
    if (intervalRefs.current[branchId]) {
      clearInterval(intervalRefs.current[branchId]);
    }

    intervalRefs.current[branchId] = setInterval(() => {
      changeImage(branchId, images);
    }, 5000);
  }, [changeImage]);

  // واکشی شعبه‌ها
  useEffect(() => {
    let isMounted = true;

    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (isMounted) {
          setBranches(data || []);

          // مقداردهی اولیه
          const initialIndexes: Record<string, number> = {};
          data?.forEach((branch) => {
            initialIndexes[branch.id] = 0;
            const images = getBranchImageGallery(branch.slug);
            startImageRotation(branch.id, images);
          });
          
          setCurrentImageIndexes(initialIndexes);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBranches();

    return () => {
      isMounted = false;
      // پاک کردن interval‌ها
      Object.values(intervalRefs.current).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [startImageRotation]);

  if (loading) {
    return (
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="flex items-center justify-center flex-col">
          <Loader />
          <p className="mt-4">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div className="fixed inset-0 -z-[1] pointer-events-none">
        <DotPattern
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>

      <div className="z-10 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* هدر */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative w-30 h-30 border rounded-2xl p-3 bg-card-foreground">
                <Image
                  src="/logo1.png"
                  alt="رستوران وطندار"
                  width={120}
                  height={30}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-[BTitr]">
              {t("restaurantName")}
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              {t("selectBranchReq")}
            </p>
          </div>

          {/* کارت‌های شعبه */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {branches.map((branch) => {
              const images = getBranchImageGallery(branch.slug);
              const currentIndex = currentImageIndexes[branch.id] || 0;

              return (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  language={language}
                  onSelect={handleSelectBranch}
                  currentImageIndex={currentIndex}
                  images={images}
                />
              );
            })}
          </div>

          {/* اگر شعبه‌ای وجود نداشت */}
          {branches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 p-6 bg-accent/10 text-white rounded-full inline-flex">
                <Building2 size={50} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t("noActiveBranch") || "هیچ شعبه فعالی یافت نشد"}
              </h3>
              <p className="text-green-200">
                {t("pleaseTryAgain") || "لطفاً بعداً مجدداً مراجعه کنید"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-[2px] inset-0 -z-10 absolute top-0 w-full h-full left-0" />
    </div>
  );
}