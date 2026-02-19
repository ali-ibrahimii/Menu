"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { translations } from "@/translations/translation";
import Loader from "@/components/Loader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Header from "@/components/layout/Header";
import BackgroundCarousel from "@/components/home/BackgroundCarousel";
import BranchDrawer from "@/components/home/BranchDrawer";
import MainContent from "@/components/home/MainContent";
import { useBranchData } from "@/components/hooks/useBranchData";
import { useCallback } from "react";

export default function HomeContent() {
  const { language } = useLanguage();
  const { clearSelectedBranch } = useBranch();
  const { selectedBranch, bgImages, isRedirecting } = useBranchData();

  const t = useCallback((key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  }, [language]);

  // اگر در حال ریدایرکت هستیم، لودر نمایش بده
  if (isRedirecting) {
    return (
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="min-h-screen flex items-center justify-center"
      >
        <Loader />
      </div>
    );
  }

  // اگر شعبه انتخاب نشده، هیچی نمایش نده (ریدایرکت در useBranchData انجام شده)
  if (!selectedBranch) {
    return null;
  }

  return (
    <main
      dir={language === "en" ? "ltr" : "rtl"}
      className="relative min-h-screen overflow-hidden text-white"
    >
      {/* پس‌زمینه متحرک */}
      <BackgroundCarousel
        images={bgImages}
        branchName={selectedBranch.name_fa}
        isActive={!isRedirecting}
      />

      {/* هدر با منو و تغییر زبان */}
      <Header
        leftElement={
          <BranchDrawer
            branch={selectedBranch}
            onClearBranch={clearSelectedBranch}
            t={t}
          />
        }
        rightElement={<LanguageSwitcher />}
      />

      {/* محتوای اصلی */}
      <MainContent branch={selectedBranch} t={t} />
    </main>
  );
}