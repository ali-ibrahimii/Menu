"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
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

// آمار سریع سایدبار
interface SidebarStats {
  pending: number;
  completed: number;
  totalRevenue: number;
}

// فقط فیلدهای موردنیاز سایدبار از سفارش
type SidebarOrder = Pick<Order, "id" | "status" | "total_price"> & {
  final_price?: number | null;
};

// تم سایت فقط تاریک است
const theme = {
  sidebar: "bg-slate-900 border-r border-white/10",
  topbar: "bg-slate-900/90 backdrop-blur-xl border-b border-white/10",
  active: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
  inactive: "text-slate-400 hover:bg-white/10 hover:text-white",
  statCard:
    "rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors",
};

const menuItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/orders", label: "سفارشات", icon: ShoppingCart },
  { href: "/admin/foods", label: "لیست منو", icon: Utensils },
  { href: "/admin/add-food", label: "افزودن غذا", icon: PlusCircle },
  { href: "/menu", label: "نمایش منو", icon: TrendingUp },
];

/** وضعیت فعال بودن هر آیتم منو */
function isActiveItem(pathname: string | null, href: string) {
  // صفحات ویرایش غذا زیرمجموعه «لیست منو» حساب می‌شوند
  if (href === "/admin/foods" && pathname?.startsWith("/admin/edit/")) {
    return true;
  }
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

interface SidebarContentProps {
  pathname: string | null;
  collapsed: boolean;
  isMobile?: boolean;
  username: string;
  stats: SidebarStats;
  onLogout: () => void;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

/** محتوای سایدبار — خارج از رندر تعریف شده تا با هر رندر، ری‌مونت نشود */
function SidebarContent({
  pathname,
  collapsed,
  isMobile = false,
  username,
  stats,
  onLogout,
  onNavigate,
  onToggleCollapse,
}: SidebarContentProps) {
  const badges: Record<string, number | null> = {
    "/admin/orders": stats.pending > 0 ? stats.pending : null,
  };

  return (
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
              <h1 className="font-black text-[15px] leading-4 text-white">
                وطندار
              </h1>
              <p className="text-[11px] opacity-60">پنل مدیریت</p>
            </div>
          </div>

          {!isMobile && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
              {stats.totalRevenue.toLocaleString()} تومان
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
            const badge = badges[item.href] ?? null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActiveItem(pathname, item.href) ? theme.active : theme.inactive
                } ${collapsed && !isMobile ? "justify-center" : ""}`}
                title={collapsed && !isMobile ? item.label : ""}
                aria-current={
                  isActiveItem(pathname, item.href) ? "page" : undefined
                }
              >
                <Icon size={18} className="shrink-0" />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge && (
                      <Badge className="bg-red-500 text-white rounded-full h-5 min-w-5 p-0 flex items-center justify-center text-[11px] px-1.5 animate-pulse">
                        {badge}
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
              <p className="font-bold text-sm truncate text-white">{username}</p>
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
}

export default function AdminSidebar({
  onLogout,
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orders, setOrders] = useState<SidebarOrder[]>([]);
  // نکته: خواندن localStorage در زمان رندر باعث خطای hydration می‌شد؛
  // الان فقط بعد از mount خوانده می‌شود.
  const [username, setUsername] = useState("ادمین");

  useEffect(() => {
    // الگوی استاندارد خواندن client-only storage بعد از hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsername(
      localStorage.getItem("adminUsername") ||
        localStorage.getItem("admin_username") ||
        "ادمین",
    );
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_price, final_price")
        .limit(200);
      if (error) throw error;
      setOrders((data as SidebarOrder[]) || []);
    } catch {
      // silent for sidebar
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [fetchOrders]);

  // هنگام جابه‌جایی بین صفحات ادمین، اسکرول به بالای صفحه برود
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const stats: SidebarStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) =>
      ["completed", "delivered", "paid"].includes(o.status),
    ).length,
    totalRevenue: orders
      .filter((o) => ["completed", "delivered", "paid"].includes(o.status))
      .reduce(
        (sum, o) => sum + Number(o.final_price || o.total_price || 0),
        0,
      ),
  };

  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden bg-slate-950"
      dir="rtl"
    >
      {/* دسکتاپ سایدبار */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col ${theme.sidebar} transition-all duration-300 shadow-2xl ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } h-full`}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          username={username}
          stats={stats}
          onLogout={onLogout}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* موبایل - تاپ‌بار + شیت */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
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
                  className="rounded-full h-10 w-10 bg-white/5 text-white"
                  aria-label="باز کردن منو"
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
                <SidebarContent
                  pathname={pathname}
                  collapsed={false}
                  isMobile
                  username={username}
                  stats={stats}
                  onLogout={onLogout}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Utensils size={16} className="text-white" />
              </div>
              <span className="font-black text-sm text-white">وطندار ادمین</span>
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
              className="relative h-10 w-10 rounded-full bg-white/5 text-white flex items-center justify-center"
              aria-label="سفارشات"
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 safe-area-pb">
          <div className="grid grid-cols-5 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badge =
                item.href === "/admin/orders" && stats.pending > 0
                  ? stats.pending
                  : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all relative ${
                    isActiveItem(pathname, item.href)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                  {badge && (
                    <span className="absolute top-1 right-3 h-4 min-w-4 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* محتوای اصلی — تنها همین بخش اسکرول می‌شود */}
        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto bg-slate-950 pb-[88px] lg:pb-6"
        >
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
