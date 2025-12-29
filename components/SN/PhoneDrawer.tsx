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
import { PhoneCall, MapPin, Building, Phone, Map, Link } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { useBranch } from "@/contexts/BranchContext";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Branch } from "@/types/index";
import { Label } from "../ui/label";

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const { selectedBranch, setSelectedBranch, clearSelectedBranch } =
    useBranch();
  const searchParams = useSearchParams();
  const branchSlug = searchParams?.get("branch");

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

  // تابع اصلاح شده برای فرمت‌بندی شماره تلفن
  const formatPhoneNumber = (phone: string | undefined | null) => {
    if (!phone) return "";

    // حذف تمام فاصله‌ها، خط‌تیره‌ها و کاراکترهای غیرعددی
    const cleaned = phone.replace(/\D/g, "");

    // بررسی طول شماره (معمولاً 10 یا 11 رقم)
    if (cleaned.length === 10) {
      // فرمت: 0912-345-6789
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
    } else if (cleaned.length === 11) {
      // فرمت: 0098912-345-6789 یا 98912-345-6789
      return cleaned.replace(/(\d{4,5})(\d{3})(\d{4})/, "$1-$2-$3");
    }

    // اگر طول استاندارد نبود، همان شماره برگردانده شود
    return phone;
  };

  // تابع برای باز کردن صفحه کلید گوشی
  const handlePhoneCall = (phoneNumber: string | undefined | null) => {
    if (!phoneNumber) return;

    // پاکسازی شماره برای استفاده در tel:
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    // ساخت لینک tel: برای موبایل‌ها
    const telLink = `tel:${cleanedNumber}`;

    // باز کردن لینک (در موبایل باعث بازشدن صفحه تماس می‌شود)
    window.location.href = telLink;
  };

  // دریافت شماره تماس تمیز شده برای نمایش
  const getDisplayPhone = (phone: string | undefined | null) => {
    return formatPhoneNumber(phone);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          className="glass-btn glass-small flex items-center justify-center"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PhoneCall size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent
        dir={language === "en" ? "ltr" : "rtl"}
        className="h-[40vh] glass-drawer"
      >
        <div className="flex-1 space-y-5 w-full overflow-y-auto px-4 pb-6">
          <div className="flex justify-center mt-3">
            <h1 className="font-bold text-xl">
              {language === "ar"
                ? selectedBranch?.name_ar
                : language === "fa"
                ? selectedBranch?.name_fa
                : selectedBranch?.name_en}
            </h1>
          </div>

          {/* شماره‌های تماس */}
          <div className="flex flex-col space-y-3 w-full">
            {/* شماره تماس ۱ */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                {language === "en"
                  ? "Phone Number 1"
                  : language === "ar"
                  ? "رقم الهاتف ۱"
                  : "شماره تماس ۱"}
              </Label>
              <button
                onClick={() => handlePhoneCall(selectedBranch?.phone_1)}
                className={`glass-phone-card px-6 py-3 ${
                  language === "en" ? "text-left" : "text-right"
                }`}
              >
                <div className="glass-cart-btn p-2">
                  <PhoneCall size={16} />
                </div>
                <h2 className="flex-1">
                  {getDisplayPhone(selectedBranch?.phone_1)}
                </h2>
              </button>
            </div>

            {/* شماره تماس ۲ */}
            <div className="flex flex-col space-y-2">
              <Label className="text-gray-300">
                {language === "en"
                  ? "Phone Number 2"
                  : language === "ar"
                  ? "رقم الهاتف ۲"
                  : "شماره تماس ۲"}
              </Label>

              <button
                onClick={() => handlePhoneCall(selectedBranch?.phone_2)}
                className={`glass-phone-card px-6 py-3 ${
                  language === "en" ? "text-left" : "text-right"
                }`}
                disabled={!selectedBranch?.phone_2}
              >
                <div className="glass-cart-btn p-2">
                  <PhoneCall size={16} />
                </div>
                <h2 className="flex-1">
                  {selectedBranch?.phone_2
                    ? getDisplayPhone(selectedBranch?.phone_2)
                    : language === "en"
                    ? "Not available"
                    : language === "ar"
                    ? "غير متاح"
                    : "موجود نیست"}
                </h2>
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
