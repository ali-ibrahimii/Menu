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
import { PhoneCall, MapPin, Building, Phone, Map, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect, useMemo } from "react";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { Separator } from "../ui/separator";
import { useBranch } from "@/contexts/BranchContext";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Branch } from "@/types/index";
import { Badge, badgeVariants } from "../ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export default function ClockDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const { selectedBranch, setSelectedBranch, clearSelectedBranch } =
    useBranch();
  const searchParams = useSearchParams();
  const branchSlug = searchParams?.get("branch");

  // ساعت‌های کاری رستوران
  const OPEN_HOUR = 8; // 8 AM
  const CLOSE_HOUR = 23.5; // 4 AM (در سیستم 24 ساعته)
  const TOTAL_HOURS = CLOSE_HOUR - OPEN_HOUR; // 15 ساعت

  // وضعیت و زمان باقی‌مانده
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    percentage: 0,
    isOpen: false,
  });

  useEffect(() => {
    if (
      branchSlug &&
      branches.length > 0 &&
      selectedBranch?.slug !== branchSlug
    ) {
      const branchFromUrl = branches.find((b) => b.slug === branchSlug);
      if (branchFromUrl) {
        // می‌توانید از context برای تنظیم شعبه استفاده کنید
        // یا در اینجا پیام نشان دهید که باید شعبه انتخاب شود
      }
    }
  }, [branchSlug, branches, selectedBranch]);

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // تابع محاسبه زمان باقی‌مانده
  const calculateRemainingTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // بررسی اینکه آیا رستوران باز است یا نه
    const isCurrentlyOpen =
      currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR;

    if (!isCurrentlyOpen) {
      // اگر رستوران بسته است
      setRemainingTime({
        hours: 0,
        minutes: 0,
        seconds: 0,
        percentage: 0,
        isOpen: false,
      });
      return;
    }

    // محاسبه زمان باقی‌مانده تا بسته شدن
    const closingTime = new Date();
    closingTime.setHours(CLOSE_HOUR, 0, 0, 0);

    const diffMs = closingTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // محاسبه درصد پیشرفت
    const currentTotalMinutes = (currentHour - OPEN_HOUR) * 60 + currentMinute;
    const totalMinutes = TOTAL_HOURS * 60;
    const percentage = Math.min(
      100,
      (currentTotalMinutes / totalMinutes) * 100,
    );

    setRemainingTime({
      hours: diffHours,
      minutes: diffMinutes,
      seconds: diffSeconds,
      percentage: Math.round(percentage),
      isOpen: true,
    });
  };

  // به‌روزرسانی زمان هر ثانیه
  useEffect(() => {
    const interval = setInterval(calculateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // تابع فرمت‌بندی زمان
  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // گرفتن پیام وضعیت بر اساس زبان
  const getStatusMessage = (): { message: string; color: BadgeVariant } => {
    if (!remainingTime.isOpen) {
      return {
        message:
          language === "en"
            ? "Closed"
            : language === "ar"
              ? "مغلق"
              : "بسته است",
        color: "destructive",
      };
    } else {
      return {
        message:
          language === "en" ? "Open" : language === "ar" ? "مفتوح" : "باز است",
        color: "default",
      };
    }
  };

  const statusInfo = getStatusMessage();

  // ترجمه برچسب‌ها
  const translationsMap = {
    status:
      language === "en" ? "Status" : language === "ar" ? "الحالة" : "وضعیت",
    hoursRemaining:
      language === "en"
        ? "Hours Remaining"
        : language === "ar"
          ? "الساعات المتبقية"
          : "ساعت باقی‌مانده",
    openHours:
      language === "en"
        ? "Open Hours"
        : language === "ar"
          ? "ساعات العمل"
          : "ساعت‌های کاری",
    address:
      language === "en" ? "Address" : language === "ar" ? "العنوان" : "آدرس",
    phone1:
      language === "en" ? "Phone 1" : language === "ar" ? "الهاتف ۱" : "تلفن ۱",
    phone2:
      language === "en" ? "Phone 2" : language === "ar" ? "الهاتف ۲" : "تلفن ۲",
    today: language === "en" ? "Today" : language === "ar" ? "اليوم" : "امروز",
    closed: language === "en" ? "Closed" : language === "ar" ? "مغلق" : "بسته",
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          className="bg-white/5 rounded-full p-3 border border-white/10"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Clock size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent
        dir={language === "en" ? "ltr" : "rtl"}
        className="h-auto max-h-[80vh] glass-drawer"
      >
        <div className="flex-1 w-full px-8 space-y-4 overflow-y-auto pb-6">
          {/* هدر با نام شعبه */}
          <div className="flex flex-col items-center space-y-2">
            <h1 className="font-bold text-xl text-center font-[BTitr]">
              {translationsMap.openHours}
            </h1>
            <Badge variant={statusInfo.color} className="text-xs">
              {statusInfo.message}
            </Badge>
          </div>

          {/*  خط جدا کننده  */}
          <div className="h-px bg-linear-to-r from-transparent dark:via-white via-black to-transparent" />

          {/* ساعت شمار معکوس */}
          <div className="space-y-4 dark:bg-card bg-sidebar rounded-xl p-4 border dark:border-white/10 border-black/10">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">
                {translationsMap.hoursRemaining}:
              </h3>
              <Badge variant="default" className="text-xs">
                {translationsMap.today}
              </Badge>
            </div>

            {/* نمایش بزرگ ساعت */}
            <div className="text-center space-y-2">
              {remainingTime.isOpen ? (
                <>
                  <div
                    className={`text-4xl font-bold tracking-wider py-1 ${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}
                  >
                    {formatTime(
                      remainingTime.hours,
                      remainingTime.minutes,
                      remainingTime.seconds,
                    )}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    {language === "en"
                      ? "Until closing at 11:30 PM"
                      : language === "ar"
                        ? "حتى الإغلاق الساعة 11:30 مساءً"
                        : "تا ساعت ۲۳:۳۰ (۱۱:۳۰ شب)"}
                  </p>
                </>
              ) : (
                <>
                  <div className={`text-3xl font-bold dark:text-gray-600 text-gray-800  ${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}>
                    {translationsMap.closed}
                  </div>
                  <p className="text-sm dark:text-gray-300 text-gray-800">
                    {language === "en"
                      ? "Opens tomorrow at 8:00 AM"
                      : language === "ar"
                        ? "يفتح غدًا الساعة 8:00 صباحًا"
                        : "فردا ساعت ۸:۰۰ صبح باز می‌شود"}
                  </p>
                </>
              )}
            </div>

            {/* نوار پیشرفت */}
            {remainingTime.isOpen && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>8:00 AM</span>
                  {/*  خط جدا کننده  */}
                  <span>11:00 PM</span>
                </div>
                <div className="h-px bg-linear-to-r from-transparent dark:via-white via-black to-transparent" />
              </div>
            )}
          </div>

          {/* ساعت کاری */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">
              {translationsMap.openHours}
            </h3>
            <div className="grid grid-cols- gap-2 text-sm">
              <div
                dir={language === "fa" || "ar" ? "ltr" : ""}
                className="dark:bg-white/5 bg-sidebar border rounded-lg p-3 text-center"
              >
                <div className="font-semibold">
                  {language === "en"
                    ? "Every Day"
                    : language === "ar"
                      ? "كل يوم"
                      : "هر روز"}
                </div>
                <div className="dark:text-gray-300 mt-1">
                  8:00 AM - 12:00 PM
                </div>
                <div className="text-xs dark:text-gray-400 mt-1">
                  {language === "en"
                    ? "16 hours"
                    : language === "ar"
                      ? "16 ساعة"
                      : "۱۶ ساعت"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
