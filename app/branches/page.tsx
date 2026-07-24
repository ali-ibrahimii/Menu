"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  MapPin,
  Phone,
  Check,
  Building2,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Navigation,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CheckRestaurantStatus from "@/components/CheckRestaurantStatus";
import { Branch } from "@/types/index";
import Loader from "@/components/Loader";
import Link from "next/link";

/**
 * فقط برای رنگ‌های حالت روشن/تاریک استفاده شده؛
 * ساختار، فاصله‌ها، سایزها و layout تغییر نکرده‌اند.
 */
const theme = {
  page:
    "bg-[#fff8ed] text-slate-950 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  panel:
    "border border-black/10 bg-white/75 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30",
  mutedText: "text-slate-600 dark:text-white/60",
  strongText: "text-slate-950 dark:text-white",
  iconBox:
    "border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-300",
  accentButton:
    "bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950",
};


const branchImageGalleries: Record<string, string[]> = {
  main: [
    "/branch1/1.jpg",
    "/branch1/2.jpg",
    "/branch1/3.jpg",
    "/branch1/4.jpg",
  ],
  branch2: [
    "/branch2/1.jpg",
    "/branch2/2.jpg",
    "/branch2/3.jpg",
    "/branch2/4.jpg",
    "/branch2/5.jpg",
    "/branch2/6.jpg",
    "/branch2/7.jpg",
  ],
  default: [
    "/bg.jpg",
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/sonati-bg.jpg",
    "/sonati1-bg.jpg",
  ],
};

const getImages = (slug: string) =>
  branchImageGalleries[slug] || branchImageGalleries.default;

const getBranchName = (branch: Branch, language: string) => {
  if (language === "en") return branch.name_en;
  if (language === "fa") return branch.name_fa;
  return branch.name_ar;
};

const getBranchAddress = (branch: Branch, language: string) => {
  if (language === "en") return branch.address_en;
  if (language === "fa") return branch.address_fa;
  return branch.address_ar;
};

type BranchCardProps = {
  branch: Branch;
  language: string;
  onSelect: (b: Branch) => void;
  currentIndex: number;
  images: string[];
  index: number;
  onImageChange: (branchId: string | number, imageIndex: number) => void;
};

const BranchCard = React.memo(
  ({
    branch,
    language,
    onSelect,
    currentIndex,
    images,
    index,
    onImageChange,
  }: BranchCardProps) => {
    const handleSelect = () => onSelect(branch);
    const name = getBranchName(branch, language);
    const address = getBranchAddress(branch, language);
    const isEnglish = language === "en";

    return (
      <article
        onClick={handleSelect}
        style={{
          animation: `branchCardEnter 700ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms both`,
        }}
        className="group relative h-[430px] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 outline-none transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300/40 hover:shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
        tabIndex={0}
        role="button"
        aria-label={name}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSelect();
        }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={images[currentIndex] || images[0]}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(52,211,153,0.22),transparent_38%)] opacity-0 transition duration-500 group-hover:opacity-100" />
        </div>

        {/* Decorative border glow */}
        {/* <div className="pointer-events-none absolute inset-px rounded-[calc(2rem-1px)] ring-1 ring-inset ring-white/10" /> */}
        <div className="pointer-events-none absolute -inset-24 bg-[conic-gradient(from_180deg_at_50%_50%,transparent,rgba(52,211,153,.22),transparent_35%)] opacity-0 blur-2xl transition duration-700 group-hover:opacity-100" />

        {/* Top content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {language === "fa"
                    ? "شعبه فعال"
                    : language === "ar"
                      ? "فرع نشط"
                      : "Active Branch"}
                </span>
              </div>
              <h3 className="font-[BTitr] text-3xl font-black leading-tight text-white drop-shadow-lg md:text-4xl">
                {name}
              </h3>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] shadow-xl shadow-black/20 backdrop-blur-xl">
              <CheckRestaurantStatus />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="line-clamp-2 text-sm font-medium leading-7 text-white/85">
                {address}
              </p>
            </div>

            {branch.phone_1 && (
              <a
                href={`tel:${branch.phone_1}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 rounded-2xl transition hover:bg-white/5"
                dir="rtl"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-white/85 transition hover:text-emerald-300">
                  {branch.phone_1}
                </span>
              </a>
            )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-emerald-400/40 active:translate-y-0"
          >
            <Check className="h-4 w-4" />
            <span>
              {translations[language as keyof typeof translations]
                ?.selectBranch || "انتخاب شعبه"}
            </span>
            {isEnglish ? (
              <ArrowRight className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
          </button>
          {/* Image dots */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageChange(branch.id, i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-8 bg-emerald-300 shadow-lg shadow-emerald-400/40"
                      : "w-2 bg-white/35 hover:bg-white/70"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </article>
    );
  },
);

