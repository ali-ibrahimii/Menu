// app/admin/page.tsx
"use client";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Food } from "@/types";

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

export default function AdminPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // دریافت غذاها
  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("foods").select("*");

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("خطا در دریافت لیست غذاها");
    } finally {
      setLoading(false);
    }
  };

  // دریافت سفارشات از دیتابیس
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*");

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
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

  if (loading && foods.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold my-2 text-4xl">خوش آمدید </h1>

      <p className="text-gray-600 mb-8 text-base">
        این پنل مدیریت رستوران شماست. از منوی راست برای دسترسی به بخش‌های مختلف
        استفاده کنید.
      </p>

      {/* کارت آمار */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-lg border-0 rounded-xl">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل غذاها</p>
                <p className="text-3xl font-bold">{foods.length}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <div className="w-8 h-8 border">
                  <img src="/restaurant.png" alt="" />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 text-[11px]">
              <span className="text-green-600">
                موجود: {foods.filter((f) => f.is_available).length}
              </span>
              <span className="text-red-600">
                ناموجود: {foods.filter((f) => !f.is_available).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل سفارشات</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <div className="w-8 h-8 border">
                  <img src="/orders.png" alt="" />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 text-[11px]">
              <span className="text-green-600">
                تکمیل شده: {stats.completed}
              </span>
              <span className="text-red-600">در انتظار: {stats.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
