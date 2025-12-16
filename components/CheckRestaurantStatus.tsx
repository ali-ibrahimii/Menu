import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "./ui/badge";

const RestaurantStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  useEffect(() => {
    const checkRestaurantStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // رستوران از ۱۲ روز تا ۱۱ شب باز است
      const isOpenNow = currentHour >= 1 && currentHour < 23;

      setIsOpen(isOpenNow);
    };

    // بررسی اولیه
    checkRestaurantStatus();

    // بررسی هر دقیقه
    const interval = setInterval(checkRestaurantStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      // variant={isOpen ? "default" : "destructive"}
      className={`flex items-center gap-1 ${isOpen ? "text-gray-300" : "text-red-600 "} font-semibold pb-1 px-4`}
    >
      {isOpen ? (
        <div className="w-2 h-2 bg-green-400 mt-1 rounded-full animate-pulse"></div>
      ) : ""}

      {isOpen ? t("open") : t("closed")}
    </div>
  );
};

export default RestaurantStatus;
