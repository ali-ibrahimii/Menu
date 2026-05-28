"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Phone, Copy, MessageCircle, Check, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();

  // تابع ترجمه ساده
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        call: "Call",
        copy: "Copy",
        copied: "Copied",
        sendMessage: "Message",
        contactInfo: "Contact numbers",
        mainNumber: "First",
        secondaryNumber: "Secondary",
        notAvailable: "No number",
        close: "Close",
      },
      ar: {
        call: "اتصال",
        copy: "نسخ",
        copied: "تم النسخ",
        sendMessage: "رسالة",
        contactInfo: "أرقام الاتصال",
        mainNumber: "أولاً",
        secondaryNumber: "ثانوي",
        notAvailable: "لا يوجد",
        close: "إغلاق",
      },
      fa: {
        call: "تماس",
        copy: "کپی",
        copied: "کپی شد",
        sendMessage: "پیام",
        contactInfo: "شماره های تماس",
        mainNumber: "اول",
        secondaryNumber: "دوم",
        notAvailable: "ندارد",
        close: "بستن",
      },
    };

    return translations[language]?.[key] || translations.en[key] || key;
  };

  // فرمت شماره تلفن
  const formatPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return phone;
  };

  // باز کردن صفحه تماس
  const handlePhoneCall = (phoneNumber: string | undefined | null): void => {
    if (!phoneNumber) return;
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    window.location.href = `tel:${cleanedNumber}`;
  };

  // ارسال پیام
  const handleSendMessage = (phoneNumber: string | undefined | null): void => {
    if (!phoneNumber) return;
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    window.location.href = `sms:${cleanedNumber}`;
  };

  // کپی شماره
  const handleCopyPhone = (phoneNumber: string): void => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    navigator.clipboard.writeText(cleanedNumber);
    setCopiedPhone(cleanedNumber);
    toast.success(t("copied"));
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // کامپوننت کارت تلفن
  const PhoneCard = ({
    phoneNumber,
    label,
    isPrimary = false,
  }: {
    phoneNumber: string | undefined | null;
    label: string;
    isPrimary?: boolean;
  }) => {
    if (!phoneNumber) return null;

    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    const isCopied = copiedPhone === cleanedNumber;

    return (
      <div className="dark:bg-card bg-sidebar rounded-lg p-3 mb-2 border glass-card-3d">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Phone size={16}/>
            <span className="text-sm">{label}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-lg font-bold tracking-wider">
            {formatPhoneNumber(phoneNumber)}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handlePhoneCall(phoneNumber)}
            className="flex-1 py-2 px-2 rounded-sm dark:bg-gray-500/20 bg-black/15 text-sm flex items-center justify-center gap-1 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{t("call")}</span>
          </button>

          <button
            onClick={() => handleSendMessage(phoneNumber)}
            className="flex-1 dark:bg-gray-500/20 bg-black/15 rounded-sm py-2 px-2 text-sm flex items-center justify-center gap-1 transition"
          >
            <MessageCircle size={16} />
            <span>{t("sendMessage")}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button className="bg-white/5 rounded-full p-3 border border-white/10">
          <Phone size={20} className="" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="dark:text-white border glass-drawer max-h-[80vh]">
        <div className="w-full px-8 pb-6">
          {/* هدر ساده */}
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-xl text-center font-[BTitr]">
              {t("contactInfo")}
            </h1>
          </div>

          {/* لیست شماره‌ها */}
          <div className="space-y-2">
            <PhoneCard
              phoneNumber={selectedBranch?.phone_1}
              label={t("mainNumber")}
              isPrimary={true}
            />

            <PhoneCard
              phoneNumber={selectedBranch?.phone_2}
              label={t("secondaryNumber")}
            />

            {!selectedBranch?.phone_2 && (
              <div className="bg-white/15 rounded-lg p-3 border border-white/10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-gray-500/20">
                    <Phone size={18} className="dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm dark:text-gray-400">
                      {t("secondaryNumber")}
                    </p>
                    <p className="text-xs dark:text-gray-500 mt-1">
                      {t("notAvailable")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
