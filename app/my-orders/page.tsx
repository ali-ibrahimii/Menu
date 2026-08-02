"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Phone,
  Hash,
  Receipt,
  CheckCircle2,
  Bike,
  Store,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  device_id: string;
  customer_name: string;
  customer_phone: string | null;
  order_type: "dine_in" | "delivery";
  table_number: string | null;
  delivery_address: string | null;
  total_price: number;
  delivery_fee: number;
  final_price: number;
  status: string;
  payment_method: string;
  payment_status: string;
  items: any[];
  created_at: string;
};

const getDeviceId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("watandar_device_id");
};

const statusMap: any = {
  pending: {
    label: "در انتظار تایید",
    color: "bg-amber-500",
    dot: "bg-amber-500",
  },
  confirmed: { label: "تایید شد", color: "bg-blue-500", dot: "bg-blue-500" },
  preparing: {
    label: "در حال آماده‌سازی",
    color: "bg-purple-500",
    dot: "bg-purple-500",
  },
  ready: {
    label: "آماده تحویل",
    color: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  delivered: { label: "تحویل شد", color: "bg-slate-500", dot: "bg-slate-500" },
  paid: { label: "پرداخت شد", color: "bg-emerald-600", dot: "bg-emerald-600" },
  cancelled: { label: "لغو شد", color: "bg-red-500", dot: "bg-red-500" },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    if (id) fetchOrders(id);
    else setLoading(false);
  }, []);

  const fetchOrders = async (device: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("device_id", device)
      .order("created_at", { ascending: false });
    if (!error) setOrders((data as any) || []);
    setLoading(false);
  };

  const handleRefresh = () => {
    if (deviceId) fetchOrders(deviceId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div
        className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 flex items-center justify-center p-6"
        dir="rtl"
      >
        <Card className="max-w-md w-full rounded-[1.5rem] border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/70">
          <CardContent className="p-8 text-center">
            <Receipt size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">هنوز سفارشی ثبت نکردی</p>
            <p className="text-sm text-slate-500 mt-1">
              سفارشات بر اساس دستگاه ذخیره میشه
            </p>
            <Link href="/menu">
              <Button className="mt-4 w-full rounded-full bg-emerald-600 text-white">
                رفتن به منو
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 p-4 sm:p-6"
      dir="rtl"
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">سفارشات من</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              دستگاه:{" "}
              <span className="font-mono text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                {deviceId.slice(0, 18)}...
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} />
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="rounded-[1.5rem] border-dashed border-2 bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-12 text-center">
              <p className="font-bold">هنوز سفارشی نداری</p>
              <Link href="/menu">
                <Button className="mt-4 rounded-full">مشاهده منو</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusMap[order.status] || statusMap.pending;
              return (
                <Card
                  key={order.id}
                  className="rounded-[1.5rem] border-black/5 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${st.color}`}
                        >
                          {order.order_type === "delivery" ? (
                            <Bike size={18} />
                          ) : (
                            <Store size={18} />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            سفارش{" "}
                            {order.order_type === "delivery"
                              ? "بیرون‌بر"
                              : `میز ${order.table_number || "-"}`}
                            <Badge
                              className={`${st.color} text-white border-0 text-[10px]`}
                            >
                              {st.label}
                            </Badge>
                          </CardTitle>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <Clock size={10} />{" "}
                            {new Date(order.created_at).toLocaleString("fa-IR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-black">
                          {order.final_price?.toLocaleString()} ؋
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.payment_method === "online"
                            ? "آنلاین"
                            : "نقدی"}{" "}
                          • {order.payment_status}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {(order.items || []).map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm bg-black/[0.02] dark:bg-white/[0.03] rounded-xl p-2.5"
                        >
                          <span>
                            {item.name_fa} × {item.quantity}
                          </span>
                          <span className="font-bold">
                            {(item.price * item.quantity).toLocaleString()} ؋
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.delivery_address && (
                      <div className="text-xs flex items-start gap-1.5 text-slate-600 dark:text-slate-400 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                        <MapPin size={14} className="shrink-0 mt-0.5" />{" "}
                        {order.delivery_address}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${st.dot} animate-pulse mt-1`}
                      />
                      <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${st.color} transition-all`}
                          style={{
                            width:
                              order.status === "pending"
                                ? "25%"
                                : order.status === "confirmed"
                                  ? "50%"
                                  : order.status === "preparing"
                                    ? "75%"
                                    : "100%",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
