// components/HomePageContent.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Store, MapPin, Phone, Clock, Menu } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { translations } from "@/translations/translation";

export default function HomePageContent() {
  const { selectedBranch } = useBranch();
  const { language } = useLanguage();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 pt-8 pb-16"
    >
      {/* هدر */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("restaurantName") || "رستوران وطندار"}
          </h1>
          <p className="text-gray-600 text-sm">
            {t("restaurantDescription") || "طعم‌های اصیل افغانستان"}
          </p>
        </div>
        
        {/* نشانگر شعبه */}
        <Link href="/branches">
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 cursor-pointer"
          >
            <Store className="w-3 h-3" />
            <span className="text-xs">{selectedBranch?.name_fa}</span>
          </Badge>
        </Link>
      </header>

      {/* کارت شعبه */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedBranch?.name_fa}
            </h2>
            <p className="text-gray-600">{selectedBranch?.name_ar}</p>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("active") || "فعال"}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 ml-2 text-gray-500" />
            <span>{selectedBranch?.address}</span>
          </div>
          
          {selectedBranch?.phone && (
            <div className="flex items-center text-gray-700">
              <Phone className="w-5 h-5 ml-2 text-gray-500" />
              <span>{selectedBranch?.phone}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Link href="/menu" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Menu className="ml-2 w-5 h-5" />
              {t("viewMenu") || "مشاهده منو"}
            </Button>
          </Link>
          
          <Link href="/branches" className="flex-1">
            <Button variant="outline" className="w-full">
              {t("changeBranch") || "تغییر شعبه"}
            </Button>
          </Link>
        </div>
      </div>

      {/* خدمات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold mb-1">{t("delivery") || "ارسال سریع"}</h3>
            <p className="text-sm text-gray-600">تحویل در کمترین زمان ممکن</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">🏪</div>
            <h3 className="font-semibold mb-1">{t("pickup") || "تحویل حضوری"}</h3>
            <p className="text-sm text-gray-600">در شعبه آماده‌سازی می‌شود</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">🍽️</div>
            <h3 className="font-semibold mb-1">{t("dineIn") || "صرف در محل"}</h3>
            <p className="text-sm text-gray-600">مکان مناسب برای پذیرایی</p>
          </div>
        </div>
      </div>

      {/* دسترسی سریع */}
      <div className="space-y-4">
        <Link href="/menu">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg">
            <ArrowRight className="mr-2" />
            {t("viewMenu") || "مشاهده منوی کامل"}
          </Button>
        </Link>
      </div>

      {/* فوتر */}
      <footer className="mt-12 text-center text-gray-600 text-sm">
        <p>© 2025 {t("restaurantName") || "وطندار"}</p>
        <p className="mt-2">تهران، خیابان ولیعصر</p>
        <p>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
        <div className="flex justify-center gap-4 mt-4">
          <Clock className="w-4 h-4" />
          <span>ساعات کاری: ۱۰:۰۰ - ۰۰:۰۰</span>
        </div>
      </footer>
    </div>
  );
}