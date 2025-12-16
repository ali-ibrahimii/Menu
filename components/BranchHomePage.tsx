// app/components/BranchHomePage.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Store, MapPin, Phone, Clock, Menu, Home, Map } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { translations } from "@/translations/translation";

export default function BranchHomePage() {
  const { selectedBranch, clearSelectedBranch } = useBranch();
  const { language } = useLanguage();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const handleChangeBranch = () => {
    clearSelectedBranch();
    window.location.href = '/branches';
  };

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 pt-8 pb-16"
    >
      {/* هدر با آیکون شعبه */}
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              {t("restaurantName") || "رستوران وطندار"}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("restaurantDescription") || "طعم‌های اصیل افغانستان"}
            </p>
          </div>
          
          {/* دکمه تغییر شعبه */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangeBranch}
            className="flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            تغییر شعبه
          </Button>
        </div>

        {/* کارت اطلاعات شعبه */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  شعبه فعال
                </Badge>
                <span className="text-sm text-gray-500">📍 شما اینجا هستید</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedBranch?.name_fa}
              </h2>
              <p className="text-gray-600">{selectedBranch?.name_ar}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-medium">آدرس:</p>
                <p className="text-sm mt-1">{selectedBranch?.address}</p>
              </div>
            </div>
            
            {selectedBranch?.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">تلفن:</p>
                  <p className="text-sm mt-1">{selectedBranch?.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* بخش اصلی - دسترسی سریع */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          چه خدمتی نیاز دارید؟
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* کارت اصلی - مشاهده منو */}
          <Link href="/menu">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-white/20 rounded-full mb-4">
                  <Menu className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-3">مشاهده منو</h3>
                <p className="opacity-90 mb-6">
                  منوی کامل رستوران را مشاهده کنید و سفارش خود را ثبت نمایید
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-green-700 hover:bg-gray-100 font-semibold"
                >
                  <ArrowRight className="ml-2" />
                  ورود به منو
                </Button>
              </div>
            </div>
          </Link>

          {/* سایر خدمات */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="text-2xl">🚚</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">سفارش آنلاین</h3>
                  <p className="text-sm text-gray-600 mt-1">تحویل در محل شما</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <div className="text-2xl">🏪</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">تحویل حضوری</h3>
                  <p className="text-sm text-gray-600 mt-1">در شعبه آماده می‌شود</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <div className="text-2xl">🍽️</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">رزرو میز</h3>
                  <p className="text-sm text-gray-600 mt-1">برای صرف غذا در رستوران</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات تماس و ساعات کاری */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🕒</div>
            <h4 className="font-semibold text-gray-800">ساعات کاری</h4>
            <p className="text-sm text-gray-600 mt-1">همه روزه</p>
            <p className="text-sm text-gray-600">۱۰:۰۰ - ۰۰:۰۰</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">📞</div>
            <h4 className="font-semibold text-gray-800">پشتیبانی</h4>
            <p className="text-sm text-gray-600 mt-1">۰۲۱-۱۲۳۴۵۶۷۸</p>
            <p className="text-sm text-gray-600">پاسخگوی ۲۴ ساعته</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">📍</div>
            <h4 className="font-semibold text-gray-800">آدرس مرکزی</h4>
            <p className="text-sm text-gray-600 mt-1">تهران، خیابان ولیعصر</p>
            <p className="text-sm text-gray-600">طبقه دوم، واحد ۵</p>
          </div>
        </div>
      </div>

      {/* فوتر */}
      <footer className="mt-12 text-center text-gray-600">
        <p className="text-sm">© 2025 {t("restaurantName") || "وطندار"}</p>
        <div className="flex justify-center items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>۱۰:۰۰ - ۰۰:۰۰</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div>همه روزه باز است</div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div>پذیرش سفارش آنلاین</div>
        </div>
      </footer>
    </div>
  );
}