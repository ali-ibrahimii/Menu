// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,

} from "recharts";

/* ---------- انواع داده ---------- */
type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  table_number: string;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  items: { name_fa: string; quantity: number; price: number }[];
};

type Food = {
  id: string;
  name_fa: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_id: string;
};

/* ---------- رنگ نمودار ---------- */
const PIE_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, foodsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("foods").select("*"),
      ]);
      setOrders(ordersRes.data || []);
      setFoods(foodsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- محاسبات آماری ---------- */
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === todayStr
  ).length;

  /* ---------- داده نمودار فروش ۷ روز اخیر ---------- */
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayRevenue = orders
      .filter(
        (o) =>
          o.status === "completed" &&
          new Date(o.created_at).toDateString() === dayStr
      )
      .reduce((sum, o) => sum + (o.total_price || 0), 0);
    const dayCount = orders.filter(
      (o) => new Date(o.created_at).toDateString() === dayStr
    ).length;
    return {
      name: d.toLocaleDateString("fa-IR", { weekday: "short" }),
      درآمد: dayRevenue,
      سفارش: dayCount,
    };
  });

  /* ---------- داده نمودار وضعیت سفارشات ---------- */
  const statusData = [
    { name: "تکمیل شده", value: orders.filter((o) => o.status === "completed").length },
    { name: "در انتظار", value: orders.filter((o) => o.status === "pending").length },
    { name: "تایید شده", value: orders.filter((o) => o.status === "confirmed").length },
    { name: "لغو شده", value: orders.filter((o) => o.status === "cancelled").length },
  ].filter((d) => d.value > 0);

  /* ---------- محبوب‌ترین غذاها ---------- */
  const foodSales: Record<string, { name: string; qty: number }> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (!foodSales[item.name_fa])
        foodSales[item.name_fa] = { name: item.name_fa, qty: 0 };
      foodSales[item.name_fa].qty += item.quantity;
    });
  });
  const topFoods = Object.values(foodSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            در حال بارگذاری داشبورد...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* ---------- هدر ---------- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              داشبورد مدیریت 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              خلاصه عملکرد رستوران شما در یک نگاه
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={fetchData}
              variant="outline"
              className="gap-2 dark:border-slate-700 dark:text-slate-200"
            >
              <RefreshCw size={16} />
              بروزرسانی
            </Button>
            <Link href="/admin/add-food">
              <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus size={16} />
                غذای جدید
              </Button>
            </Link>
          </div>
        </div>

        {/* ---------- کارت‌های آماری ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="درآمد کل"
            value={`${totalRevenue.toLocaleString()} ؋`}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
            trend="+12.5%"
            trendUp
          />
          <StatCard
            title="سفارشات امروز"
            value={todayOrders.toString()}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="blue"
            trend="+8.2%"
            trendUp
          />
          <StatCard
            title="در انتظار تایید"
            value={pendingCount.toString()}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
            trend={pendingCount > 5 ? "زیاد" : "عادی"}
            trendUp={false}
          />
          <StatCard
            title="کل غذاها"
            value={foods.length.toString()}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            color="purple"
            trend={`${foods.filter((f) => f.is_available).length} فعال`}
            trendUp
          />
        </div>

        {/* ---------- نمودارها ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نمودار فروش */}
          <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">
                    نمودار فروش
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    درآمد و تعداد سفارشات ۷ روز اخیر
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950"
                >
                  <TrendingUp className="w-3 h-3 ml-1" />
                  رو به رشد
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-slate-500" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-slate-500" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      direction: "rtl",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="درآمد"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* نمودار وضعیت سفارشات */}
          <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">
                وضعیت سفارشات
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                توزیع کلی سفارشات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        direction: "rtl",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  داده‌ای موجود نیست
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------- سفارشات اخیر + محبوب‌ترین غذاها ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* سفارشات اخیر */}
          <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-800 dark:text-slate-100">
                  سفارشات اخیر
                </CardTitle>
                <Link href="/admin/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 gap-1"
                  >
                    مشاهده همه
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  هنوز سفارشی ثبت نشده است
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 font-bold">
                          {order.customer_name?.charAt(0) || "م"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {order.customer_name || "مهمان"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            میز {order.table_number || "-"} •{" "}
                            {new Date(order.created_at).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {order.total_price?.toLocaleString()} ؋
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* محبوب‌ترین غذاها */}
          <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">
                پرفروش‌ترین‌ها
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                محبوب‌ترین غذاها
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topFoods.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  داده‌ای موجود نیست
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topFoods} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 11 }}
                      className="fill-slate-500"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        direction: "rtl",
                      }}
                      cursor={{ fill: "rgba(249,115,22,0.05)" }}
                    />
                    <Bar dataKey="qty" fill="#f97316" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- کامپوننت‌های کمکی ---------- */

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "green" | "blue" | "orange" | "purple";
  trend: string;
  trendUp: boolean;
}) {
  const colorMap = {
    green: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  };

  return (
    <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trendUp ? "text-green-600" : "text-orange-500"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = {
    pending: { label: "در انتظار", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
    confirmed: { label: "تایید شده", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
    completed: { label: "تکمیل شده", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    cancelled: { label: "لغو شده", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${c.className}`}>
      {c.label}
    </span>
  );
}