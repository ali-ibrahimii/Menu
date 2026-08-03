"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Hash,
  MapPin,
  Phone,
  Store,
  Bike,
  Banknote,
  CreditCard,
  Receipt,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useBranch } from "@/contexts/BranchContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

// ========== Device ID - برای پیگیری سفارشات مشتری ==========
const getDeviceId = () => {
  if (typeof window === "undefined") return "device_unknown";
  let id = localStorage.getItem("watandar_device_id");
  if (!id) {
    id = `device_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
    localStorage.setItem("watandar_device_id", id);
  }
  return id;
};

type OrderType = "dine_in" | "delivery";
type PaymentMethod = "cash" | "online";

export default function CartDrawer() {
  const { selectedBranch } = useBranch();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);

  // فرم
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [table, setTable] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = getTotalPrice();
  const deliveryFee = orderType === "delivery" ? 30000 : 0;
  const finalPrice = subtotal + deliveryFee;

  useEffect(() => {
    if (open) {
      setName(localStorage.getItem("watandar_name") || "");
      setPhone(localStorage.getItem("watandar_phone") || "");
      setTable(localStorage.getItem("watandar_table") || "");
      setAddress(localStorage.getItem("watandar_address") || "");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("نام الزامی است");
    if (orderType === "delivery" && !phone.trim())
      return toast.error("شماره تماس الزامی است");
    if (orderType === "delivery" && !address.trim())
      return toast.error("آدرس الزامی است");
    if (orderType === "dine_in" && !table.trim())
      return toast.error("شماره میز الزامی است");
    if (items.length === 0) return toast.error("سبد خالی است");

    setLoading(true);
    try {
      const deviceId = getDeviceId();

      // ذخیره برای دفعه بعد
      localStorage.setItem("watandar_name", name.trim());
      localStorage.setItem("watandar_phone", phone.trim());
      localStorage.setItem("watandar_table", table.trim());
      localStorage.setItem("watandar_address", address.trim());

      const orderPayload = {
        device_id: deviceId,
        customer_name: name.trim(),
        customer_phone: phone.trim() || null,
        order_type: orderType,
        table_number: orderType === "dine_in" ? table.trim() : null,
        delivery_address: orderType === "delivery" ? address.trim() : null,
        branch_id: selectedBranch?.id || null,
        total_price: subtotal,
        delivery_fee: deliveryFee,
        final_price: finalPrice,
        payment_method: paymentMethod,
        payment_status:
          paymentMethod === "cash" ? "pending" : "awaiting_payment",
        status: "pending",
        notes: notes.trim() || null,
        items: items.map((i) => ({
          id: i.id,
          name_fa: i.name_fa,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
      };

      // 1. ثبت در orders
      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();
      if (error) throw error;

      // 2. ثبت در order_items برای حسابداری دقیق (اختیاری)
      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        food_id: i.id,
        food_name_fa: i.name_fa,
        food_price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));
      await supabase.from("order_items").insert(itemsPayload);

      // 3. اگر پرداخت آنلاین باشه
      if (paymentMethod === "online") {
        toast.success("سفارش ثبت شد، انتقال به درگاه...");
        // اینجا به API پرداخت وصل شو
        // const res = await fetch("/api/payment/zarinpal", { method: "POST", body: JSON.stringify({ orderId: order.id, amount: finalPrice }) })
        // const { url } = await res.json();
        // window.location.href = url;
        // فعلا:
        toast.info("پرداخت آنلاین به زودی - سفارش با پرداخت در محل ثبت شد");
      } else {
        toast.success(
          orderType === "delivery"
            ? "سفارش بیرون‌بر ثبت شد 🛵"
            : "سفارش شما ثبت شد 🍽️ - منتظر تایید مدیر",
        );
      }

      clearCart();
      setOpen(false);
      // لینک به صفحه پیگیری سفارشات
      setTimeout(() => {
        window.location.href = `/my-orders?device=${deviceId}`;
      }, 1500);
    } catch (e: any) {
      toast.error("خطا: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-11 w-11"
        >
          <ShoppingCart size={20} />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-emerald-500 rounded-full">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="max-h-[95vh] bg-[#fff8ed] dark:bg-slate-950"
        dir="rtl"
      >
        <div className="mx-auto w-full max-w-lg flex flex-col max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <span className="text-xl font-black">سبد خرید شما</span>
              <Link
                href="/my-orders"
                className="text-xs font-medium text-emerald-600 flex items-center gap-1"
              >
                <Clock size={12} /> سفارشات من
              </Link>
            </DrawerTitle>
            <DrawerDescription>
              {getTotalItems()} آیتم •{" "}
              {orderType === "delivery" ? "ارسال با پیک" : "سرو داخل رستوران"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingCart className="mx-auto opacity-20 mb-3" size={48} />
                <p>سبد خالی است</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  رفتن به منو
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10"
                    >
                      <Image
                        src={item.image_url || "/bg.jpg"}
                        alt={item.name_fa}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover h-14 w-14"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {item.name_fa}
                        </p>
                        <p className="text-xs text-emerald-600 font-bold">
                          {item.price.toLocaleString()} تومان
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full bg-black/5 dark:bg-white/5"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="w-6 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full bg-black/5 dark:bg-white/5"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* نوع سفارش */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
                  {[
                    { key: "dine_in", label: "داخل رستوران", icon: Store },
                    { key: "delivery", label: "بیرون‌بر", icon: Bike },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setOrderType(t.key as OrderType)}
                      className={`h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${orderType === t.key ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      <t.icon size={16} /> {t.label}
                    </button>
                  ))}
                </div>

                {/* فرم */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold flex items-center gap-1">
                      <User size={12} /> نام *
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام شما"
                    />
                  </div>
                  {orderType === "dine_in" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1">
                        <Hash size={12} /> شماره میز *
                      </Label>
                      <Input
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        placeholder="مثلا 12"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <Phone size={12} /> شماره تماس *
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09xx xxx xxxx"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <MapPin size={12} /> آدرس *
                        </Label>
                        <Textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="خیابان، کوچه، پلاک، واحد..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">یادداشت</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="بدون فلفل، ..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* پرداخت */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${paymentMethod === "cash" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900" : "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"}`}
                  >
                    <Banknote size={16} /> نقدی
                  </button>
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${paymentMethod === "online" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"}`}
                  >
                    <CreditCard size={16} /> آنلاین
                  </button>
                </div>

                {/* جمع */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>جمع جزء</span>
                    <span>{subtotal.toLocaleString()} تومان</span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span>ارسال</span>
                      <span>{deliveryFee.toLocaleString()} تومان</span>
                    </div>
                  )}
                  <div className="h-px bg-black/10 dark:bg-white/10" />
                  <div className="flex justify-between font-black text-base">
                    <span>قابل پرداخت</span>
                    <span className="text-emerald-600">
                      {(subtotal + deliveryFee).toLocaleString()} تومان
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="flex-row gap-2 px-4 mb-40">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => setOpen(false)}
            >
              ادامه خرید
            </Button>
            {items.length > 0 && (
              <Button
                className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "ثبت..." : "ثبت سفارش"}
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
