"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CheckRestaurantStatus from "@/components/CheckRestaurantStatus";
import type { Branch } from "@/types";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useTranslate } from "@/hooks/useTranslate";
import { supabase } from "@/lib/supabaseClient";

const theme = {
  page: "bg-white text-slate-950 dark:bg-black dark:text-white transition-colors duration-500",
  panel:
    "border border-black/10 bg-white/75 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30",
  mutedText: "text-slate-600 dark:text-white/60",
  strongText: "text-slate-950 dark:text-white",
};

const BRANCH_FOLDER_MAP: Record<string, string> = {
  main: "first-branch",
  "main-branch": "first-branch",
  "first-branch": "first-branch",
  branch2: "second-branch",
  "second-branch": "second-branch",
  shop: "shop",
  "vatandar-shop": "shop",
  gallery: "gallery",
  default: "first-branch",
};

const BUCKET = "images";
const DEFAULT_IMAGES = ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"];

function getFolderForBranch(slug: string) {
  if (!slug) return "first-branch";
  const lower = slug.toLowerCase().trim();
  return BRANCH_FOLDER_MAP[lower] || "first-branch";
}

async function fetchImagesFromFolder(folder: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });
    if (error || !data || data.length === 0) {
      // Fallback مستقیم - چون 1.jpg تا 4.jpg داری
      const direct = ["1.jpg", "2.jpg", "3.jpg", "4.jpg"].map((name) => {
        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${folder}/${name}`);
        return data.publicUrl;
      });
      return direct;
    }
    const imageFiles = data.filter(
      (f: any) => f.id && /\.(jpe?g|png|webp)$/i.test(f.name),
    );
    if (imageFiles.length === 0) return DEFAULT_IMAGES;
    return imageFiles.map((file: any) => {
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${folder}/${file.name}`);
      return data.publicUrl;
    });
  } catch {
    return DEFAULT_IMAGES;
  }
}

const getBranchName = (branch: Branch, language: string) => {
  if (language === "en") return (branch as any).name_en || branch.name_fa;
  if (language === "ar") return (branch as any).name_ar || branch.name_fa;
  return branch.name_fa;
};

