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
import { PhoneCall, MapPin, Building, Phone, Map, Instagram } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { Separator } from "../ui/separator";
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

  // تابع برای فرمت کردن شماره تلفن
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          className="glass-btn glass-small flex items-center justify-center"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Instagram size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[40vh] glass-drawer">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
          <div className="flex justify-center mt-3">
            <h1 className="font-bold text-xl">
              {language === "ar"
                ? selectedBranch?.name_ar
                : language === "fa"
                ? selectedBranch?.name_fa
                : selectedBranch?.name_en}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="inline-flex p-2 rounded-md bg-accent/10">
              <MapPin size={18} />
            </div>
            <p className="text-[12px]">
              {language === "en"
                ? selectedBranch?.address_en
                : language === "ar"
                ? selectedBranch?.address_ar
                : selectedBranch?.address_fa}
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="space-y-4">
              <Label className="text-white">شماره تماس ۱</Label>
              <div className="flex items-center space-x-2">
                <div className="inline-flex p-2 rounded-md bg-accent/10">
                  <PhoneCall size={18} />
                </div>
                <h2>{selectedBranch?.phone_1}</h2>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <div className="inline-flex p-2 rounded-md bg-accent/10">
                  <PhoneCall size={18} />
                </div>

                <h2>{selectedBranch?.phone_2}</h2>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
