import type { Viewport } from "next";
import type { Metadata } from "next";
import "../styles/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export const metadata: Metadata = {
  title: "رستوران وطندار | منوی دیجیتال",
  description:
    "منوی آنلاین رستوران وطندار مشهد | سفارش غذاهای ایرانی و بین‌المللی",
  icons: {
    icon: "/logo1.png",
  },

  // 3. کلیدواژه‌ها برای SEO
  keywords: [
    "رستوران مشهد",
    "منوی آنلاین",
    "غذای ایرانی",
    "رستوران وطندار",
    "سفارش غذا",
  ],

  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef3c7" }, // رنگ روشن
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" }, // رنگ تیره
  ],

  robots: {
    index: true, // ⭐ اجازه ایندکس شدن توسط گوگل
    follow: true, // ⭐ اجازه دنبال کردن لینک‌ها
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1, // پیش‌نمایش ویدیو نامحدود
      "max-image-preview": "large", // ⭐ تصویر بزرگ در نتایج جستجو
      "max-snippet": -1, // نمایش snippet نامحدود
    },
  },
  // ...
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // این خط را اضافه کنید
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <BranchProvider>
              <AdminAuthProvider>
                <Toaster position="top-center" />
                {children}
              </AdminAuthProvider>
            </BranchProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