const getBranchAddress = (branch: Branch, language: string) => {
  if (language === "en") return (branch as any).address_en || branch.address_fa;
  if (language === "fa") return branch.address_fa;
  return (branch as any).address_ar || branch.address_fa;
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
    const displayImages = images.length > 0 ? images : DEFAULT_IMAGES;

    return (
      <article
        onClick={handleSelect}
        style={{
          animation: `branchCardEnter 700ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms both`,
        }}
        className="group relative h-[460px] w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 outline-none transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300/40 hover:shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
        tabIndex={0}
        role="button"
        aria-label={name}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSelect();
        }}
      >
        <div className="absolute inset-0">
          <Image
            src={displayImages[currentIndex] || displayImages[0]}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(52,211,153,0.22),transparent_38%)] opacity-0 transition duration-500 group-hover:opacity-100" />
        </div>

        <div className="pointer-events-none absolute -inset-24 bg-[conic-gradient(from_180deg_at_50%_50%,transparent,rgba(52,211,153,.22),transparent_35%)] opacity-0 blur-2xl transition duration-700 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur-md">
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
            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] backdrop-blur-xl">
              <CheckRestaurantStatus />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="line-clamp-2 text-sm font-medium leading-7 text-white/85">
                {address}
              </p>
            </div>

            {(branch as any).phone_1 && (
              <a
                href={`tel:${(branch as any).phone_1}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 rounded-2xl transition hover:bg-white/5"
                dir="ltr"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-white/85 hover:text-emerald-300">
                  {(branch as any).phone_1}
                </span>
              </a>
            )}

            {/* دکمه انتخاب شعبه - دقیقا زیر آدرس */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-emerald-400/40 active:translate-y-0"
            >
              <Check className="h-4 w-4" />
              <span>
                {language === "fa"
                  ? "انتخاب شعبه"
                  : language === "ar"
                    ? "اختيار الفرع"
                    : "Select Branch"}
              </span>
              {isEnglish ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
            </button>

            {displayImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageChange(branch.id, i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-emerald-300 shadow-lg" : "w-2 bg-white/35 hover:bg-white/70"}`}
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
  const [branchImages, setBranchImages] = useState<Record<string, string[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const t = useTranslate();
  const router = useRouter();
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>(
    {},
  );

  const isEnglish = language === "en";

  const handleSelect = useCallback(
    (branch: Branch) => {
      setSelectedBranch(branch);
      router.push("/");
    },
    [setSelectedBranch, router],
  );

  const handleImageChange = useCallback(
    (branchId: string | number, imageIndex: number) => {
      setImageIndexes((prev) => ({ ...prev, [String(branchId)]: imageIndex }));
    },
    [],
  );

  useEffect(() => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};
    branches.forEach((branch) => {
      const imgs = branchImages[String(branch.id)] || [];
      if (imgs.length <= 1) return;
      intervalsRef.current[String(branch.id)] = setInterval(() => {
        setImageIndexes((prev) => ({
          ...prev,
          [String(branch.id)]:
            ((prev[String(branch.id)] || 0) + 1) % imgs.length,
        }));
      }, 4500);
    });
    return () => Object.values(intervalsRef.current).forEach(clearInterval);
  }, [branches, branchImages]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("branches")
          .select("*")
          .order("created_at");
        const list = (data as Branch[]) || [];
        if (!mounted) return;
        setBranches(list);

        const map: Record<string, string[]> = {};
        const cache: Record<string, string[]> = {};
        for (const b of list) {
          const folder = getFolderForBranch((b as any).slug || "");
          if (!cache[folder])
            cache[folder] = await fetchImagesFromFolder(folder);
          map[String(b.id)] =
            cache[folder].length > 0 ? cache[folder] : DEFAULT_IMAGES;
        }
        if (mounted) setBranchImages(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
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
        <Loader />
        <p className={`mt-3 text-sm ${theme.mutedText}`}>{t("loading")}</p>
      </div>
    );
  }

  return (
    <main
      dir={isEnglish ? "ltr" : "rtl"}
      className={`relative min-h-screen overflow-hidden ${theme.page}`}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_34%),linear-gradient(180deg,#fff8ed_0%,#f8ead4_48%,#fff8ed_100%)] dark:hidden" />
        <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-300/25 blur-3xl dark:hidden" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)] dark:block" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* هدر با دکمه زبان و برگشت که از زبان پیروی میکنه */}
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>

          <Link
            href="/"
            className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/75 backdrop-blur-xl transition hover:border-emerald-500/30 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/10 ${isEnglish ? "" : ""}`}
            aria-label="Back"
          >
            {isEnglish ? (
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-0.5" />
            )}
          </Link>
        </header>

        <div className="mx-auto mb-7 max-w-3xl text-center">
          <div className={`mb-5 inline-flex rounded-3xl p-3 ${theme.panel}`}>
            <Image
              src="/logo1.png"
              alt="logo"
              width={135}
              height={38}
              className="object-contain"
              priority
            />
          </div>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300/70" />
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-200">
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
            className={`font-[BTitr] text-4xl font-black sm:text-5xl lg:text-6xl ${theme.strongText}`}
          >
            {t("restaurantName")}
          </h1>
          <p
            className={`mx-auto mt-5 max-w-xl text-base font-medium leading-8 ${theme.mutedText}`}
          >
            {t("selectBranchReq")}
          </p>
        </div>

        {branches.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 pb-20 lg:grid-cols-2 xl:gap-8">
            {branches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                language={language}
                onSelect={handleSelect}
                currentIndex={imageIndexes[String(branch.id)] || 0}
                images={branchImages[String(branch.id)] || DEFAULT_IMAGES}
                index={index}
                onImageChange={handleImageChange}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg py-24 text-center">
            <Building2 className={`mx-auto h-12 w-12 ${theme.mutedText}`} />
            <h3 className={`mt-4 text-2xl font-black ${theme.strongText}`}>
              {t("noActiveBranch")}
            </h3>
            <p className={`mt-2 text-sm ${theme.mutedText}`}>
              {t("pleaseTryAgain")}
            </p>
          </div>
        )}
      </section>

      <style>{`
        @keyframes branchCardEnter {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </main>
  );
}
