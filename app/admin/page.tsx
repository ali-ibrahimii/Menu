"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Eye,
  Bike,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  Users,
  BarChart3,
  Calendar,
  Search,
  X,
  MapPin,
  Phone,
  Hash,
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
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Food } from "@/types";

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  table_number: string | null;
  delivery_address: string | null;
  total_price: number;
  final_price?: number;
  status: string;
  order_type?: "dine_in" | "delivery";
  payment_method?: "cash" | "online";
  branch_id?: string;
  items: any[];
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444"];

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-[1.5rem] border border-black/[0.06] bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
  muted: "text-slate-500 dark:text-slate-400",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [qrScans, setQrScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    fetchAll();
  }, []);
  
useEffect(() => {
  const id = localStorage.getItem("watandar_device_id") || "unknown";
  supabase
    .from("site_visits")
    .insert({ device_id: id, page: window.location.pathname });
}, []);

  const fetchAll = async () => {
    setLoading(true);
    // هر جدول رو جداگانه بگیریم تا اگر یکی نبود بقیه خراب نشه
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(150);
      setOrders((ordersData as any) || []);
    } catch (e) {
      console.error("orders error", e);
    }

    try {
      const { data: foodsData } = await supabase
        .from("foods")
        .select("*")
        .order("created_at", { ascending: false });
      setFoods((foodsData as any) || []);
    } catch (e) {
      console.error("foods error", e);
    }

    try {
      const { data: visitsData, error: visitsError } = await supabase
        .from("site_visits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (visitsError) throw visitsError;
      setVisits(visitsData || []);
      console.log("✅ بازدیدها:", visitsData?.length);
    } catch (e: any) {
      console.warn("⚠️ site_visits وجود ندارد یا RLS بسته است:", e.message);
      setVisits([]); // خالی بمونه تا کاربر SQL رو بزنه
    }

    try {
      const { data: qrData, error: qrError } = await supabase
        .from("qr_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (qrError) throw qrError;
      setQrScans(qrData || []);
    } catch {
      setQrScans([]);
    }

    setLoading(false);
  };

  // موتور جستجو - بین غذاها و اسم مشتری و شماره موبایل و...
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();

    const matchedFoods = foods.filter(
      (f) =>
        String(f.name_fa || "")
          .toLowerCase()
          .includes(q) ||
        String((f as any).name_en || "")
          .toLowerCase()
          .includes(q) ||
        String((f as any).name_ar || "")
          .toLowerCase()
          .includes(q) ||
        String(f.price || "")
          .toString()
          .includes(q) ||
        String((f as any).category || "")
          .toLowerCase()
          .includes(q),
    );

    const matchedOrders = orders.filter(
      (o) =>
        String(o.customer_name || "")
          .toLowerCase()
          .includes(q) ||
        String(o.customer_phone || "")
          .toLowerCase()
          .includes(q) ||
        String(o.table_number || "")
          .toLowerCase()
          .includes(q) ||
        String(o.id || "")
          .toLowerCase()
          .includes(q) ||
        String(o.delivery_address || "")
          .toLowerCase()
          .includes(q) ||
        (o.items || []).some((it: any) =>
          String(it.name_fa || "")
            .toLowerCase()
            .includes(q),
        ),
    );

    return { foods: matchedFoods, orders: matchedOrders };
  }, [search, foods, orders]);

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.created_at).toDateString() === todayStr,
    );
    const totalRevenue = orders
      .filter((o) => ["completed", "delivered", "paid"].includes(o.status))
      .reduce(
        (s, o) => s + Number((o as any).final_price || o.total_price || 0),
        0,
      );
    const todayRevenue = todayOrders
      .filter((o) => ["completed", "delivered", "paid"].includes(o.status))
      .reduce(
        (s, o) => s + Number((o as any).final_price || o.total_price || 0),
        0,
      );
    const pending = orders.filter((o) => o.status === "pending").length;

    // بازدید - فیکس: اگر جدول خالی بود 0 نشون نده، پیام بده
    const todayVisits = visits.filter(
      (v) => new Date(v.created_at).toDateString() === todayStr,
    ).length;
    const totalVisits = visits.length;
    const totalQrScans = qrScans.length;

    return {
      totalRevenue,
      todayRevenue,
      pending,
      completed: orders.filter((o) =>
        ["completed", "delivered", "paid"].includes(o.status),
      ).length,
      todayOrders: todayOrders.length,
      totalOrders: orders.length,
      delivery: orders.filter((o) => o.order_type === "delivery").length,
      dineIn: orders.filter((o) => o.order_type === "dine_in" || !o.order_type)
        .length,
      totalVisits,
      todayVisits,
      totalQrScans,
      profit: totalRevenue * 0.4,
    };
  }, [orders, visits, qrScans]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const dayRevenue = orders
        .filter(
          (o) =>
            ["completed", "delivered", "paid"].includes(o.status) &&
            new Date(o.created_at).toDateString() === dayStr,
        )
        .reduce(
          (s, o) => s + Number((o as any).final_price || o.total_price || 0),
          0,
        );
      const dayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === dayStr,
      ).length;
      const dayVisits = visits.filter(
        (v) => new Date(v.created_at).toDateString() === dayStr,
      ).length;
      const dayQr = qrScans.filter(
        (q) => new Date(q.created_at).toDateString() === dayStr,
      ).length;
      return {
        name: d.toLocaleDateString("fa-IR", { weekday: "short" }),
        درآمد: dayRevenue,
        سفارش: dayOrders,
        بازدید: dayVisits,
        اسکن: dayQr,
      };
    });
  }, [orders, visits, qrScans]);

  const statusData = useMemo(() => {
    const groups: Record<string, number> = {};
    orders.forEach((o) => (groups[o.status] = (groups[o.status] || 0) + 1));
    return Object.entries(groups).map(([name, value]) => ({
      name:
        name === "completed"
          ? "تکمیل"
          : name === "pending"
            ? "در انتظار"
            : name,
      value,
    }));
  }, [orders]);

  const foodSales: any = {};
  orders.forEach((o) => {
    o.items?.forEach((item: any) => {
      const key = item.name_fa || "نامشخص";
      if (!foodSales[key]) foodSales[key] = { name: key, qty: 0, revenue: 0 };
      foodSales[key].qty += Number(item.quantity || 1);
      foodSales[key].revenue +=
        Number(item.price || 0) * Number(item.quantity || 1);
    });
  });
  const topFoods = Object.values(foodSales)
    .sort((a: any, b: any) => b.qty - a.qty)
    .slice(0, 5) as any[];
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${theme.page}`}
      >
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className={theme.page}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">
                داشبورد کامل 🚀
              </h1>
              <p className={`text-sm mt-1 ${theme.muted}`}>
                جستجو بین غذاها، مشتریان، شماره‌ها
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
                onClick={fetchAll}
              >
                <RefreshCw size={14} /> بروزرسانی
              </Button>
              <Link href="/admin/add-food">
                <Button
                  size="sm"
                  className="rounded-full bg-emerald-600 text-white gap-2"
                >
                  <Plus size={14} /> غذا
                </Button>
              </Link>
            </div>
          </div>

          {/* موتور جستجو - جدید */}
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو: نام غذا، قیمت، اسم مشتری، شماره موبایل، شماره میز، آدرس..."
              className="pr-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* نتایج جستجو */}
          {searchResults && (
            <Card
              className={`${theme.card} border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  نتایج جستجو برای "{search}"{" "}
                  <Badge className="rounded-full">
                    {searchResults.foods.length + searchResults.orders.length}{" "}
                    مورد
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchResults.foods.length > 0 && (
                  <div>
                    <p className="text-xs font-bold opacity-60 mb-2 flex items-center gap-1">
                      <UtensilsCrossed size={12} /> غذاها (
                      {searchResults.foods.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.foods.slice(0, 6).map((f: any) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10"
                        >
                          <img
                            src={f.image_url || "/bg.jpg"}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">
                              {f.name_fa}
                            </p>
                            <p className="text-xs opacity-60">
                              {f.price?.toLocaleString()} تومان • {f.category}
                            </p>
                          </div>
                          <Link href={`/admin/edit/${f.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full text-xs"
                            >
                              ویرایش
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.orders.length > 0 && (
                  <div>
                    <p className="text-xs font-bold opacity-60 mb-2 flex items-center gap-1">
                      <ShoppingCart size={12} /> سفارشات - مشتریان (
                      {searchResults.orders.length})
                    </p>
                    <div className="space-y-2">
                      {searchResults.orders.slice(0, 6).map((o: any) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs ${o.order_type === "delivery" ? "bg-orange-500" : "bg-emerald-500"}`}
                            >
                              {o.order_type === "delivery" ? "🛵" : "🍽️"}
                            </div>
                            <div>
                              <p className="font-bold text-sm">
                                {o.customer_name}{" "}
                                {o.customer_phone && (
                                  <span
                                    className="text-xs opacity-60"
                                    dir="ltr"
                                  >
                                    {o.customer_phone}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs opacity-60">
                                {o.order_type === "delivery"
                                  ? o.delivery_address?.slice(0, 30)
                                  : `میز ${o.table_number || "-"}`}{" "}
                                •{" "}
                                {new Date(o.created_at).toLocaleDateString(
                                  "fa-IR-u-nu-latn",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">
                              {Number(
                                o.final_price || o.total_price,
                              ).toLocaleString()}{" "}
                              ؋
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              {o.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.foods.length === 0 &&
                  searchResults.orders.length === 0 && (
                    <p className="text-center text-sm opacity-50 py-4">
                      نتیجه‌ای برای "{search}" یافت نشد
                    </p>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${theme.card} border-l-4 border-l-emerald-500`}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs opacity-60 font-bold">درآمد کل</p>
              <p className="text-lg sm:text-xl font-black mt-1">
                {stats.totalRevenue.toLocaleString()} ؋
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                سود: {stats.profit.toLocaleString()} ؋
              </p>
            </CardContent>
          </Card>
          <Card className={`${theme.card} border-l-4 border-l-blue-500`}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs opacity-60 font-bold">امروز</p>
              <p className="text-lg sm:text-xl font-black mt-1">
                {stats.todayRevenue.toLocaleString()} ؋
              </p>
              <p className="text-xs opacity-60 mt-1">
                {stats.todayOrders} سفارش
              </p>
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs opacity-60 font-bold">سفارشات</p>
              <p className="text-lg sm:text-xl font-black mt-1">
                {stats.totalOrders}
              </p>
              <p className="text-xs mt-1">
                <span className="text-amber-600">
                  {stats.pending} در انتظار
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs opacity-60 font-bold">کل غذاها</p>
              <p className="text-lg sm:text-xl font-black mt-1">
                {foods.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className={`${theme.card} ${visits.length === 0 ? "border-amber-500/30 bg-amber-50/20" : "bg-blue-500/5 border-blue-500/20"}`}
          >
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-60 flex items-center gap-1">
                  <Users size={12} /> بازدید سایت{" "}
                  {visits.length === 0 && (
                    <span className="text-amber-600">(نیاز به SQL)</span>
                  )}
                </p>
                <p className="text-2xl font-black mt-1">
                  {stats.totalVisits.toLocaleString()}
                </p>
                <p className="text-xs mt-1">
                  امروز: {stats.todayVisits} • دیروز:{" "}
                  {
                    visits.filter((v) => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      return (
                        new Date(v.created_at).toDateString() ===
                        y.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-60">اسکن QR</p>
                <p className="text-2xl font-black mt-1">
                  {stats.totalQrScans.toLocaleString()}
                </p>
                <p className="text-xs mt-1">
                  تبدیل:{" "}
                  {stats.totalOrders > 0
                    ? (
                        (stats.totalOrders / Math.max(stats.totalQrScans, 1)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-600">
                <QrCode size={20} />
              </div>
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-60">میانگین سبد</p>
                <p className="text-2xl font-black mt-1">
                  {stats.totalOrders > 0
                    ? Math.round(
                        stats.totalRevenue / stats.totalOrders,
                      ).toLocaleString()
                    : 0}{" "}
                  ؋
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* اگر بازدید 0 بود، راهنما */}
        {visits.length === 0 && (
          <Card
            className={`${theme.card} border-amber-500/30 bg-amber-50 dark:bg-amber-950/20`}
          >
            <CardContent className="p-4 text-sm leading-6">
              <p className="font-bold flex items-center gap-2">
                <Eye size={16} /> آمار بازدید نمایش داده نمیشه چون جدول
                site_visits خالیه یا RLS نداره:
              </p>
              <pre
                className="mt-2 text-[11px] bg-black/5 dark:bg-white/5 p-3 rounded-xl overflow-x-auto"
                dir="ltr"
              >
                {`CREATE TABLE IF NOT EXISTS site_visits (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), device_id TEXT, page TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON site_visits FOR ALL USING (true) WITH CHECK (true);

-- و توی app/layout.tsx اضافه کن:
useEffect(() => {
  const id = localStorage.getItem('watandar_device_id') || 'unknown';
  supabase.from('site_visits').insert({ device_id: id, page: window.location.pathname });
}, []);
`}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${theme.card}`}>
            <CardHeader>
              <CardTitle>فروش ۷ روز اخیر</CardTitle>
              <CardDescription>درآمد، سفارش، بازدید</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={last7Days}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-black/10 dark:stroke-white/10"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, direction: "rtl" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="درآمد"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="سفارش"
                    stroke="#3b82f6"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="بازدید"
                    stroke="#8b5cf6"
                    fill="transparent"
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className="text-base">وضعیت سفارشات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${theme.card}`}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>سفارشات اخیر</CardTitle>
                <CardDescription>۵ سفارش آخر</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  همه <ArrowUpRight size={14} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${o.order_type === "delivery" ? "bg-orange-500" : "bg-emerald-500"}`}
                    >
                      {o.order_type === "delivery" ? (
                        <Bike size={16} />
                      ) : (
                        <Store size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {o.customer_name || "مهمان"}
                      </p>
                      <p className="text-xs opacity-60 flex items-center gap-1">
                        <Phone size={10} />
                        {o.customer_phone || "-"} • <Hash size={10} />
                        {o.table_number || "-"} •{" "}
                        {new Date(o.created_at).toLocaleDateString(
                          "fa-IR-u-nu-latn",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black">
                      {Number(
                        (o as any).final_price || o.total_price,
                      ).toLocaleString()}{" "}
                      ؋
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle>پرفروش‌ترین‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topFoods.slice(0, 5).map((f: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/5"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm truncate">{f.name}</p>
                    <p className="text-xs opacity-60">{f.qty} فروش</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white">{f.qty}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
