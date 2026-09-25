import type { Metadata } from "next";

/** متادیتای صفحهٔ دربارهٔ ما */
export const metadata: Metadata = {
  title: "درباره رستوران وطندار",
  description:
    "داستان رستوران وطندار مشهد؛ فضای سنتی و خانوادگی، منوی غذای ایرانی و افغانی، گالری تصاویر، شعبه‌ها و راه‌های تماس با ما.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "درباره رستوران وطندار مشهد | داستان ما، فضا و شعبه‌ها",
    description:
      "آشنایی با رستوران وطندار مشهد؛ فضای خانوادگی، منوی ایرانی و افغانی، گالری تصاویر و راه‌های تماس.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
