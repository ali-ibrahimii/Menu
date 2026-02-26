"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch } from "@/types";
import CheckRestaurantStatus from "@/components/CheckRestaurantStatus";
import ActionButtons from "./ActionButtons";

interface MainContentProps {
  branch: Branch;
  t: (key: string) => string;
}

export default function MainContent({ branch, t }: MainContentProps) {
  const { language } = useLanguage();

  return (
    <div className="absolute bottom-0 w-full z-30 glass-card">
      <div className="bg-white/5 rounded-r-lg p-2 border border-white/10 absolute left-0 top-20">
        <CheckRestaurantStatus />
      </div>

      <div className="flex flex-col items-center space-y-6 w-full px-8">
        <div className="flex-col flex items-center">
          <Image
            src="/logo1.png"
            alt={branch.name_fa}
            width={140}
            height={40}
            className="object-cover"
            // priority
          />
          <h1
            className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"} text-2xl text-center`}
          >
            {t("restaurantName")}
          </h1>
        </div>

        <ActionButtons />

        <Link
          href={`/menu?branch=${branch.slug}`}
          prefetch={true}
          className="w-full flex justify-center bg-white/5 hover:bg-white/10 transition-colors glass-button py-2 rounded-full text-center font-bold border border-white/10"
        >
          {t("viewMenu")}
        </Link>
      </div>
    </div>
  );
}