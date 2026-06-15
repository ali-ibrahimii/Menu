// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
        const hasCookie = document.cookie.includes("admin_auth=true");

        if (!isLoggedIn || !hasCookie) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(checkAuth, 100);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUsername");
    document.cookie =
      "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebar onLogout={handleLogout}>
      {children}
    </AdminSidebar>
  );
}
