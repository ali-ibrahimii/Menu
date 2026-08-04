"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabaseClient";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Clock,
  UtensilsCrossed,
  Users,
  Award,
  X,
  Navigation,
  PhoneCall,
  Building2,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import type { Branch } from "@/types";

const BUCKET = "images";
const GALLERY_FOLDER = "gallery";
const AVATAR_FOLDER = "avatar";
const DEFAULT_GALLERY = ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"];

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-[1.75rem] border border-black/[0.06] bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70",
  muted: "text-slate-600 dark:text-slate-400",
  softCard:
    "rounded-2xl border border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]",
};

async function fetchGalleryFromSupabase(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(GALLERY_FOLDER, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });
    if (error) throw error;
    if (!data || data.length === 0) return [];
    const images = data.filter(
      (f: any) => f.id && /\.(jpe?g|png|webp)$/i.test(f.name),
    );
    if (images.length === 0) return [];
    return images.map((file: any) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${GALLERY_FOLDER}/${file.name}`);
      return urlData.publicUrl;
    });
  } catch {
    // fallback مستقیم
    return ["1.jpg", "2.jpg", "3.jpg", "4.jpg"].map((n) => {
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${GALLERY_FOLDER}/${n}`);
      return data.publicUrl;
    });
  }
}

async function fetchAvatarFromSupabase(): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from(BUCKET)
      .list(AVATAR_FOLDER, { limit: 1 });
    if (data && data.length > 0 && data[0].id) {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${AVATAR_FOLDER}/${data[0].name}`);
      return urlData.publicUrl;
    }
    // اگر لیست نشد، مستقیم avatar.jpg رو امتحان کن
    const { data: direct } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${AVATAR_FOLDER}/avatar.jpg`);
    return direct.publicUrl;
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const { language } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>(DEFAULT_GALLERY);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [managerAvatar, setManagerAvatar] = useState<string | null>(null);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const [loadingManager, setLoadingManager] = useState(true);
  const t = useTranslate();
  const isRTL = language !== "en";

  const storyText =
    language === "fa"
      ? "رستوران وطندار با بیش از یک دهه تجربه در طبخ اصیل‌ترین غذاهای افغانی، محلی برای دور هم جمع شدن خانواده‌هاست."
      : language === "ar"
        ? "مطعم وطندار مع أكثر من عقد من الخبرة في طهي أشهى الأطباق الأفغانية الأصيلة، هو مكان لتجمع العائلات."
        : "Watandar Restaurant, with over a decade of experience cooking authentic Afghan dishes, is a place for families to gather.";

  useEffect(() => {
    const load = async () => {
      // شعبه‌ها
      try {
        const { data } = await supabase
          .from("branches")
          .select("*")
          .order("created_at");
        setBranches((data as any) || []);
      } catch {}
      setLoadingBranches(false);

      // گالری
      setLoadingGallery(true);
      const gallery = await fetchGalleryFromSupabase();
      if (gallery.length > 0) {
        // فقط اگر URL واقعی سوپابیس باشد جایگزین کن
        const hasValid = gallery.some(
          (u) => u.includes("supabase") || u.startsWith("http"),
        );
        if (hasValid) setGalleryImages(gallery);
      }
      setLoadingGallery(false);

      // آواتار مدیریت
      const avatar = await fetchAvatarFromSupabase();
      if (avatar) setManagerAvatar(avatar);

      // اطلاعات مدیر
      setLoadingManager(true);
      try {
        const { data, error } = await supabase
          .from("public_info")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data) setManagerInfo(data);
      } catch (e) {
        console.error("public_info error:", e);
      } finally {
        setLoadingManager(false);
      }
    };
    load();
  }, []);

  const stats = [
    {
      icon: Award,
      value: "10+",
      label: language === "fa" ? "سال تجربه" : "Years",
      sub: "از ۲۰۱۴",
    },
    {
      icon: Building2,
      value: "2",
      label: language === "fa" ? "شعبه فعال" : "Branches",
      sub: "در مشهد",
    },
    {
      icon: UtensilsCrossed,
      value: "80+",
      label: language === "fa" ? "غذای اصیل" : "Dishes",
      sub: "افغانی و ایرانی",
    },
    {
      icon: Users,
      value: "300K+",
      label: language === "fa" ? "مشتری راضی" : "Happy",
      sub: "خانواده وطندار",
    },
  ];

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#fff8ed]/80 dark:bg-slate-950/80 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 p-1">
            <LanguageSwitcher />
          </div>
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white dark:bg-slate-900 dark:border-white/10 hover:bg-black/5 transition-colors"
          >
            {isRTL ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronLeft className="rotate-180" size={20} />
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-8">
        <div className="flex flex-col items-center gap-5">
          <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <Image
              src="/logo1.png"
              width={110}
              height={140}
              alt={t("restaurantName")}
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {t("restaurantName")}
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/15">
              <Sparkles size={14} /> اصالت طعم افغانی
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className={`${theme.card} p-6 sm:p-8 space-y-4`}>
            <h2 className="flex items-center gap-2 text-xl font-black">
              {t("aboutUs")}
            </h2>
            <p className="leading-8 text-[15px] text-slate-700 dark:text-slate-300">
              {storyText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((st, i) => (
              <div
                key={i}
                className={`${theme.card} p-5 flex flex-col justify-center gap-2`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                  <st.icon size={20} className="opacity-70" />
                </div>
                <p className="text-2xl font-black">{st.value}</p>
                <p className="text-sm font-bold">{st.label}</p>
                <p className={`text-xs ${theme.muted}`}>{st.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* گالری */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              {language === "fa"
                ? "گالری تصاویر"
                : language === "ar"
                  ? "معرض الصور"
                  : "Image Gallery"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.map((item, idx) => (
              <button
                key={`${item}-${idx}`}
                onClick={() => setSelectedImage(item)}
                className="group relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-900"
              >
                <img
                  src={item}
                  alt={`gallery-${idx}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                    {language === "fa"
                      ? "مشاهده تصویر"
                      : language === "ar"
                        ? "عرض الصورة"
                        : "View Image"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* شعبه‌ها */}
        <div className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-2">
            {language === "fa"
              ? "شعبه‌های ما"
              : language === "ar"
                ? "فروعنا"
                : "Our Branches"}
          </h2>
          {loadingBranches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`${theme.card} p-6 h-40 animate-pulse`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => {
                const name = (branch as any).name_fa || branch.name_fa;
                return (
                  <div
                    key={branch.id}
                    className={`${theme.card} p-5 space-y-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{name}</p>
                        <p className={`text-xs ${theme.muted}`}>
                          {(branch as any).is_active ? "فعال" : "غیرفعال"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-[13px] pt-2 border-t border-black/5 dark:border-white/10">
                      <div className="flex gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="line-clamp-2">
                          {(branch as any).address_fa || "به زودی"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Phone size={16} className="text-slate-400" />
                        <span dir="ltr">
                          {(branch as any).phone_1 || "به زودی"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span>{language === "fa" ? "هر روز 8:00 - 23:00" : language === "ar" ? "كل يوم 8:00 - 23:00" : "Every day 8:00 - 23:00"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <a
                        href={`tel:${(branch as any).phone_1 || ""}`}
                        className="h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center gap-1.5 text-sm font-bold"
                      >
                        <Phone size={16} /> {language === "fa" ? "تماس" : language === "ar" ? "اتصال" : "Call"}
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((branch as any).address_fa || branch.name_fa)}`}
                        target="_blank"
                        className="h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5 text-sm font-bold"
                      >
                        <Navigation size={16} /> {language === "fa" ? "مسیر" : language === "ar" ? "الطريق" : "Directions"}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* کارت مدیریت - با اطلاعات public_info + آواتار از avatar */}
        <div className={`${theme.card} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
              {managerAvatar ? (
                <img
                  src={managerAvatar}
                  alt="مدیر"
                  className="h-full w-full object-cover"
                />
              ) : managerInfo?.manager_name ? (
                managerInfo.manager_name.charAt(0)
              ) : (
                "W"
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-black">
                  {loadingManager
                    ? "در حال بارگذاری..."
                    : managerInfo?.manager_name || "مدیریت رستوران وطندار"}
                </h3>
                <p className={`text-sm ${theme.muted} mt-1`}>
                  {managerInfo?.manager_description ||
                    "برای پیشنهادات با مدیریت در ارتباط باشید"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`${theme.softCard} p-3.5 flex items-center gap-2.5`}
                >
                  <Phone size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-[11px] opacity-50 font-bold">
                      {language === "fa"
                        ? "شماره تماس"
                        : language === "ar"
                          ? "رقم الاتصال"
                          : "Contact Number"}
                    </p>
                    <p className="text-sm font-bold" dir="ltr">
                      {managerInfo?.manager_number || "09012235586"}
                    </p>
                  </div>
                </div>
                <div
                  className={`${theme.softCard} p-3.5 flex items-center gap-2.5`}
                >
                  <MapPin size={18} className="text-red-500" />
                  <div>
                    {language === "fa" ? (
                      <p className="text-[11px] opacity-50 font-bold">
                        آدرس رستوران
                      </p>
                    ) : language === "ar" ? (
                      <p className="text-[11px] opacity-50 font-bold">
                        عنوان المطعم
                      </p>
                    ) : (
                      <p className="text-[11px] opacity-50 font-bold">
                        Restaurant Address
                      </p>
                    )}
                    <p className="text-xs font-bold truncate">
                      {managerInfo?.manager_description || "متن تست"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={`tel:${managerInfo?.manager_number || ""}`}
                  className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 h-10 flex items-center gap-2 text-sm font-bold"
                >
                  <Phone size={16} /> {language === "fa" ? "تماس" : language === "ar" ? "اتصال" : "Call"}
                </a>
                <a
                  href={`https://wa.me/${managerInfo?.manager_number || ""}`}
                  target="_blank"
                  className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-5 h-10 flex items-center gap-2 text-sm font-bold"
                >
                  {language === "fa" ? "واتساپ" : language === "ar" ? "واتساب" : "WhatsApp"}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-l from-emerald-600 to-teal-600 p-8 text-white text-center">
          <h3 className="text-2xl font-black">
            {language === "fa"
              ? "آماده سفارش هستید؟"
              : language === "ar"
                ? "هل أنت مستعد لطلب الطعام؟"
                : "Ready to Order?"}
          </h3>
          <Link
            href="/menu"
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-emerald-700"
          >
            {language === "fa" ? "مشاهده منو" : language === "ar" ? "عرض القائمة" : "View Menu"}
          </Link>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={selectedImage}
            alt="preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
