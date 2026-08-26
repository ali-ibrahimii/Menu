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
import { useTranslate } from "@/hooks/useTranslate";
export default function HomeContent() {
  const { language } = useLanguage();
  const { clearSelectedBranch } = useBranch();
  const { selectedBranch, bgImages, isRedirecting } = useBranchData();
  const t = useTranslate();


  /**
   * فقط برای رنگ‌های حالت روشن/تاریک استفاده شده؛
   * ساختار، فاصله‌ها، سایزها و layout تغییر نکرده‌اند.
   */
  const theme = {
    page: "bg-white text-slate-950 dark:bg-black dark:text-white transition-colors duration-500",
    panel:
      "border border-black/10 bg-white/75 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30",
    mutedText: "text-white/80 dark:text-white/80",
    strongText: "text-slate-600 dark:text-white",
    iconBox:
      "border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    accentButton:
      "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950",
  };

  if (isRedirecting) {
    return (
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className={`min-h-screen ${theme.page} flex items-center justify-center flex-col`}
      >
        <div className="flex justify-center items-center flex-col">
          <Loader />
          <p className={`mt-3 text-sm font-medium ${theme.strongText}`}>
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedBranch) {
    return null;
  }

  const branchName =
    language === "en"
      ? selectedBranch.name_en
      : language === "ar"
        ? selectedBranch.name_ar
        : selectedBranch.name_fa;

  return (
    <main
      dir={language === "en" ? "ltr" : "rtl"}
      className={`relative h-screen overflow-hidden ${theme.mutedText}`}
    >
      <BackgroundCarousel
        images={bgImages}
        branchName={branchName}
        isActive={!isRedirecting}
      />

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

      <MainContent branch={selectedBranch} t={t} />
    </main>
  );
}