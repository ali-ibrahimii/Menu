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
  Menu as MenuIcon,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Package,
  CreditCard,
  Bell,
  HelpCircle,
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
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // دریافت سفارشات از دیتابیس
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

  // آمار و اطلاعات
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + order.total_price, 0),
  };

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_username") || "ادمین"
      : "ادمین";

  const mainMenuItems = [
    {
      href: "/admin",
      label: "داشبورد",
      active: pathname === "/admin",
    },
    {
      href: "/admin/add-food",
      label: "افزودن به منو",
      active: pathname?.startsWith("/admin/add-food"),
    },
    {
      href: "/admin/foods",
      label: "لیست منو",
      active: pathname?.startsWith("/admin/foods"),
    },
    {
      href: "/admin/orders",
      label: "شفارشات",
      active: pathname?.startsWith("/admin/orders"),
    },
    {
      href: "/admin/branches",
      label: "شعبه",
      active: pathname?.startsWith("/admin/branches"),
    },
    {
      href: "/menu",
      label: "رفتن به منو",
      active: pathname?.startsWith("/menu"),
    },
  ];

  return (
    <div className="sticky top-0">
      {/* هدر سایدبار */}
      <div className={`flex items-center justify-around backdrop-blur-md py-1 border-b border-gray-200/80`}>
        {/* اطلاعات کاربر */}
        <div className="">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-blue-20 to-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  <User />
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{username}</h3>
              <p className="text-xs text-gray-500">مدیر سیستم</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 font-bold">
          {mainMenuItems.map((item) => {
            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center flex-row gap-1 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 group ${
                    item.active
                      ? "bg-blue-100 justify-center text-blue-600 shadow-md"
                      : "text-gray-700 hover:bg-blue-100/90 justify-center hover:text-gray-900"
                  }`}
                >
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* فوتر سایدبار */}
        <div className="p-2">
          <button
            onClick={onLogout}
            className={`flex items-center gap-1 p-1.5 justify-center bg-blue-600 rounded-lg w-full text-white hover:bg-blue-500 transition`}
          >
            <LogOut size={16} />
            <span className="mb-1">خروج</span>
          </button>

          {/* <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ورژن 1.0.0</span>
              <span>© 2024</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
