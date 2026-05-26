"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { useMemo } from "react";

export function useTranslate() {
  const { language } = useLanguage();

  const currentDict = useMemo(() => {
    return translations[language] as Record<string, string>;
  }, [language]);

  const t = useMemo(() => {
    return (key: string): string => {
      return currentDict[key] ?? key;
    };
  }, [currentDict]);

  return t;
}