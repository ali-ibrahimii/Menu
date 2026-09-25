import type { Metadata } from "next";

/**
 * متادیتای صفحهٔ شعبه‌ها.
 * نکتهٔ سئو: صفحهٔ اصلی (/) کاربرِ بدون شعبهٔ انتخاب‌شده را به این صفحه
 * می‌فرستد، پس این صفحه عملاً صفحهٔ فرود خزنده‌هاست و باید عنوان/توضیح
 * برند-محور و canonical درست داشته باشد.
 */
export const metadata: Metadata = {
  title: `شعبه‌ها، آدرس و تلفن`,
  description:
    "شعبه‌های رستوران وطندار مشهد را انتخاب کنید؛ آدرس دقیق، تلفن تماس، مسیریابی و ساعت کاری هر شعبه همراه با امکان مشاهدهٔ منوی اختصاصی همان شعبه.",
  alternates: { canonical: "/branches" },
  openGraph: {
    title: "شعبه‌های رستوران وطندار مشهد | آدرس، تلفن و مسیریابی",
    description:
      "انتخاب شعبهٔ رستوران وطندار؛ آدرس، تلفن تماس و مسیریابی هر شعبه همراه با منوی اختصاصی.",
    url: "/branches",
  },
};

export default function BranchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
