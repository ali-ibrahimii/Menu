"use client";

import { useState, useEffect } from "react";
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
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/order";

interface AdminSidebarProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

const theme = {
  sidebar: "bg-slate-900 text-white dark:bg-slate-950 border-r border-white/10",
  sidebarLight:
    "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-black/10 dark:border-white/10",
  topbar:
    "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-black/10 dark:border-white/10",
  active:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 dark:bg-emerald-500",
  inactive:
    "text-slate-400 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:bg-white/5",
  statCard:
    "rounded-xl bg-white/5 dark:bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors",
};

export default function AdminSidebar({
  onLogout,
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_price, final_price")
        .limit(50);
      if (error) throw error;
      setOrders((data as any) || []);
    } catch {
      // silent for sidebar
    }
  };

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("sidebar-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        fetchOrders,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) =>
      ["completed", "delivered", "paid"].includes(o.status),
    ).length,
    totalRevenue: orders
      .filter((o) => ["completed", "delivered", "paid"].includes(o.status))
      .reduce(
        (sum, o) => sum + Number((o as any).final_price || o.total_price || 0),
        0,
      ),
  };

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("adminUsername") ||
        localStorage.getItem("admin_username") ||
        "ادمین"
      : "ادمین";

  const menuItems = [
    { href: "/admin", label: "داشبورد", icon: LayoutDashboard, badge: null },
    {
      href: "/admin/orders",
      label: "سفارشات",
      icon: ShoppingCart,
      badge: stats.pending > 0 ? stats.pending : null,
    },
    { href: "/admin/foods", label: "لیست منو", icon: Utensils, badge: null },
    {
      href: "/admin/add-food",
      label: "افزودن غذا",
      icon: PlusCircle,
      badge: null,
    },
    { href: "/menu", label: "نمایش منو", icon: TrendingUp, badge: null },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* لوگو */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${collapsed && !isMobile ? "hidden" : "flex"}`}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-[15px] leading-4">وطندار</h1>
              <p className="text-[11px] opacity-60">پنل مدیریت</p>
            </div>
          </div>

          {!isMobile && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* آمار سریع */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-4 border-b border-white/10 space-y-3">
          <p className="text-[11px] font-bold tracking-widest opacity-40 px-2">
            آمار سریع
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className={`${theme.statCard} p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className="text-amber-400" />
                <span className="text-[11px] opacity-60">در انتظار</span>
              </div>
              <p className="text-lg font-black">{stats.pending}</p>
            </div>
            <div className={`${theme.statCard} p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[11px] opacity-60">تکمیل</span>
              </div>
              <p className="text-lg font-black">{stats.completed}</p>
            </div>
          </div>
          <div
            className={`${theme.statCard} p-3 flex items-center justify-between`}
          >
            <span className="text-xs opacity-60">درآمد</span>
            <span className="font-black text-sm text-emerald-400">
              {stats.totalRevenue.toLocaleString()} ؋
            </span>
          </div>
        </div>
      )}

      {/* منو */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p
          className={`${collapsed && !isMobile ? "hidden" : "block"} text-[11px] font-bold tracking-widest opacity-40 mb-3 px-2`}
        >
          منو
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive ? theme.active : theme.inactive
                } ${collapsed && !isMobile ? "justify-center" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <Icon size={18} className="shrink-0" />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white rounded-full h-5 min-w-5 p-0 flex items-center justify-center text-[11px] px-1.5 animate-pulse">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* پروفایل */}
      <div className="p-3 border-t border-white/10 space-y-3">
        <div
          className={`flex items-center gap-3 ${collapsed && !isMobile ? "justify-center" : ""}`}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0">
            <User size={18} className="text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{username}</p>
              <p className="text-[11px] opacity-60">مدیر سیستم</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-colors text-sm font-bold ${collapsed && !isMobile ? "justify-center" : ""}`}
        >
          <LogOut size={16} />
          {(!collapsed || isMobile) && <span>خروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen w-full bg-[#fff8ed] dark:bg-slate-950"
      dir="rtl"
    >
      {/* دسکتاپ سایدبار */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col ${theme.sidebar} transition-all duration-300 shadow-2xl ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } sticky top-0 h-screen`}
      >
        <SidebarContent />
      </aside>

      {/* موبایل - تاپ‌بار + شیت */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* تاپ‌بار موبایل */}
        <header
          className={`lg:hidden sticky top-0 z-30 ${theme.topbar} flex items-center justify-between px-4 h-[60px] shrink-0`}
        >
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 bg-black/5 dark:bg-white/5"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={`w-[300px] p-0 ${theme.sidebar} border-l-0 [&>button]:hidden`}
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>منو</SheetTitle>
                </SheetHeader>
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Utensils size={16} className="text-white" />
              </div>
              <span className="font-black text-sm">وطندار ادمین</span>
              {stats.pending > 0 && (
                <Badge className="bg-red-500 text-white rounded-full h-5 px-2 text-xs animate-pulse">
                  {stats.pending} جدید
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="relative h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"
            >
              <ShoppingCart size={18} />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* ناوبری پایین موبایل - دسترسی سریع */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 px-2 py-2 safe-area-pb">
          <div className="grid grid-cols-5 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all relative ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                  {item.badge && (
                    <span className="absolute top-1 right-3 h-4 min-w-4 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* محتوای اصلی */}
        <main className="flex-1 overflow-y-auto bg-[#fff8ed] dark:bg-slate-950 pb-[80px] lg:pb-0">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
