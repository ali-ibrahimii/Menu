// app/context/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"           // استفاده از کلاس CSS برای تغییر حالت
      defaultTheme="system"       // حالت پیش‌فرض: روشن
      enableSystem={true}        // تشخیص خودکار حالت سیستم
      disableTransitionOnChange={false} // انیمیشن نرم برای تغییر
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}