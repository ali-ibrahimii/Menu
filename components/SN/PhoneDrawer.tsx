"use client";

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Phone, PhoneCall, Copy, MessageCircle, Share2, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

// تعریف نوع برای ترجمه‌ها
type TranslationKey = 'call' | 'copy' | 'copied' | 'sendMessage' | 'shareNumber' | 
  'phoneNumber1' | 'phoneNumber2' | 'notAvailable' | 'contactInfo';

type TranslationSet = Record<TranslationKey, string>;

type Translations = {
  en: TranslationSet;
  ar: TranslationSet;
  fa: TranslationSet;
};

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();

  // ترجمه‌ها با نوع مشخص
  const translations: Translations = {
    en: {
      call: "Call",
      copy: "Copy",
      copied: "Copied!",
      sendMessage: "Send Message",
      shareNumber: "Share Number",
      phoneNumber1: "Main Number",
      phoneNumber2: "Secondary Number",
      notAvailable: "Not Available",
      contactInfo: "Contact Information"
    },
    ar: {
      call: "اتصال",
      copy: "نسخ",
      copied: "تم النسخ!",
      sendMessage: "إرسال رسالة",
      shareNumber: "مشاركة الرقم",
      phoneNumber1: "الرقم الرئيسي",
      phoneNumber2: "الرقم الثانوي",
      notAvailable: "غير متاح",
      contactInfo: "معلومات الاتصال"
    },
    fa: {
      call: "تماس",
      copy: "کپی",
      copied: "کپی شد!",
      sendMessage: "ارسال پیام",
      shareNumber: "اشتراک شماره",
      phoneNumber1: "شماره اصلی",
      phoneNumber2: "شماره دوم",
      notAvailable: "موجود نیست",
      contactInfo: "اطلاعات تماس"
    }
  };

  // تابع ترجمه با نوع صحیح
  const t = (key: TranslationKey): string => {
    const lang = language as keyof Translations;
    if (translations[lang] && key in translations[lang]) {
      return translations[lang][key];
    }
    // Fallback به انگلیسی
    return translations.en[key] || key;
  };

  // تابع برای فرمت‌بندی شماره تلفن
  const formatPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone) return "";
    
    const cleaned = phone.replace(/\D/g, "");
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    
    return phone;
  };

  // تابع برای باز کردن صفحه تماس
  const handlePhoneCall = (phoneNumber: string | undefined | null): void => {
    if (!phoneNumber) return;
    
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    window.location.href = `tel:${cleanedNumber}`;
  };

  // تابع برای ارسال پیام
  const handleSendMessage = (phoneNumber: string | undefined | null): void => {
    if (!phoneNumber) return;
    
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    window.location.href = `sms:${cleanedNumber}`;
  };

  // تابع برای کپی شماره
  const handleCopyPhone = (phoneNumber: string): void => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    navigator.clipboard.writeText(cleanedNumber);
    setCopiedPhone(cleanedNumber);
    toast.success(t("copied"));
    
    // بازنشانی پس از 2 ثانیه
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // تابع برای اشتراک‌گذاری شماره
  const handleSharePhone = async (phoneNumber: string): Promise<void> => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    const shareData = {
      title: selectedBranch?.name_fa || "رستوران وطندار",
      text: `شماره تماس رستوران: ${formatPhoneNumber(phoneNumber)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback برای مرورگرهایی که Web Share API را ندارند
        navigator.clipboard.writeText(cleanedNumber);
        toast.success("شماره در کلیپ‌بورد کپی شد");
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // طراحی کارت شماره تلفن
  const PhoneCard = ({ 
    phoneNumber, 
    label, 
    isPrimary = false 
  }: { 
    phoneNumber: string | undefined | null; 
    label: string;
    isPrimary?: boolean;
  }) => {
    if (!phoneNumber) return null;

    const cleanedNumber = phoneNumber.replace(/\D/g, "");
    const isCopied = copiedPhone === cleanedNumber;

    return (
      <div className={`rounded-2xl border p-5 mb-4 ${
        isPrimary ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${
              isPrimary ? 'bg-green-500/20' : 'bg-blue-500/20'
            }`}>
              <Phone size={18} className={
                isPrimary ? 'text-green-400' : 'text-blue-400'
              } />
            </div>
            <span className="text-sm font-medium text-gray-300">{label}</span>
          </div>
          
          {isPrimary && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              {t("phoneNumber1")}
            </span>
          )}
        </div>

        {/* شماره تلفن */}
        <div className="text-center mb-5">
          <div className="text-2xl font-bold tracking-wider font-mono">
            {formatPhoneNumber(phoneNumber)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {cleanedNumber}
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => handlePhoneCall(phoneNumber)}
            className="glass-btn py-3 flex flex-col items-center gap-1"
            size="sm"
          >
            <PhoneCall size={16} />
            <span className="text-xs">{t("call")}</span>
          </Button>

          <Button
            onClick={() => handleCopyPhone(phoneNumber)}
            className={`glass-btn py-3 flex flex-col items-center gap-1 ${
              isCopied ? 'bg-green-500/20 border-green-500/30' : ''
            }`}
            size="sm"
          >
            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            <span className="text-xs">{isCopied ? t("copied") : t("copy")}</span>
          </Button>

          <Button
            onClick={() => handleSendMessage(phoneNumber)}
            className="glass-btn py-3 flex flex-col items-center gap-1"
            size="sm"
          >
            <MessageCircle size={16} />
            <span className="text-xs">{t("sendMessage")}</span>
          </Button>

          <Button
            onClick={() => handleSharePhone(phoneNumber)}
            className="glass-btn py-3 flex flex-col items-center gap-1"
            size="sm"
          >
            <Share2 size={16} />
            <span className="text-xs">{t("shareNumber")}</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button className="glass-btn glass-small flex items-center justify-center group relative">
          <PhoneCall size={20} className="group-hover:text-green-400 transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="glass-drawer h-auto max-h-[85vh] rounded-t-3xl border-t border-white/20">
        <div className="p-6 overflow-y-auto">
          {/* هدر */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <PhoneCall size={28} className="text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-center mb-2">
              {language === "ar"
                ? selectedBranch?.name_ar
                : language === "fa"
                ? selectedBranch?.name_fa
                : selectedBranch?.name_en}
            </h1>
            <p className="text-sm text-gray-400 text-center">
              {t("contactInfo")}
            </p>
          </div>

          {/* کارت‌های شماره تلفن */}
          <div className="space-y-4">
            <PhoneCard
              phoneNumber={selectedBranch?.phone_1}
              label={language === "en" 
                ? "Primary Contact" 
                : language === "ar" 
                ? "الاتصال الرئيسي" 
                : "تماس اصلی"}
              isPrimary={true}
            />

            <PhoneCard
              phoneNumber={selectedBranch?.phone_2}
              label={language === "en" 
                ? "Secondary Contact" 
                : language === "ar" 
                ? "الاتصال الثانوي" 
                : "تماس دوم"}
            />

            {/* اگر شماره دوم وجود ندارد */}
            {!selectedBranch?.phone_2 && (
              <div className="glass-card rounded-2xl p-5 text-center border-l-4 border-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-gray-500/20">
                    <Phone size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t("phoneNumber2")}</h3>
                    <p className="text-sm text-gray-400">{t("notAvailable")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ساعات تماس پیشنهادی */}
          <div className="glass-card rounded-2xl p-5 mt-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {language === "en" 
                ? "Best Time to Call" 
                : language === "ar" 
                ? "أفضل وقت للاتصال" 
                : "بهترین زمان تماس"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold">8 AM</div>
                <div className="text-xs text-gray-400 mt-1">
                  {language === "en" ? "Opening" : language === "ar" ? "الافتتاح" : "بازگشایی"}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold">10 PM</div>
                <div className="text-xs text-gray-400 mt-1">
                  {language === "en" ? "Last Call" : language === "ar" ? "آخر مكالمة" : "آخرین تماس"}
                </div>
              </div>
            </div>
          </div>

          {/* دکمه بستن */}
          <Button
            onClick={() => setIsDrawerOpen(false)}
            className="w-full mt-6 py-6 glass-btn hover:glass-btn-hover"
          >
            {language === "en" ? "Close" : language === "ar" ? "إغلاق" : "بستن"}
          </Button>
        </div>

        
      </DrawerContent>
    </Drawer>
  );
}