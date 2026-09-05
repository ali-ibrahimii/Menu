import type { Viewport } from "next";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  // متادیتای اصلی
  metadataBase: new URL("https://vatandar-menu.vercel.app"),

  title: {
    default: "رستوران وطندار | منوی دیجیتال",
    template: "%s | رستوران وطندار مشهد",
  },

  description:
    "منوی آنلاین رستوران وطندار مشهد | سفارش غذاهای ایرانی، افغانی، صبحانه، نوشیدنی‌های گرم و سرد با بهترین کیفیت و قیمت مناسب",

  // آیکون‌ها
  icons: {
    icon: [
      { url: "/logo1.png", sizes: "50x50", type: "image/png" },
      { url: "/logo1.png", sizes: "40x40", type: "image/png" },
    ],
    apple: [{ url: "/logo1.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/logo1.png",
  },

  // منیفست برای PWA
  manifest: "/manifest.json",

  // کلیدواژه‌های جامع
  keywords: [
    "رستوران مشهد",
    "منوی آنلاین مشهد",
    "سفارش غذا مشهد",
    "غذای ایرانی مشهد",
    "رستوران وطندار",
    "غذای افغانی مشهد",
    "صبحانه مشهد",
    "قهوه مشهد",
    "نوشیدنی گرم مشهد",
    "بهترین رستوران مشهد",
    "غذا در مشهد",
    "رستوران خوب مشهد",
    "رستوران سنتی مشهد",
    "کباب مشهد",
    "چلوکباب مشهد",
    "فست فود مشهد",
    "پیتزا مشهد",
    "برگر مشهد",
    "رستوران خانوادگی مشهد",
    "رستوران با موزیک مشهد",
    "تولد در رستوران مشهد",
    "رزرو میز رستوران مشهد",
  ],

  // نویسنده و تولیدکننده
  authors: [{ name: "Ali Ibrahimi", url: "https://github.com/ali-ibrahimii" }],
  creator: "Ali Ibrahimi",
  publisher: "Vatandar Restaurant",

  // متادیتای شبکه‌های اجتماعی
  openGraph: {
    title: "رستوران وطندار | منوی دیجیتال ",
    description:
      "سفارش آنلاین انواع غذاهای ایرانی، افغانی، صبحانه و نوشیدنی در رستوران وطندار مشهد",
    url: "https://vatandar-menu.vercel.app",
    siteName: "رستوران وطندار",
    images: ["/card-image.jpg"],
    locale: "fa_IR",
    type: "website",
  },




  // تأییدیه‌ها
  verification: {
    google: "googleec72074d61f7d798", // کد تأیید گوگل سرچ کنسول
    yandex: "yandex-verification-code", // برای یاندکس (اختیاری)
    yahoo: "yahoo-verification-code", // برای یاهو (اختیاری)
    other: {
      "google-site-verification": "googleec72074d61f7d798",
      me: ["ali-ibrahimii@example.com"],
    },
  },

  // اعتبارسنجی
  category: "restaurant",

  // طبقه‌بندی
  classification: "Restaurant, Food Delivery, Online Menu",

  // سایر متا تگ‌های مفید
  other: {
    "geo.region": "IR-09", // استان خراسان رضوی
    "geo.placename": "Mashhad",
    "geo.position": "36.299265;59.640879", // مختصات رستوران
    ICBM: "36.299265, 59.640879",
    language: "fa",
    rating: "4.5",
    target: "all",
    audience: "all",
    distribution: "global",
    "revisit-after": "1 days",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 5, // بهتره 1 نباشه برای دسترسی بهتر
  userScalable: true, // بهتره true باشه برای کاربرانی که نیاز به زوم دارند
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // اضافه کردن structured data برای رستوران
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "رستوران وطندار",
    image: "https://vatandar-menu.vercel.app/logo1.png",
    url: "https://vatandar-menu.vercel.app",
    telephone: "+98-513-xxx-xxxx", // شماره تلفن واقعی
    address: {
      "@type": "PostalAddress",
      streetAddress: "آدرس دقیق رستوران",
      addressLocality: "مشهد",
      addressRegion: "خراسان رضوی",
      addressCountry: "IR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.299265,
      longitude: 59.640879,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "23:00",
      },
    ],
    menu: "https://vatandar-menu.vercel.app/menu",
    acceptsReservations: "True",
    priceRange: "$$",
    servesCuisine: ["Iranian", "Afghan", "International"],
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Favicon for all platforms */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo1.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="320x320"
          href="/logo1.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="160x160"
          href="/logo1.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fff" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />

        {/* Additional SEO */}
        <meta
          name="google-site-verification"
          content="googleec72074d61f7d798"
        />
      </head>
      <body>
        <Providers>
          <AOSProvider>
            <ThemeProvider>
              <LanguageProvider>
                <BranchProvider>
                  <AdminAuthProvider>
                    <Toaster position="top-center" />
                    {children}
                    <Analytics /> {/* آنالیز بازدیدها */}
                    <VisitTracker />
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
