"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { useMemo, useCallback } from "react";

// تایپ کلیدهای ترجمه برای امنیت تایپی
export type TranslationKey = keyof typeof translations.fa;

export function useTranslate() {
  const { language } = useLanguage();

  const dict = useMemo(() => {
    return translations[language] as Record<string, string>;
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      // اگر کلید پیدا نشد، خود کلید برگردانده میشه تا UI نشکنه
      return dict[key] ?? key;
    },
    [dict],
  );

  // نسخه تایپ‌سیف - فقط کلیدهای موجود رو قبول میکنه
  const tSafe = useCallback(
    (key: TranslationKey): string => {
      return dict[key] ?? key;
    },
    [dict],
  );

  return t;
}

// هوک جدید - با دسترسی به کل دیکشنری
export function useTranslations() {
  const { language } = useLanguage();
  const dict = useMemo(() => translations[language], [language]);
  return dict;
}
