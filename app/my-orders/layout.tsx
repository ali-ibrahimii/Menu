import type { Metadata } from "next";

/** سفارش‌های کاربر — محتوای شخصی و نباید ایندکس شود */
export const metadata: Metadata = {
  title: "سفارش‌های من",
  robots: { index: false, follow: false },
};

export default function MyOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
