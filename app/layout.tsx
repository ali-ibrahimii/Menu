import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import AOSProvider from "@/contexts/AOSProvider";
import Providers from "@/contexts/providers";
import VisitTracker from "@/components/VisitTracker";
import {
  SITE_URL,
  BRAND,
  DEFAULT_DESCRIPTION,
  KEYWORDS,
  SEO_DEFAULTS,
  buildJsonLd,
  getSeoData,
} from "@/lib/seo";

/**
 * فونت اصلی سایت (وزیرمتن — فونت متغیر، self-host شده)
 * قبلاً --font-sans در globals.css به فونتی اشاره می‌کرد که هرگز لود نمی‌شد؛
 * نتیجه‌اش رندر فارسی با فونت پیش‌فرض مرورگر و CLS بود.
 */
const vazirmatn = localFont({
  src: [{ path: "../public/fonts/Vazirmatn-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-vazirmatn",
  display: "swap",
  fallback: ["Tahoma", "Segoe UI", "Noto Sans Arabic", "system-ui", "sans-serif"],
});

/* ================================ متادیتا ================================ */

export const metadata: Metadata = {
  // دامنهٔ canonical — با NEXT_PUBLIC_SITE_URL قابل تغییر (lib/seo.ts)
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${BRAND.fa} ${SEO_DEFAULTS.city} | منوی دیجیتال و سفارش آنلاین غذا`,
    template: `%s | ${BRAND.fa}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: BRAND.fa,

  // آدرس canonical صفحهٔ ریشه (بقیهٔ صفحات در layout هر مسیر تنظیم می‌شوند)
  alternates: {
    canonical: "/",
  },

  // دستور صریح به خزنده‌ها + تنظیمات googlebot برای پیش‌نمایش بزرگ تصاویر
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  keywords: KEYWORDS,

  authors: [{ name: "Ali Ibrahimi", url: "https://github.com/ali-ibrahimii" }],
  creator: "Ali Ibrahimi",
  publisher: BRAND.fa,

  // آیکون‌ها — فایل‌های سبک و واقعی (قبلاً favicon همان logo1.png با حجم ۱.۸MB بود!)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    siteName: BRAND.fa,
    title: `${BRAND.fa} ${SEO_DEFAULTS.city} | منوی دیجیتال و سفارش آنلاین غذا`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "fa_IR",
    alternateLocale: ["en_US", "ar_AR"],
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `فضای داخلی ${BRAND.fa} ${SEO_DEFAULTS.city}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${BRAND.fa} ${SEO_DEFAULTS.city} | منوی دیجیتال و سفارش آنلاین غذا`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },

  // فقط تأییدیهٔ واقعی گوگل سرچ کنسول (کدهای ساختگی yandex/yahoo حذف شدند)
  verification: {
    google: "googleec72074d61f7d798",
  },

  category: "restaurant",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.fa,
  },

  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },

  // تگ‌های جغرافیایی برای جست‌وجوی محلی
  other: {
    "geo.region": SEO_DEFAULTS.geoRegion,
    "geo.placename": "Mashhad",
    "geo.position": SEO_DEFAULTS.geoPosition,
    ICBM: SEO_DEFAULTS.geoPosition.replace(";", ", "),
    language: "fa",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // زوم باید برای دسترسی‌پذیری آزاد بماند
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#020617",
  colorScheme: "dark",
};

/* ================================ لایهٔ ریشه ================================ */

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data واقعی از دیتابیس (کش‌شده برای یک ساعت)
  const seoData = await getSeoData();
  const jsonLd = buildJsonLd(seoData);

  // پیش‌اتصال به میزبان تصاویر سوپابیس برای بهبود LCP
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null;

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`dark ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white text-slate-950 antialiased dark:bg-black dark:text-white">
        {/* Structured Data — بدون هیچ تگ دستی تکراری در head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {supabaseOrigin && (
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        )}

        <Providers>
          <AOSProvider>
            <ThemeProvider>
              <LanguageProvider>
                <BranchProvider>
                  <AdminAuthProvider>
                    <Toaster position="top-center" />
                    {children}
                    <Analytics /> {/* آنالیز بازدیدها */}
                    <VisitTracker /> {/* ردیابی بازدیدها */}
                  </AdminAuthProvider>
                </BranchProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AOSProvider>
        </Providers>
      </body>
    </html>
  );
}
