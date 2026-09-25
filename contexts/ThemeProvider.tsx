// app/context/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * تم سایت فقط و فقط تاریک است.
 * - forcedTheme="dark" یعنی در هر شرایطی کلاس dark روی <html> اعمال می‌شود
 *   (حتی اگر قبلاً کاربر «روشن» را در localStorage ذخیره کرده باشد)
 * - هیچ حالت روشنی وجود ندارد و سوییچی هم برای تغییر تم باقی نمانده است.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // استفاده از کلاس CSS برای تم
      forcedTheme="dark" // قفل شدن روی حالت تاریک
      defaultTheme="dark" // حالت پیش‌فرض: تاریک
      enableSystem={false} // تشخیص خودکار حالت سیستم غیرفعال
      disableTransitionOnChange={true} // بدون انیمیشن اضافه بین تم‌ها
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
