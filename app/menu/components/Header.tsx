"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Header({
  title,
  language,
}: {
  title: string;
  language: string;
}) {
  return (
    <div
      className="text-3xl font-bold flex justify-between items-center text-slate-950 dark:text-white"
      dir={language === "en" ? "ltr" : "rtl"}
    >
      <h1 className={`${language === "en" ? "font-[Balbek]" : "font-[BTitr]"}`}>
        {title}
      </h1>

      <Link href="/" prefetch={true}>
        <button
          type="button"
          className="active:scale-95 border border-black/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/[0.06] text-slate-950 dark:text-white p-2 shadow-sm dark:shadow-black/20 transition-colors duration-300 hover:bg-white dark:hover:bg-white/[0.1]"
        >
          <ChevronLeft
            size={20}
            className={`${language === "en" ? "rotate-180" : ""}`}
          />
        </button>
      </Link>
    </div>
  );
}
