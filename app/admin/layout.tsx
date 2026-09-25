import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

/**
 * لایهٔ سروری پنل مدیریت.
 * فقط متادیتا (noindex) را اضافه می‌کند و بقیهٔ کار را به کلاینت می‌سپارد.
 * (منطق قبلی بدون تغییر در AdminLayoutClient.tsx است)
 */
export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت رستوران وطندار",
    template: "%s | پنل مدیریت وطندار",
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
