// app/components/ThemeToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <div className="flex items-center w-full mx-3 justify-evenly bg-black dark:bg-card-foreground backdrop-blur-sm rounded-xl p-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          theme === "light"
            ? "bg-slate-200 text-gray-900"
            : "text-background hover:bg-white/10"
        }`}
        aria-label="حالت روز"
      >
        <Sun size={18} />
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-white/10"
        }`}
        aria-label="حالت شب"
      >
        <Moon size={18} />
      </button>
    </div>
  );
}