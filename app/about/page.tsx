"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  Heart,
  X,
  Navigation,
  PhoneCall,
  Building2,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@/hooks/useTranslate";
import type { Branch } from "@/types";

const BUCKET = "images";
const GALLERY_FOLDER = "gallery";
const AVATAR_FOLDER = "avatar";
const DEFAULT_GALLERY = [
  "/bg.jpg",
  "/bg1.jpg",
  "/bg2.jpg",
  "/bg3.jpg",
  "/bg.jpg",
  "/bg1.jpg",
];

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
    // fallback اگر policy نبود - مستقیم
    return ["1.jpg", "2.jpg", "3.jpg", "4.jpg"].map((n) => {
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${GALLERY_FOLDER}/${n}`);
      return data.publicUrl;
    });
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
      ? "رستوران وطندار با بیش از یک دهه تجربه در طبخ اصیل‌ترین غذاهای افغانی، محلی برای دور هم جمع شدن خانواده‌هاست. ما با استفاده از بهترین مواد اولیه، ادویه‌های اصل و دستور پخت مادربزرگ‌ها، طعمی را خلق می‌کنیم که شما را به خانه می‌برد. از قابلی پلو افسانه‌ای تا منتو و بولانی داغ، هر لقمه داستانی از فرهنگ ماست."
      : language === "ar"
        ? "مطعم وطندار مع أكثر من عقد من الخبرة في طهي أشهى الأطباق الأفغانية الأصيلة، هو مكان لتجمع العائلات."
        : "Watandar Restaurant, with over a decade of experience cooking authentic Afghan dishes, is a place for families to gather.";

  useEffect(() => {
    const load = async () => {
      // شعبه‌ها
      const { data: branchesData } = await supabase
        .from("branches")
        .select("*")
        .order("created_at");
      setBranches((branchesData as any) || []);

      // گالری
      const gallery = await fetchGalleryFromSupabase();
      setGalleryImages(gallery);

      // اطلاعات مدیر - از جدول public_info
      setLoadingManager(true);
      try {
        console.log("🔍 در حال خواندن public_info...");
        const { data, error } = await supabase
          .from("public_info")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) {
          console.error("❌ خطا در public_info:", error);
          // اگر با public_info نشد، با public-info امتحان کن
          const { data: data2, error: error2 } = await supabase
            .from("public-info" as any)
            .select("*")
            .limit(1)
            .maybeSingle();
          if (!error2 && data2) {
            setManagerInfo(data2);
            console.log("✅ از public-info خوانده شد:", data2);
          } else {
            console.error("❌ هر دو نام جدول خطا:", error, error2);
          }
        } else {
          console.log("✅ اطلاعات مدیر:", data);
          setManagerInfo(data);
        }
      } catch (e: any) {
        console.error("Exception public_info:", e.message);
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
      label:
        language === "fa" ? "سال تجربه" : language === "ar" ? "سنوات" : "Years",
      sub:
        language === "fa"
          ? "از ۲۰۱۴"
          : language === "ar"
            ? "منذ 2014"
            : "Since 2014",
    },
    {
      icon: Building2,
      value: "2",
      label:
        language === "fa"
          ? "شعبه فعال"
          : language === "ar"
            ? "الفروع النشطة"
            : "Branches",
      sub:
        language === "fa"
          ? "در مشهد"
          : language === "ar"
            ? "في مشهد"
            : "In Mashhad",
    },
    {
      icon: UtensilsCrossed,
      value: "80+",
      label:
        language === "fa"
          ? "غذای اصیل"
          : language === "ar"
            ? "الأطعمة الأصلية"
            : "Authentic Dishes",
      sub:
        language === "fa"
          ? "افغانستانی و ایرانی"
          : language === "ar"
            ? "أفغانستانی و إيراني"
            : "Afghan & Iranian",
    },
    {
      icon: Users,
      value: "300K+",
      label:
        language === "fa"
          ? "مشتری راضی"
          : language === "ar"
            ? "العملاء الرضا"
            : "Happy Clients",
      sub:
        language === "fa"
          ? "خانواده وطندار"
          : language === "ar"
            ? "عائلة وطندار"
            : "Vatandar Family",
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white dark:bg-slate-900 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {isRTL ? (
              <ChevronLeft className="rotate-180" size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 sm:space-y-12">
        <div className="flex flex-col items-center gap-5">
          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20">
            <Image
              src="/logo1.png"
              width={140}
              height={140}
              alt={t("restaurantName")}
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h1
              className={`${language === "en" ? "font-black" : "font-black"} text-3xl sm:text-4xl tracking-tight`}
            >
              {t("restaurantName")}
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/15">
              <Sparkles size={14} />
              {language === "fa"
                ? "اصالت طعم افغانی"
                : language === "ar"
                  ? "أصالة الطعم الأفغاني"
                  : "Authentic Afghan Taste"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className={`${theme.card} p-6 sm:p-8 space-y-4`}>
            <h2 className="flex items-center gap-2 text-xl font-black">
              {t("aboutUs")}
            </h2>
            <p className="leading-5 text-[15px] text-slate-700 dark:text-slate-300">
              {storyText}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {[
                {
                  title:
                    language === "fa"
                      ? "مواد تازه"
                      : language === "ar"
                        ? "المكونات الطازجة"
                        : "Fresh Ingredients",
                  desc:
                    language === "fa"
                      ? "روزانه از بازار"
                      : language === "ar"
                        ? "السوق اليومي"
                        : "Daily market",
                },
                {
                  title:
                    language === "fa"
                      ? "پخت سنتی"
                      : language === "ar"
                        ? "الطبخ التقليدي"
                        : "Traditional",
                  desc:
                    language === "fa"
                      ? "به روش مادربزرگ"
                      : language === "ar"
                        ? "الطريقة العائلية"
                        : "Grandma's way",
                },
                {
                  title:
                    language === "fa"
                      ? "سرو خانوادگی"
                      : language === "ar"
                        ? "خدمة العائلة"
                        : "Family Service",
                  desc:
                    language === "fa"
                      ? "گرم و صمیمی"
                      : language === "ar"
                        ? "دافئ و مريح"
                        : "Warm & cozy",
                },
              ].map((f, i) => (
                <div key={i} className={`${theme.softCard} p-3.5`}>
                  <p className="font-bold text-sm">{f.title}</p>
                  <p className={`text-xs mt-1 ${theme.muted}`}>{f.desc}</p>
                </div>
              ))}
            </div>
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

        {/* گالری - از سوپابیس */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <ImageIcon size={20} />
              {language === "fa"
                ? "گالری تصاویر"
                : language === "ar"
                  ? "معرض الصور"
                  : "Gallery"}
            </h2>
            <p className={`text-xs ${theme.muted}`}>
              {loadingGallery
                ? "در حال بارگذاری از Supabase..."
                : `${galleryImages.length} عکس • از پوشه gallery`}
            </p>
          </div>
          {loadingGallery ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-[1.25rem] bg-black/5 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
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
                      نمایش
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* شعبه‌ها - کارت مثل قبلی */}
        <div className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Building2 size={18} />
            {language === "fa"
              ? "شعبه‌های ما"
              : language === "ar"
                ? "الفروع النشطة"
                : "Our Branches"}
          </h2>
          {loadingBranches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`${theme.card} p-6 h-40 animate-pulse bg-black/5 dark:bg-white/5`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.length > 0 ? (
                branches.map((branch) => {
                  const name =
                    language === "en"
                      ? (branch as any).name_en || branch.name_fa
                      : language === "ar"
                        ? (branch as any).name_ar || branch.name_fa
                        : branch.name_fa;
                  return (
                    <div
                      key={branch.id}
                      className={`${theme.card} p-5 space-y-3`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-1 w-1 border rounded-full ${(branch as any).is_active ? "bg-green-500" : "bg-red-500"} animate-ping`}
                            />
                            <p className={`text-xs ${theme.muted}`}>
                              {(branch as any).is_active
                                ? language === "fa"
                                  ? "فعال"
                                  : language === "ar"
                                    ? "نشط"
                                    : "Active"
                                : language === "fa"
                                  ? "غیرفعال"
                                  : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-[13px] pt-2 border-t border-black/5 dark:border-white/10">
                        <div className="flex gap-2">
                          <MapPin
                            size={16}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="line-clamp-2">
                            {language === "en"
                              ? (branch as any).address_en
                              : language === "ar"
                                ? (branch as any).address_ar
                                : (branch as any).address_fa || "به زودی"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Phone
                            size={16}
                            className="shrink-0 text-slate-400"
                          />
                          <span dir="ltr">
                            {(branch as any).phone_1 || "به زودی"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Clock
                            size={16}
                            className="shrink-0 text-slate-400"
                          />
                          <span>
                            {(branch as any).open !== undefined
                              ? `${language === "fa" ? "هر روز" : "Every Day"} ${(branch as any).open}:00 - ${(branch as any).close}:00`
                              : "ساعت کاری به زودی..."}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <a
                          href={`tel:${(branch as any).phone_1 || ""}`}
                          className="h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center gap-1.5 text-sm font-bold"
                        >
                          <PhoneCall size={16} /> تماس
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((branch as any).address_fa || branch.name_fa)}`}
                          target="_blank"
                          className="h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5 text-sm font-bold"
                        >
                          <Navigation size={16} /> مسیر
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className={`${theme.card} p-6 col-span-2 text-center text-sm ${theme.muted}`}
                >
                  {language === "fa"
                    ? "هنوز شعبه‌ای ثبت نشده"
                    : "No branches yet"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* کارت مدیریت - مثل قبلی */}
        <div className={`${theme.card} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {managerAvatar ? (
                <Image
                  src={managerAvatar}
                  alt="مدیر"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                "W"
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-black">
                  {managerInfo?.manager_name}
                </h3>
                <p className={`text-sm ${theme.muted} mt-1`}>
                  {managerInfo?.manager_description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`${theme.softCard} p-3.5 flex items-center gap-2.5`}
                >
                  <Phone size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-[11px] opacity-50 font-bold">مدیریت</p>
                    <p className="text-sm font-bold" dir="ltr">
                      {managerInfo?.manager_number}
                    </p>
                  </div>
                </div>
                <div
                  className={`${theme.softCard} p-3.5 flex items-center gap-2.5`}
                >
                  <PhoneCall size={18} className="text-blue-600" />
                  <div>
                    <p className="text-[11px] opacity-50 font-bold">واتساپ</p>
                    <p className="text-sm font-bold" dir="ltr">
                      {managerInfo?.manager_number}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={`tel:${managerInfo?.manager_number}`}
                  className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 h-10 flex items-center gap-2 text-sm font-bold"
                >
                  <PhoneCall size={16} />{language === "fa"
                    ? "تماس"
                    : language === "ar"
                      ? "اتصال"
                      : "Call"}
                </a>
                <a
                  href={`https://wa.me/${managerInfo?.manager_number}`}
                  target="_blank"
                  className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-5 h-10 flex items-center gap-2 text-sm font-bold"
                >
                  {language === "fa"
                    ? "واتساپ"
                    : language === "ar"
                      ? "واتساب"
                      : "WhatsApp"}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-l from-emerald-600 via-emerald-600 to-teal-600 p-8 text-white text-center shadow-xl shadow-emerald-600/20 dark:shadow-black/30">
          <h3 className="text-2xl font-black">{language === "fa" ? "آماده سفارش هستید؟" : language === "ar" ? "هل أنت مستعد لطلب الطعام؟" : "Ready to Order?"}</h3>
          <p className="mt-2 text-white/80 text-sm">
            {language === "fa"
              ? "منوی کامل ما را مشاهده کنید و غذای مورد علاقه خود را انتخاب کنید."
              : language === "ar"
                ? "اطلع على قائمتنا الكاملة واختر طعامك المفضل."
                : "View our full menu and choose your favorite dish."}
          </p>
          <Link
            href="/menu"
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-emerald-700 shadow-lg hover:bg-white/90 transition-colors"
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
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={selectedImage}
            alt="gallery preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