BranchCard.displayName = "BranchCard";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>(
    {},
  );

  const isEnglish = language === "en";

  const t = (key: string) =>
    (
      translations[language as keyof typeof translations] as Record<
        string,
        string
      >
    )?.[key] || key;

  const handleSelect = useCallback(
    (branch: Branch) => {
      setSelectedBranch(branch);
      router.push("/");
    },
    [setSelectedBranch, router],
  );

  const handleImageChange = useCallback(
    (branchId: string | number, imageIndex: number) => {
      setImageIndexes((prev) => ({
        ...prev,
        [String(branchId)]: imageIndex,
      }));
    },
    [],
  );

  // Image carousel per branch
  useEffect(() => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};

    branches.forEach((branch) => {
      const images = getImages(branch.slug);
      if (images.length <= 1) return;

      intervalsRef.current[String(branch.id)] = setInterval(() => {
        setImageIndexes((prev) => ({
          ...prev,
          [String(branch.id)]:
            ((prev[String(branch.id)] || 0) + 1) % images.length,
        }));
      }, 4500);
    });

    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, [branches]);

  // Fetch active branches
  useEffect(() => {
    let mounted = true;

    supabase
      .from("branches")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (mounted) {
          setBranches(data || []);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`min-h-screen ${theme.page} flex items-center justify-center flex-col`}
      >
        <div className="flex justify-center items-center flex-col">
          <Loader />
          <p className={`mt-3 text-sm font-medium ${theme.mutedText}`}>
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      dir={isEnglish ? "ltr" : "rtl"}
      className={`relative min-h-screen overflow-hidden ${theme.page}`}
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* Light background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_34%),linear-gradient(180deg,#fff8ed_0%,#f8ead4_48%,#fff8ed_100%)] dark:hidden" />
        <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-300/25 blur-3xl dark:hidden" />
        <div className="absolute bottom-0 right-0 h-[440px] w-[440px] rounded-full bg-amber-300/25 blur-3xl dark:hidden" />

        {/* Dark background - همان ظاهر قبلی تاریک */}
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)] dark:block" />
        <div className="absolute -top-32 left-1/2 hidden h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:block" />
        <div className="absolute bottom-0 right-0 hidden h-[440px] w-[440px] rounded-full bg-cyan-400/10 blur-3xl dark:block" />

        {/* Shared pattern */}
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(15,23,42,.32)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.32)_1px,transparent_1px)] [background-size:56px_56px] dark:opacity-[0.05] dark:[background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#fff8ed] dark:via-slate-950/20 dark:to-slate-950" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between gap-4 animate-fade-in">
          <LanguageSwitcher />

          <Link
            href="/"
            className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 hover:border-emerald-500/30 hover:bg-white/90 dark:hover:border-emerald-300/30 dark:hover:bg-white/10 ${theme.panel}`}
            aria-label="Back"
          >
            {isEnglish ? (
              <ChevronLeft className="h-5 w-5 rotate-180 transition group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-0.5" />
            )}
          </Link>
        </header>

        {/* Hero */}
        <div className="mx-auto mb-7 max-w-3xl text-center animate-fade-in-delayed">
          <div
            className={`mb-5 inline-flex rounded-2xl p-4 transition duration-500 hover:-translate-y-1 hover:border-emerald-500/25 dark:hover:border-emerald-300/25 ${theme.panel}`}
          >
            <Image
              src="/logo1.png"
              alt="logo"
              width={175}
              height={48}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300/70" />
            <span className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 backdrop-blur-md dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200`}>
              <Navigation className="h-3.5 w-3.5" />
              {language === "fa"
                ? "انتخاب شعبه"
                : language === "ar"
                  ? "اختيار الفرع"
                  : "Choose Branch"}
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300/70" />
          </div>

          <h1
            className={`font-[BTitr] text-4xl font-black leading-tight tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl ${theme.strongText}`}
          >
            {t("restaurantName")}
          </h1>

          <p
            className={`mx-auto mt-5 max-w-xl text-base font-medium leading-8 sm:text-lg ${theme.mutedText}`}
          >
            {t("selectBranchReq")}
          </p>
        </div>

        {/* Branches */}
        {branches.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 pb-20 lg:grid-cols-2 xl:gap-8">
            {branches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                language={language}
                onSelect={handleSelect}
                currentIndex={imageIndexes[String(branch.id)] || 0}
                images={getImages(branch.slug)}
                index={index}
                onImageChange={handleImageChange}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg animate-fade-in-delayed py-24 text-center">
            <div
              className={`mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[2rem] ${theme.panel}`}
            >
              <Building2 className={`h-12 w-12 ${theme.mutedText}`} />
            </div>
            <h3
              className={`font-[BTitr] text-2xl font-black ${theme.strongText}`}
            >
              {t("noActiveBranch")}
            </h3>
            <p className={`mt-3 text-sm font-medium ${theme.mutedText}`}>
              {t("pleaseTryAgain")}
            </p>
          </div>
        )}
      </section>

      <style>{`
        @keyframes branchCardEnter {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 650ms ease both;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 650ms ease 120ms both;
        }
      `}</style>
    </main>
  );
}
