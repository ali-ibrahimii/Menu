"use client";

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";

/**
 * این هوک یک تابع t(key) برمی‌گرداند
 * که همیشه زبان فعلی را استفاده می‌کند.
 */
export function useTranslate() {
  const { language } = useLanguage();

  // ترجمه‌های زبان فعلی
  const currentDict = useMemo(() => {
    return translations[language] || translations["en"];
  }, [language]);

  // تابع ترجمه
  const t = useMemo(() => {
    return (key: string): string => {
      return currentDict[key] || key;
    };
  }, [currentDict]);

  return t;
}