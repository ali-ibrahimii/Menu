import type { Metadata } from "next";

/** متادیتای صفحهٔ منو — مهم‌ترین صفحهٔ محتوایی سایت برای جست‌وجوی غذاها */
export const metadata: Metadata = {
  title: "منوی غذا و نوشیدنی",
  description:
    "منوی کامل رستوران وطندار مشهد با قیمت روز؛ غذای ایرانی و افغانی، کباب و چلوخورش، پیش‌غذا، صبحانه، نوشیدنی گرم و سرد و دسر. جست‌وجو در منو و ثبت سفارش آنلاین.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "منوی رستوران وطندار مشهد | غذا، نوشیدنی و قیمت روز",
    description:
      "مشاهدهٔ منوی کامل رستوران وطندار با قیمت روز؛ غذای ایرانی و افغانی، صبحانه و نوشیدنی.",
    url: "/menu",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
