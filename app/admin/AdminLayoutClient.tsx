// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth, safeInternalPath } from "@/contexts/AdminAuthContext";
import { FullPageLoader } from "@/components/Loader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();

  // لایه دوم محافظت (لایه اول: proxy.ts سمت سرور)
  // اگر کاربر لاگین نبود، به صفحه ورود برمی‌گردد
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        window.location.replace(
          `/login?from=${encodeURIComponent(safeInternalPath(pathname))}`,
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, pathname]);

  // لودینگ یکپارچه تا مشخص شدن وضعیت ورود
  if (isLoading || !isAuthenticated) {
    return <FullPageLoader />;
  }

  return (
    <AdminSidebar onLogout={logout}>
      {children}
    </AdminSidebar>
  );
}
