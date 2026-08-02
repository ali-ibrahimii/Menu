"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Printer,
  Bike,
  Store,
  Phone,
  MapPin,
  Hash,
  Eye,
  X,
} from "lucide-react";
import { Receipt80mm, printReceiptDirect } from "@/components/Receipt80mm"; // فایل بالا رو بذار توی components

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
  is_printed: boolean;
  created_at: string;
};

const statusColors: any = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  ready: "bg-emerald-500",
  paid: "bg-emerald-600",
};

export default function AdminOrdersPrintFixed() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"pending" | "unprinted" | "all">(
    "pending",
  );

  // برای react-to-print نیازی نیست - ما از window.open استفاده میکنیم که سفید نمیده

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as any) || []);
  };

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          toast.info("سفارش جدید 🔔");
          fetchOrders();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const updateStatus = async (order: Order, nextStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success(`وضعیت شد: ${nextStatus}`);

    // اگر پرداخت شد، خودکار چاپ کن
    if (nextStatus === "paid" || nextStatus === "confirmed") {
      setSelected(order);
      setTimeout(() => handleBrowserPrint(), 400);
      setTimeout(() => handleThermalPrint(order), 800);
    }
    fetchOrders();
  };

  // چاپ مرورگر - فیکس صفحه سفید
  const handleBrowserPrint = () => {
    if (!selected) return toast.error("اول یک سفارش انتخاب کن");
    // از تابع مستقیم استفاده می‌کنیم که هیچ وقت سفید نمیده
    // @ts-ignore
    const el = document.getElementById("print-receipt-hidden");
    if (!el) {
      toast.error("رسید مخفی پیدا نشد - صفحه را رفرش کن");
      return;
    }
    // فراخوانی تابع چاپ
    const win = window.open("", "_blank", "width=380,height=600");
    if (!win) {
      toast.error("مرورگر پاپ‌آپ را بلاک کرده - لطفا Allow Popups بزن");
      return;
    }
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { margin:0; padding:10px; font-family: Tahoma, monospace; background:white; color:black; }
        * { -webkit-print-color-adjust: exact; }
      </style></head>
      <body onload="setTimeout(()=>{window.print(); window.close();}, 200)">
        ${el.innerHTML}
      </body></html>
    `);
    win.document.close();
  };

  // چاپ حرارتی شبکه‌ای
  const handleThermalPrint = async (orderToPrint: Order) => {
    try {
      const res = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderToPrint }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`به پرینتر ${data.printer || ""} ارسال شد ✅`);
        await supabase
          .from("orders")
          .update({ is_printed: true, printed_at: new Date().toISOString() })
          .eq("id", orderToPrint.id);
        fetchOrders();
      } else {
        toast.error("پرینتر خطا: " + (data.error || "نامشخص"));
      }
    } catch {
      toast.error("پرینتر در دسترس نیست - از چاپ مرورگر استفاده کن");
    }
  };

  const filtered = orders.filter((o) => {
    if (filter === "pending") return o.status === "pending";
    if (filter === "unprinted") return !o.is_printed;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fff8ed] dark:bg-slate-950 p-4" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black">سفارشات + چاپ فیکس</h1>
          <div className="flex gap-2">
            {["pending", "unprinted", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold ${filter === f ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white dark:bg-slate-900 border"}`}
              >
                {f === "pending"
                  ? "در انتظار"
                  : f === "unprinted"
                    ? "چاپ‌نشده"
                    : "همه"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((o) => (
              <Card
                key={o.id}
                className={`rounded-2xl ${!o.is_printed ? "border-amber-500/30 bg-amber-50/50" : "bg-white"}`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${statusColors[o.status] || "bg-slate-500"}`}
                    >
                      {o.order_type === "delivery" ? (
                        <Bike size={16} />
                      ) : (
                        <Store size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {o.customer_name} -{" "}
                        {o.order_type === "delivery"
                          ? "بیرون‌بر"
                          : `میز ${o.table_number}`}
                      </p>
                      <p className="text-xs opacity-60">
                        {o.final_price?.toLocaleString()} ؋ •{" "}
                        {o.is_printed ? "چاپ شد" : "چاپ‌نشده"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full"
                      onClick={() => setSelected(o)}
                    >
                      <Eye size={12} />
                    </Button>
                    {o.status === "pending" && (
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-blue-600 text-white"
                        onClick={() => updateStatus(o, "confirmed")}
                      >
                        تایید
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="h-8 rounded-full bg-emerald-600 text-white"
                      onClick={() => updateStatus(o, "paid")}
                    >
                      پرداخت + چاپ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            {selected ? (
              <Card className="rounded-[1.5rem] sticky top-4">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-base">پیش‌نمایش فاکتور</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setSelected(null)}
                  >
                    <X size={14} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* این بخش مخفی برای چاپ - مهم: display:none نباشه، visibility hidden باشه تا سفید نده */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      top: "-9999px",
                    }}
                  >
                    <div id="print-receipt-hidden">
                      <Receipt80mm order={selected} />
                    </div>
                  </div>

                  {/* نمایش کاربر */}
                  <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl flex justify-center">
                    <Receipt80mm order={selected} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="h-12 rounded-xl gap-2"
                      onClick={handleBrowserPrint}
                    >
                      <Printer size={16} /> چاپ مرورگر
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl gap-2"
                      onClick={() => handleThermalPrint(selected)}
                    >
                      <Printer size={16} /> حرارتی
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[1.5rem] border-dashed border-2 h-60 flex items-center justify-center">
                <p className="text-sm opacity-50">سفارش انتخاب کن</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
