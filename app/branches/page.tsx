"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Check, Building2, ChevronLeft, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
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

const branchImageGalleries: Record<string, string[]> = {
  main: ["/branch1/1.jpg", "/branch1/2.jpg", "/branch1/3.jpg", "/branch1/4.jpg"],
  branch2: ["/branch2/1.jpg", "/branch2/2.jpg", "/branch2/3.jpg", "/branch2/4.jpg", "/branch2/5.jpg", "/branch2/6.jpg", "/branch2/7.jpg"],
  default: ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/sonati-bg.jpg", "/sonati1-bg.jpg"],
};

const getImages = (slug: string) => branchImageGalleries[slug] || branchImageGalleries.default;

const BranchCard = React.memo(({
  branch,
  language,
  onSelect,
  currentIndex,
  images,
  index,
}: {
  branch: Branch;
  language: string;
  onSelect: (b: Branch) => void;
  currentIndex: number;
  images: string[];
  index: number;
}) => {
  const handleSelect = () => onSelect(branch);
  const name = language === "en" ? branch.name_en : language === "fa" ? branch.name_fa : branch.name_ar;
  const address = language === "en" ? branch.address_en : language === "fa" ? branch.address_fa : branch.address_ar;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      style={{
        animation: `slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s both`,
      }}
      className="group relative rounded-3xl overflow-hidden cursor-pointer h-96 mx-auto max-w-md w-full border border-white/10 hover:border-emerald-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 shadow-xl shadow-black/20"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <Image
          src={images[currentIndex]}
          alt={name}
          className="object-cover transition-all duration-700 group-hover:scale-110"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Overlay Gradient - بهتر شده */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 group-hover:via-black/40 transition-all duration-500" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image Dots - بهبود شده */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? "bg-emerald-400 w-6 h-2"
                : "bg-white/30 hover:bg-white/50 w-2 h-2"
            }`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {language === "fa" ? "نزدیکترین شعبه" : language === "ar" ? "أقرب فرع" : "Nearest Branch"}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg leading-tight font-[BTitr]">
              {name}
            </h3>
          </div>
          <div className="glass-check-status-branch text-[11px] backdrop-blur-md bg-white/10 px-3 py-2 rounded-xl border border-white/20">
            <CheckRestaurantStatus />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3 group/item">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 backdrop-blur-sm group-hover/item:bg-emerald-400/20 transition-colors duration-300 flex-shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm text-white/90 line-clamp-2 leading-relaxed font-medium">{address}</p>
          </div>

          {/* Phone */}
          {branch.phone_1 && (
            <div className="flex items-center gap-3 group/item">
              <div className="p-2.5 rounded-xl bg-emerald-400/10 backdrop-blur-sm group-hover/item:bg-emerald-400/20 transition-colors duration-300 flex-shrink-0">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <a 
                href={`tel:${branch.phone_1}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-white/90 ltr font-medium hover:text-emerald-400 transition-colors duration-300" 
                dir="ltr"
              >
                {branch.phone_1}
              </a>
            </div>
          )}

          {/* Select Button */}
          <button 
            onClick={handleSelect}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 group/btn active:translate-y-0"
          >
            <Check className="w-4 h-4" />
            <span>
              {translations[language as keyof typeof translations]?.selectBranch || "انتخاب شعبه"}
            </span>
            {language === "en" ? (
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            ) : (
              <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Shine effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
});

BranchCard.displayName = "BranchCard";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const t = (key: string) =>
    (translations[language as keyof typeof translations] as Record<string, string>)?.[key] || key;

  const handleSelect = useCallback((branch: Branch) => {
    setSelectedBranch(branch);
    router.push("/");
  }, [setSelectedBranch, router]);

  // چرخش عکس‌ها
  useEffect(() => {
    branches.forEach((branch) => {
      const images = getImages(branch.slug);
      if (images.length <= 1) return;

      intervalsRef.current[branch.id] = setInterval(() => {
        setImageIndexes((prev) => ({
          ...prev,
          [branch.id]: ((prev[branch.id] || 0) + 1) % images.length,
        }));
      }, 4000);
    });

    return () => Object.values(intervalsRef.current).forEach(clearInterval);
  }, [branches]);

  // واکشی شعبه‌ها
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

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div dir={language === "en" ? "ltr" : "rtl"} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={language === "en" ? "ltr" : "rtl"} className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* بک‌گراند بهتر شده */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-3xl opacity-30" />
        
        {/* Grid pattern - optional */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
      </div>

      {/* Content */}
      <div className="px-4 py-8 max-w-6xl mx-auto relative z-10">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-12 animate-fadeIn" style={{ animation: "fadeIn 0.6s ease-out" }}>
          <LanguageSwitcher />
          <Link 
            href="/" 
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 backdrop-blur-sm group"
          >
            {language === "en" ? (
              <ChevronLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            )}
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeIn" style={{ animation: "fadeIn 0.6s ease-out 0.2s both" }}>
          {/* Logo */}
          <div className="inline-block mb-8 p-5 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-2xl shadow-emerald-500/10 hover:border-emerald-400/20 transition-all duration-500 hover:-translate-y-1">
            <Image 
              src="/logo1.png" 
              alt="logo" 
              width={160} 
              height={40} 
              className="object-contain drop-shadow-lg" 
              priority 
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[BTitr] text-white leading-tight">
            {t("restaurantName")}
          </h1>

          {/* Subheading */}
          <p className="text-lg text-white/60 max-w-md mx-auto leading-relaxed font-medium">
            {t("selectBranchReq")}
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-400/50" />
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-400/50" />
          </div>
        </div>

        {/* Branches Grid */}
        {branches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {branches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                language={language}
                onSelect={handleSelect}
                currentIndex={imageIndexes[branch.id] || 0}
                images={getImages(branch.slug)}
                index={index}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div 
            className="text-center py-24 animate-fadeIn" 
            style={{ animation: "fadeIn 0.6s ease-out 0.4s both" }}
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <Building2 className="w-12 h-12 text-white/40" />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-[BTitr] text-white">{t("noActiveBranch")}</h3>
            <p className="text-white/60 text-base">{t("pleaseTryAgain")}</p>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
