import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { translations } from '@/translations/translation';
import { useLanguage } from '@/contexts/LanguageContext';

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
      const isOpenNow = currentHour >= 12 && currentHour < 23;
      
      setIsOpen(isOpenNow);
    };

    // بررسی اولیه
    checkRestaurantStatus();

    // بررسی هر دقیقه
    const interval = setInterval(checkRestaurantStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute left-0 top-12 flex items-center gap-2 px-4 py-2 rounded-tr-xl rounded-br-xl font-bold ${
      isOpen ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
    }`}>
      <Clock size={17} />
      <span className="font-medium pb-1">
        {isOpen ? t("open") : t("closed")}
      </span>
    </div>
  );
};

export default RestaurantStatus;