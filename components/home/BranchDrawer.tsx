"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  MapPin,
  Phone,
  Clock,
  Store,
  UtensilsCrossed,
  Info,
  PhoneCall,
  Navigation,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Branch } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";

interface BranchDrawerProps {
  branch: Branch;
  onClearBranch: () => void;
  t: (key: string) => string;
}

/*
  پیشنهاد محتوا برای BranchDrawer:
  1. هدر: لوگو + نام رستوران
  2. کارت شعبه فعلی: نام شعبه به 3 زبان + آدرس + تلفن + وضعیت باز/بسته + ساعت کاری
  3. اکشن‌های سریع: مسیریابی گوگل مپ + تماس
  4. منو ناوبری: منو / شعبه‌ها / درباره ما / تماس
  5. تنظیمات: ThemeToggle + LanguageSwitcher (اگر داری)
  6. فوتر: کپی‌رایت + نسخه
*/

const theme = {
  drawer:
    "bg-white text-slate-900 dark:bg-black dark:text-white border-r border-black/10 dark:border-white/10",
  card: "rounded-2xl border border-black/10 bg-accent dark:border-white/10 dark:bg-[#0a0908] backdrop-blur",
  muted: "text-slate-500 dark:text-slate-400",
  navItem:
    "group flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-medium transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-[0.98]",
  navIcon:
    "flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors",
};

export default function BranchDrawer({
  branch,
  onClearBranch,
  t,
}: BranchDrawerProps) {
  const { language } = useLanguage();
  const isRTL = language !== "en";


  const branchName =
    language === "en"
      ? (branch as any).name_en || branch.name_fa
      : language === "ar"
        ? (branch as any).name_ar || branch.name_fa
        : branch.name_fa;

  // اگر Branch شما این فیلدها رو داره، خودکار نشون میده - اگر نداره کارت‌ها مخفی میشن
  const branchAddress =
    (branch as any).address_fa || (branch as any).address || "";
  const branchPhone =
    (branch as any).phone_1 || (branch as any).phone_number || "";
  const isOpen = (branch as any).is_open ?? true; // اگر لاگیک وضعیت داری اینجا بذار

  const navLinks = [
    { href: "/menu", label: t("menu") || "منو", icon: UtensilsCrossed },
    { href: "/branches", label: t("branches") || "شعبه‌ها", icon: Store },
    { href: "/about", label: t("about") || "درباره ما", icon: Info },
  ];

  return (
    <Drawer direction={isRTL ? "right" : "left"}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="rounded-xl h-11 w-11 bg-white/10 border border-white/15 text-white backdrop-blur-md hover:bg-white/15 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 shadow-sm"
        >
          <Menu size={20} />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className={`${theme.drawer} h-full max-h-screen w-[88%] max-w-[360px] sm:w-[380px] ${
          isRTL ? "rounded-l-[28px]" : "rounded-r-[28px]"
        } p-0 [&>div:first-child]:hidden`} // مخفی کردن دسته پیش‌فرض Drawer
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* هدر */}
          <DrawerHeader className="space-y-0 p-0">

            <div className="relative px-5 pt-8 pb-5">
              <DrawerClose className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-9 w-9 ${theme.card} rounded-lg hover:bg-black/10 dark:hover:bg-white/15`}
                >
                  <X size={18} />
                </Button>
              </DrawerClose>

              <div className="flex flex-col items-center gap-4">
                <div className={`rounded-[1.5rem] border border-black/10 ${theme.card} bg-white p-3 shadow-sm dark:border-white/10`}>
                  <Image
                    src="/logo1.png"
                    alt="Watandar logo"
                    width={86}
                    height={28}
                    className="object-contain dark:opacity-90"
                    priority
                  />
                </div>
                <div className="text-center">
                  <h1
                    className={`text-2xl font-black ${language === "en" ? "font-[Balbek]" : "font-[BTitr]"} tracking-tight`}
                  >
                    {t("restaurantName") || "وطندار"}
                  </h1>
                  <p className={`mt-2 text-xs ${theme.muted}`}>
                    {t("badgeBranches")}
                  </p>
                  <div className="my-4 flex items-center justify-center gap-3">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300/70" />
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-xs font-bold text-emerald-700 backdrop-blur-md dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200`}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      {branchName}
                    </span>
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300/70" />
                  </div>
                </div>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 justify-between flex-col overflow-y-auto px-4 pb-4 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Separator className="border-black/5 dark:border-white/10" />
            {/* ناوبری */}
            <div className="space-y-2">
              <p className="px-2 text-[11px] font-bold tracking-widest opacity-40">
                {t("quickActions")}
              </p>
              <div dir={isRTL ? "rtl" : "ltr"} className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={theme.navItem}
                  >
                    <span className="flex items-center gap-3">
                      <span className={theme.navIcon}>
                        <link.icon size={18} />
                      </span>
                      {link.label}
                    </span>
                    {isRTL ? (
                      <ChevronLeft
                        size={16}
                        className="opacity-30 group-hover:opacity-100"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="opacity-30 group-hover:opacity-100"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* تنظیمات */}
          <div className={` py-3 flex items-center justify-center w-full`}>
            <ThemeToggle />
          </div>

          {/* تغییر شعبه */}
          <div className="space-y-2 pb-2">
            <p className="text-center text-[11px] opacity-40">
              {t("guideBranch")}
            </p>
          </div>

          {/* فوتر */}
          <div className="border-t border-black/5 dark:border-white/10 px-5 py-4">
            <p className="text-center text-[11px] opacity-40">
              © {new Date().getFullYear()} Vatandar Restaurant
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
