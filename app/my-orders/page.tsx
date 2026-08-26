"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Phone,
  Hash,
  Bike,
  Store,
  ArrowLeft,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  notes: string | null;
  created_at: string;
};

const getDeviceId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("watandar_device_id");
};

const statusLabel: Record<string, string> = {
  pending: "در انتظار تایید",
  confirmed: "تایید شد",
  preparing: "در حال پخت",
  ready: "آماده",
  delivered: "تحویل شد",
  paid: "پرداخت شد",
  cancelled: "لغو شد",
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
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("device_id", device)
      .order("created_at", { ascending: false });
    setOrders((data as any) || []);
    setLoading(false);
  };

  // Realtime ساده
  useEffect(() => {
    if (!deviceId) return;
    const ch = supabase
      .channel(`orders-simple-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((p) => [payload.new as Order, ...p]);
            toast.success("سفارش جدید ثبت شد");
          }
          if (payload.eventType === "UPDATE") {
            setOrders((p) =>
              p.map((o) =>
                o.id === (payload.new as Order).id ? (payload.new as Order) : o,
              ),
            );
            const s = (payload.new as Order).status;
            toast.message(`وضعیت: ${statusLabel[s] || s}`);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [deviceId]);

  const handlePrint = (order: Order) => {
    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    const itemsHtml = (order.items || [])
      .map(
        (it: any) =>
          `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>${it.name_fa} x${it.quantity}</span><span>${(it.price * it.quantity).toLocaleString()}</span></div>`,
      )
      .join("");
    win.document.write(`
      <html><head><title>فاکتور ${order.id.slice(0, 8)}</title>
      <style>
        @page{size:80mm auto;margin:5mm} body{font-family:Tahoma,monospace;margin:0;padding:10px;color:#000;background:#fff;direction:rtl}
        .line{border-top:1px dashed #000;margin:8px 0}
      </style></head>
      <body>
        <div style="text-align:center;font-weight:900">رستوران وطندار<br><span style="font-size:10px">VATANDAR</span></div>
        <div class="line"></div>
        <div style="font-size:12px;line-height:1.8">
          <div>شماره: ${order.id.slice(0, 8)}</div>
          <div>تاریخ: ${new Date(order.created_at).toLocaleString("fa-IR")}</div>
          <div>مشتری: ${order.customer_name}</div>
          <div>نوع: ${order.order_type === "delivery" ? "بیرون‌بر" : "میز " + (order.table_number || "-")}</div>
          ${order.customer_phone ? `<div>تماس: ${order.customer_phone}</div>` : ""}
          ${order.delivery_address ? `<div>آدرس: ${order.delivery_address}</div>` : ""}
        </div>
        <div class="line"></div>
        ${itemsHtml}
        <div class="line"></div>
        <div style="font-size:12px">
          <div style="display:flex;justify-content:space-between"><span>جمع جزء</span><span>${Number(order.total_price).toLocaleString()}</span></div>
          ${order.delivery_fee ? `<div style="display:flex;justify-content:space-between"><span>ارسال</span><span>${Number(order.delivery_fee).toLocaleString()}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-weight:900;font-size:14px;margin-top:4px"><span>قابل پرداخت</span><span>${Number(order.final_price).toLocaleString()} ؋</span></div>
        </div>
        <div class="line"></div>
        <div style="text-align:center;font-size:10px;margin-top:10px">با تشکر<br>وضعیت: ${statusLabel[order.status] || order.status}</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div
        className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 flex items-center justify-center p-6"
        dir="rtl"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-8 text-center max-w-md w-full border border-black/5 dark:border-white/10">
          <p className="font-bold">سفارشی ثبت نشده</p>
          <Link href="/menu">
            <Button className="mt-4 w-full rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              منو
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#faf6ef] dark:bg-slate-950 text-slate-900 dark:text-white"
      dir="rtl"
    >
      <div className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        {/* هدر ساده */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/menu"
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="rotate-180" />
          </Link>
          <div className="text-center">
            <h1 className="font-black text-lg">فاکتورهای من</h1>
            <p className="text-[11px] opacity-50 font-mono">
              {deviceId.slice(0, 16)}...
            </p>
          </div>
          <div className="h-10 w-10" />
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-black/5 dark:border-white/10 p-12 text-center">
            <p className="font-bold">فاکتوری نیست</p>
            <p className="text-sm opacity-60 mt-1">هنوز سفارش ثبت نکردی</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-[1.25rem] border border-black/10 dark:border-white/10 shadow-sm overflow-hidden"
              >
                {/* هدر فاکتور */}
                <div className="bg-slate-50 dark:bg-white/[0.03] px-5 py-3 border-b border-black/5 dark:border-white/10 flex justify-between items-start">
                  <div>
                    <p className="font-black text-sm tracking-widest">
                      FAKTOR #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] opacity-60 flex items-center gap-1 mt-1">
                      <Clock size={10} />{" "}
                      {new Date(order.created_at).toLocaleString("fa-IR")}
                    </p>
                  </div>
                  <div className="text-left">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${order.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-700" : order.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-blue-500/10 border-blue-500/20 text-blue-700"}`}
                    >
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* اطلاعات */}
                <div className="px-5 py-3 space-y-1.5 text-[13px] border-b border-dashed border-black/10 dark:border-white/10">
                  <div className="flex justify-between">
                    <span className="opacity-60">مشتری</span>
                    <span className="font-bold">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60 flex items-center gap-1">
                      {order.order_type === "delivery" ? (
                        <>
                          <Bike size={12} /> نوع
                        </>
                      ) : (
                        <>
                          <Store size={12} /> نوع
                        </>
                      )}
                    </span>
                    <span>
                      {order.order_type === "delivery"
                        ? "بیرون‌بر"
                        : `داخل - میز ${order.table_number || "-"}`}
                    </span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex justify-between">
                      <span className="opacity-60 flex items-center gap-1">
                        <Phone size={12} /> تماس
                      </span>
                      <span dir="ltr">{order.customer_phone}</span>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div className="flex justify-between gap-4">
                      <span className="opacity-60 flex items-center gap-1 shrink-0">
                        <MapPin size={12} /> آدرس
                      </span>
                      <span className="text-right text-xs max-w-[60%]">
                        {order.delivery_address}
                      </span>
                    </div>
                  )}
                  {order.table_number && order.order_type === "dine_in" && (
                    <div className="flex justify-between">
                      <span className="opacity-60 flex items-center gap-1">
                        <Hash size={12} /> میز
                      </span>
                      <span>{order.table_number}</span>
                    </div>
                  )}
                </div>

                {/* آیتم‌ها مثل فاکتور */}
                <div className="px-5 py-3">
                  <div className="space-y-0">
                    <div className="flex justify-between text-[11px] font-bold opacity-40 pb-2 border-b border-black/5 dark:border-white/5">
                      <span>شرح</span>
                      <span className="flex gap-6">
                        <span>تعداد</span>
                        <span>مبلغ</span>
                      </span>
                    </div>
                    {(order.items || []).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between py-2.5 text-[13px] border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
                      >
                        <span className="flex-1 truncate font-medium">
                          {item.name_fa}
                        </span>
                        <span className="flex gap-6 shrink-0">
                          <span className="w-6 text-center opacity-60">
                            x{item.quantity}
                          </span>
                          <span className="w-20 text-left font-bold">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* جمع */}
                <div className="bg-slate-50 dark:bg-white/[0.03] px-5 py-3 space-y-1.5 text-[13px] border-t border-black/5 dark:border-white/10">
                  <div className="flex justify-between">
                    <span className="opacity-60">جمع جزء</span>
                    <span>{Number(order.total_price).toLocaleString()} ؋</span>
                  </div>
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-60">ارسال</span>
                      <span>
                        {Number(order.delivery_fee).toLocaleString()} ؋
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-[15px] pt-1.5 border-t border-dashed border-black/10 dark:border-white/10">
                    <span>قابل پرداخت</span>
                    <span>{Number(order.final_price).toLocaleString()} ؋</span>
                  </div>
                  <div className="flex justify-between text-[11px] opacity-50">
                    <span>
                      {order.payment_method === "online" ? "آنلاین" : "نقدی"} •{" "}
                      {order.payment_status}
                    </span>
                    <span>{order.notes ? `یادداشت: ${order.notes}` : ""}</span>
                  </div>
                </div>

                {/* اکشن */}
                <div className="p-3 bg-white dark:bg-slate-900 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full h-9 text-xs gap-1"
                    onClick={() => handlePrint(order)}
                  >
                    <Printer size={12} /> چاپ فاکتور
                  </Button>
                  <div className="flex-1 text-center text-[11px] opacity-40 flex items-center justify-center">
                    #{order.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
