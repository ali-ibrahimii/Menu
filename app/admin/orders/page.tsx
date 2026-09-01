"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BellRing,
  Bike,
  Store,
  Clock,
  Search,
  Calendar,
  Volume2,
  VolumeX,
  X,
  Trash2,
  Eye,
} from "lucide-react";

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
  is_printed: boolean;
  created_at: string;
  items: any[];
};

type NotificationItem = {
  id: string;
  order: Order;
  read: boolean;
  time: Date;
};

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white",
  card: "rounded-2xl border border-black/5 bg-white/90 dark:border-white/10 dark:bg-slate-900/70 backdrop-blur shadow-sm",
};

const playSound = () => {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.value = 1200;
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.3);
    }, 200);
  } catch {}
};

export default function AdminOrdersWithNotifications() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "dine_in" | "delivery">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed" | "paid"
  >("all");
  const [filterDate, setFilterDate] = useState<
    "all" | "today" | "yesterday" | "week"
  >("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const saved = localStorage.getItem("notif_sound");
    if (saved !== null) setSoundEnabled(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("notif_sound", String(soundEnabled));
  }, [soundEnabled]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setOrders((data as any) || []);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("orders-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);

          const notif: NotificationItem = {
            id: `notif_${Date.now()}`,
            order: newOrder,
            read: false,
            time: new Date(),
          };
          setNotifications((prev) => [notif, ...prev]);

          if (soundEnabled) playSound();
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

          toast(`🔔 سفارش جدید - ${newOrder.customer_name}`, {
            description: `${newOrder.order_type === "delivery" ? "بیرون‌بر" : `میز ${newOrder.table_number || "-"}`} • ${Number(newOrder.final_price || 0).toLocaleString()} ؋`,
            duration: 8000,
            action: { label: "مشاهده", onClick: () => setSelected(newOrder) },
          });

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(`سفارش جدید - ${newOrder.customer_name}`, {
              body: `${newOrder.order_type === "delivery" ? "بیرون‌بر" : `میز ${newOrder.table_number}`} - ${Number(newOrder.final_price).toLocaleString()} تومان`,
              icon: "/logo1.png",
              tag: newOrder.id,
            });
          }

          const originalTitle = document.title;
          let blink = 0;
          const interval = setInterval(() => {
            document.title =
              blink % 2 === 0
                ? `🔔 سفارش جدید! - ${newOrder.customer_name}`
                : originalTitle;
            blink++;
            if (blink > 10) {
              clearInterval(interval);
              document.title = originalTitle;
            }
          }, 800);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const filteredOrders = useMemo(() => {
    let res = [...orders];
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (o) =>
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q) ||
          o.table_number?.includes(q) ||
          o.id.toLowerCase().includes(q),
      );
    }
    if (filterType !== "all")
      res = res.filter((o) => o.order_type === filterType);
    if (filterStatus !== "all")
      res = res.filter((o) => o.status === filterStatus);
    if (filterDate !== "all") {
      const now = new Date();
      res = res.filter((o) => {
        const d = new Date(o.created_at);
        if (filterDate === "today")
          return d.toDateString() === now.toDateString();
        if (filterDate === "yesterday") {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          return d.toDateString() === y.toDateString();
        }
        if (filterDate === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        return true;
      });
    }
    return res;
  }, [orders, search, filterType, filterStatus, filterDate]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Order[]> = {
      امروز: [],
      دیروز: [],
      "این هفته": [],
      قدیمی‌تر: [],
    };
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at);
      if (d.toDateString() === now.toDateString()) groups["امروز"].push(o);
      else if (d.toDateString() === yesterday.toDateString())
        groups["دیروز"].push(o);
      else if (d >= weekAgo) groups["این هفته"].push(o);
      else groups["قدیمی‌تر"].push(o);
    });
    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [filteredOrders]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const handleApprove = async (order: Order, next: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", order.id);
    if (!error) {
      toast.success(`وضعیت: ${next}`);
      fetchOrders();
      if (next === "paid") {
        setSelected(order);
        setTimeout(() => {
          const el = document.getElementById("receipt-hidden");
          if (el) {
            const w = window.open("", "_blank", "width=380,height=600");
            if (w) {
              w.document.write(
                `<html><head><style>@page{size:80mm auto;margin:0}body{margin:0;padding:10px;font-family:Tahoma;background:white;color:black}</style></head><body onload="window.print();window.close()">${el.innerHTML}</body></html>`,
              );
              w.document.close();
            }
          }
        }, 300);
      }
    }
  };

  return (
    <div dir="rtl" className={`${theme.page} p-3 sm:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              سفارشات{" "}
              <span className="text-sm font-normal opacity-60">
                ({filteredOrders.length})
              </span>
            </h1>
            <p className="text-sm opacity-60">
              صندوق‌دار: نوتیفیکیشن لحظه‌ای فعاله
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                className="rounded-full gap-2"
                onClick={() => setShowNotifPanel(!showNotifPanel)}
              >
                <BellRing
                  size={18}
                  className={
                    unreadCount > 0 ? "animate-bounce text-amber-500" : ""
                  }
                />
                نوتیفیکیشن
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {showNotifPanel && (
                <Card className="absolute left-0 sm:left-auto sm:right-0 top-12 z-50 w-[90vw] max-w-[380px] sm:w-[380px] rounded-2xl shadow-2xl border-black/10 dark:border-white/10 max-h-[70vh] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-base">
                      اعلان‌ها ({notifications.length})
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllRead}
                      >
                        خوانده شد
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowNotifPanel(false)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-2 p-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm opacity-50 py-8">
                        اعلانی نیست
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border flex gap-3 ${!n.read ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500/20" : "bg-white dark:bg-slate-900 border-black/5 dark:border-white/10"}`}
                        >
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0 ${n.order.order_type === "delivery" ? "bg-orange-500" : "bg-emerald-500"}`}
                          >
                            {n.order.order_type === "delivery" ? (
                              <Bike size={16} />
                            ) : (
                              <Store size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">
                              {n.order.customer_name} •{" "}
                              {n.order.order_type === "delivery"
                                ? "بیرون‌بر"
                                : `میز ${n.order.table_number}`}
                            </p>
                            <p className="text-xs opacity-70 truncate">
                              {Number(n.order.final_price).toLocaleString()} ؋ -{" "}
                              {new Date(n.time).toLocaleTimeString(
                                "fa-IR-u-nu-latn",
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 rounded-full text-xs"
                            onClick={() => {
                              setSelected(n.order);
                              setShowNotifPanel(false);
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id ? { ...x, read: true } : x,
                                ),
                              );
                            }}
                          >
                            دیدن
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-black/5 dark:border-white/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-red-500 gap-1"
                        onClick={clearNotifications}
                      >
                        <Trash2 size={12} /> پاک کردن همه
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1"
              onClick={fetchOrders}
            >
              <Clock size={14} /> بروزرسانی
            </Button>
          </div>
        </div>

        <Card className={`${theme.card} p-3 sm:p-4`}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو نام، تلفن، میز..."
                  className="pr-9 rounded-full h-9 text-sm bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="opacity-50" />
                <span className="text-xs font-bold opacity-60">تاریخ:</span>
                {[
                  { k: "all", l: "همه" },
                  { k: "today", l: "امروز" },
                  { k: "yesterday", l: "دیروز" },
                  { k: "week", l: "هفته" },
                ].map((f) => (
                  <button
                    key={f.k}
                    onClick={() => setFilterDate(f.k as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterDate === f.k ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-black/5 dark:bg-white/5"}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Bike size={12} className="opacity-50" />
                <span className="text-xs font-bold opacity-60">نوع:</span>
                {[
                  { k: "all", l: "همه" },
                  { k: "dine_in", l: "داخل 🍽️" },
                  { k: "delivery", l: "بیرون‌بر 🛵" },
                ].map((f) => (
                  <button
                    key={f.k}
                    onClick={() => setFilterType(f.k as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${filterType === f.k ? "bg-emerald-600 text-white" : "bg-black/5 dark:bg-white/5"}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ms-2">
                <span className="text-xs font-bold opacity-60">وضعیت:</span>
                {[
                  { k: "all", l: "همه" },
                  { k: "pending", l: "در انتظار" },
                  { k: "confirmed", l: "تایید" },
                  { k: "paid", l: "پرداخت" },
                ].map((f) => (
                  <button
                    key={f.k}
                    onClick={() => setFilterStatus(f.k as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${filterStatus === f.k ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/5"}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {groupedByDate.map(([dateLabel, ordersInDate]) => (
            <div key={dateLabel} className="space-y-3">
              <h3 className="font-black text-sm flex items-center gap-2 sticky top-0 bg-[#fff8ed]/80 dark:bg-slate-950/80 backdrop-blur py-2 z-10">
                <Calendar size={14} /> {dateLabel}{" "}
                <Badge variant="secondary" className="rounded-full text-xs">
                  {ordersInDate.length}
                </Badge>
              </h3>
              {[
                { type: "dine_in", label: "داخل رستوران 🍽️", icon: Store },
                { type: "delivery", label: "بیرون‌بر 🛵", icon: Bike },
              ].map((group) => {
                const list = ordersInDate.filter(
                  (o) => o.order_type === group.type,
                );
                if (list.length === 0) return null;
                return (
                  <div
                    key={group.type}
                    className="ms-2 border-r-2 border-black/5 dark:border-white/10 pr-3 space-y-2"
                  >
                    <p className="text-xs font-bold opacity-60 flex items-center gap-1">
                      <group.icon size={12} /> {group.label} ({list.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {list.map((order) => (
                        <Card
                          key={order.id}
                          className={`rounded-2xl border transition-all hover:shadow-md ${order.status === "pending" ? "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10" : theme.card}`}
                        >
                          <CardContent className="p-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0 ${order.order_type === "delivery" ? "bg-orange-500" : "bg-emerald-500"}`}
                              >
                                {order.order_type === "delivery" ? (
                                  <Bike size={16} />
                                ) : (
                                  <Store size={16} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate">
                                  {order.customer_name}{" "}
                                  <span className="text-xs opacity-50">
                                    •{" "}
                                    {order.order_type === "delivery"
                                      ? order.customer_phone
                                      : `میز ${order.table_number}`}
                                  </span>
                                </p>
                                <p className="text-xs opacity-60 truncate">
                                  {order.final_price?.toLocaleString()} ؋ •{" "}
                                  {new Date(
                                    order.created_at,
                                  ).toLocaleTimeString("fa-IR-u-nu-latn")}{" "}
                                  • {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 rounded-full"
                                onClick={() => setSelected(order)}
                              >
                                <Eye size={12} />
                              </Button>
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="h-7 rounded-full bg-blue-600 text-white text-xs px-2"
                                  onClick={() =>
                                    handleApprove(order, "confirmed")
                                  }
                                >
                                  تایید
                                </Button>
                              )}
                              {order.status !== "paid" &&
                                order.status !== "cancelled" && (
                                  <Button
                                    size="sm"
                                    className="h-7 rounded-full bg-emerald-600 text-white text-xs px-2"
                                    onClick={() => handleApprove(order, "paid")}
                                  >
                                    پرداخت
                                  </Button>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {groupedByDate.length === 0 && (
            <Card className="rounded-2xl border-dashed border-2 py-16 text-center bg-white/50 dark:bg-slate-900/50">
              <p className="opacity-50">سفارشی با این فیلتر نیست</p>
            </Card>
          )}
        </div>

        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div id="receipt-hidden">
            {selected && (
              <div
                style={{
                  width: "300px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  padding: "8px",
                  direction: "rtl",
                  background: "white",
                  color: "black",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    borderBottom: "2px dashed black",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontWeight: "900", fontSize: "16px" }}>
                    وطندار
                  </div>
                  <div>سفارش: {selected.id.slice(0, 8)}</div>
                  <div>{new Date().toLocaleString("fa-IR-u-nu-latn")}</div>
                </div>
                <div>مشتری: {selected.customer_name}</div>
                <div>
                  نوع:{" "}
                  {selected.order_type === "delivery"
                    ? "بیرون‌بر"
                    : `میز ${selected.table_number}`}
                </div>
                {selected.delivery_address && (
                  <div>آدرس: {selected.delivery_address}</div>
                )}
                <div
                  style={{
                    borderTop: "1px dashed black",
                    borderBottom: "1px dashed black",
                    margin: "8px 0",
                    padding: "6px 0",
                  }}
                >
                  {(selected.items || []).map((it: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {it.name_fa} x{it.quantity}
                      </span>
                      <span>{(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                  }}
                >
                  <span>جمع</span>
                  <span>{Number(selected.final_price).toLocaleString()} ؋</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
