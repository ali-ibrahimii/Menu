"use client";

import React, { useCallback, useState } from "react";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { map } from "leaflet";

const ImageGallery = ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"];

export default function About() {
  const { language } = useLanguage();
  const router = useRouter();

  const t = useCallback(
    (key: string) => {
      const langTranslations = translations[
        language as keyof typeof translations
      ] as Record<string, string>;
      return langTranslations[key] || key;
    },
    [language],
  );
  return (
    <div className="flex flex-col p-5 space-y-3">
      <div className="w-full flex justify-between items-center">
        {/* lang btn */}
        <div className="p-1 bg-secondary rounded-lg">
          <LanguageSwitcher />
        </div>
        {/* return btn */}

        <Link href="/" className="border p-2 rounded-full bg-secondary">
          <ChevronLeft />
        </Link>
      </div>

      {/* logo */}
      <div className="flex justify-center">
        <Image
          src="/logo1.png"
          width={120}
          height={120}
          alt={t("restaurantName")}
          className="p-2 bg-secondary border shadow-lg rounded-2xl"
        />
      </div>

      {/* restaurant name */}
      <div>
        <h1
          className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"} text-3xl text-center`}
        >
          {t("restaurantName")}
        </h1>
      </div>

      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex justify-start flex-col"
      >
        <h2 className="font-bold">{t("aboutUs")} :</h2>
        <p>{t("test")}</p>
      </div>

      <div className="" dir={language === "en" ? "ltr" : "rtl"}>
        <h1 className="font-bold">Gallery :</h1>
          <div>
            {ImageGallery.map((item) => (
              <div key={item} className="flex flex-row border items-center justify-center">
                <img src={item} alt="" className="w-20" />
              </div>
            ))}
          </div>
        
      </div>
    </div>
  );
}
