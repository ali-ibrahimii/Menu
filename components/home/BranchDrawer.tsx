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
import { Branch } from "@/types";
import { Badge } from "@/components/ui/badge";

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
    "bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white border-r border-black/10 dark:border-white/10",
  card: "rounded-2xl border border-black/10 bg-white/80 dark:border-white/10 dark:bg-slate-900/60 backdrop-blur",
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
    (branch as any).phone || (branch as any).phone_number || "";
  const isOpen = (branch as any).is_open ?? true; // اگر لاگیک وضعیت داری اینجا بذار

  const navLinks = [
    { href: "/menu", label: t("menu") || "منو", icon: UtensilsCrossed },
    { href: "/branches", label: t("branches") || "شعبه‌ها", icon: Store },
    { href: "/about", label: t("about") || "درباره ما", icon: Info },
    { href: "/contact", label: t("contact") || "تماس با ما", icon: PhoneCall },
  ];

  return (
    <Drawer direction={isRTL ? "right" : "left"}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="rounded-full h-11 w-11 bg-white/10 border border-white/15 text-white backdrop-blur-md hover:bg-white/15 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 shadow-sm"
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
            <DrawerTitle className="sr-only">Branch Menu</DrawerTitle>
            <DrawerDescription className="sr-only">
              Navigation and branch info
            </DrawerDescription>

            <div className="relative px-5 pt-8 pb-5">
              <DrawerClose className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
                >
                  <X size={18} />
                </Button>
              </DrawerClose>

              <div className="flex flex-col items-center gap-4">
                <div className="rounded-[1.5rem] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <Image
                    src="/logo1.png"
                    alt="Watandar logo"
                    width={96}
                    height={28}
                    className="object-contain dark:opacity-90"
                    priority
                  />
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-black tracking-tight">
                    {t("restaurantName") || "وطندار"}
                  </h1>
                  <p className={`mt-1 text-xs ${theme.muted}`}>
                    اصالت طعم افغانی
                  </p>
                </div>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* کارت شعبه فعلی */}
            <div className={`${theme.card} p-4 space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Store size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-widest opacity-50">
                      شعبه فعلی
                    </p>
                    <p className="text-[15px] font-bold leading-5">
                      {branchName}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`rounded-full px-2.5 py-1 text-[10px] border ${
                    isOpen
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  }`}
                >
                  {isOpen ? "باز" : "بسته"}
                </Badge>
              </div>
            </div>

            {/* ناوبری */}
            <div className="space-y-2">
              <p className="px-2 text-[11px] font-bold tracking-widest opacity-40">
                دسترسی سریع
              </p>
              <div className="space-y-1">
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

            {/* تنظیمات */}
            <div
              className={` p-1 flex items-center justify-center w-full`}
            >
              <ThemeToggle />
            </div>

            {/* تغییر شعبه */}
            <div className="space-y-2">
              <p className="text-center text-[11px] opacity-40">
                برای دیدن منوی شعبه دیگر، شعبه را تغییر دهید
              </p>
            </div>
          </div>

          {/* فوتر */}
          <div className="border-t border-black/5 dark:border-white/10 px-5 py-4">
            <p className="text-center text-[11px] opacity-40">
              © {new Date().getFullYear()} Watandar Restaurant • v1.3
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
