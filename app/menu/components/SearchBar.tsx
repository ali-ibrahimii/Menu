"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange, placeholder, language }: {value: string; onChange: (value: string) => void; placeholder: string; language: string}) {
  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className="flex items-center justify-center w-full"
    >
      <div className="relative w-full">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="ps-10 pe-9 py-5 dark:text-gray-200 rounded-full text-md"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 pt-1 text-gray-400">
          <SearchIcon size={16} className={`${language === "en" ? "" : "rotate-90"}`} />
        </div>
      </div>
    </div>
  );
}