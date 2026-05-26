"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Header({ title, language }: {title: string; language: string}) {
  return (
    <div
      className={`text-3xl font-bold flex justify-between items-center`}
      dir={language === "en" ? "ltr" : "rtl"}
    >
      <h1 className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}>
        {title}
      </h1>

      <Link href="/" prefetch={true}>
        <button className="active:scale-95 border rounded-full bg-accent dark:bg-[#191919] dark:text-white p-2">
          <ChevronLeft
            size={20}
            className={`${language === "en" ? "rotate-180" : ""}`}
          />
        </button>
      </Link>
    </div>
  );
}