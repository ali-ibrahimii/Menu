// components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Utensils,
  PlusCircle,
  ShoppingCart,
  ChevronLeft,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useEffect } from "react";

interface OrderItem {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  table_number: string;
  deviceId: string;
  notes: string;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  items: OrderItem[];
}

interface AdminSidebarProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

export default function AdminSidebar({ onLogout, children }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطا در دریافت سفارشات");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + order.total_price, 0),
  };

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_username") || "ادمین"
      : "ادمین";

  const menuItems = [
    { href: "/admin", label: "داشبورد", icon: Home },
    { href: "/admin/add-food", label: "افزودن منو", icon: PlusCircle },
    { href: "/admin/foods", label: "لیست منو", icon: Utensils },
    { href: "/admin/orders", label: "سفارشات", icon: ShoppingCart },
    { href: "/menu", label: "نمایش منو", icon: TrendingUp },
  ];

  return (
    <div className={`flex h-screen`}>
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-700/50 shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`${collapsed ? "hidden" : "flex"} items-center gap-3`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Utensils size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">منو</h1>
                <p className="text-xs text-slate-400">مدیریت</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 mb-3">آمار سریع</p>
            <div className="space-y-2">
              <div className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-xs text-slate-400">در انتظار</span>
                </div>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-xs text-slate-400">تکمیل شده</span>
                </div>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <p className={`${collapsed ? "hidden" : "text-xs"} font-semibold text-slate-400 mb-3`}>
            منو
          </p>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{username}</p>
                <p className="text-xs text-slate-400">مدیر سیستم</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors font-medium text-sm ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>خروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto">{children}</div>
      </main>
    </div>
  );
}
