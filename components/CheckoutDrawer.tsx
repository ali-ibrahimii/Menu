"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  ShoppingCart,
  MapPin,
  User,
  Hash,
  Phone,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Store,
  Package,
} from "lucide-react";

const theme = {
  page: "bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-2xl border border-black/5 bg-white/90 dark:border-white/10 dark:bg-slate-900/70 backdrop-blur shadow-sm",
  mutedText: "text-slate-600 dark:text-slate-400",
};

export type OrderType = "dine_in" | "delivery" | "inter_city";
export type PaymentMethod = "cash" | "online";

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  deliveryAddress?: string;
  city?: string;
  notes?: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
}

export default function CheckoutDrawer({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const { language } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [step, setStep] = useState<"type" | "info" | "pay" | "done">("type");
  const [loading, setLoading] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
    deliveryAddress: "",
    city: "",
    notes: "",
  });

  const subtotal = getTotalPrice();
  const hasStoreItems = items.some((i) => i.is_store_item);

  const t = {
    fa: {
      title: "تکمیل سفارش",
      chooseType: "نوع سفارش را انتخاب کنید",
      dineIn: "داخل رستوران 🍽️",
      delivery: "بیرون‌بر / ارسال 🛵",
      interCity: "ارسال به شهر دیگر 📦",
      next: "ادامه",
      customerInfo: "اطلاعات مشتری",
      name: "نام و نام خانوادگی",
      phone: "شماره تماس",
      table: "شماره میز (اختیاری)",
      address: "آدرس دقیق",
      city: "نام شهر مقصد",
      notes: "یادداشت سفارش (اختیاری)",
      paymentTitle: "روش پرداخت",
      cash: "نقدی 💵",
      online: "درگاه پرداخت آنلاین 💳",
      submitOrder: "ثبت سفارش",
      submitSuccess: "سفارش با موفقیت ثبت شد",
      kitchenReceipt: "رسید آشپزخانه",
      customerReceipt: "رسید مشتری",
      back: "بازگشت",
      total: "جمع کل",
    },
    en: {
      title: "Complete Order",
      chooseType: "Choose order type",
      dineIn: "Dine In 🍽️",
      delivery: "Takeaway / Delivery 🛵",
      interCity: "Ship to Another City 📦",
      next: "Next",
      customerInfo: "Customer Info",
      name: "Full Name",
      phone: "Phone Number",
      table: "Table Number (optional)",
      address: "Full Address",
      city: "Destination City",
      notes: "Order Notes (optional)",
      paymentTitle: "Payment Method",
      cash: "Cash 💵",
      online: "Online Payment 💳",
      submitOrder: "Submit Order",
      submitSuccess: "Order submitted successfully",
      kitchenReceipt: "Kitchen Receipt",
      customerReceipt: "Customer Receipt",
      back: "Back",
      total: "Total",
    },
    ar: {
      title: "إكمال الطلب",
      chooseType: "اختر نوع الطلب",
      dineIn: "داخل المطعم 🍽️",
      delivery: "توصيل / طلب خارجي 🛵",
      interCity: "إرسال إلى مدينة أخرى 📦",
      next: "التالي",
      customerInfo: "معلومات العميل",
      name: "الاسم الكامل",
      phone: "رقم الهاتف",
      table: "رقم الطاولة (اختياري)",
      address: "العنوان الكامل",
      city: "اسم المدينة المقصد",
      notes: "ملاحظات الطلب (اختياري)",
      paymentTitle: "طريقة الدفع",
      cash: "نقداً 💵",
      online: "دفع عبر الإنترنت 💳",
      submitOrder: "تأكيد الطلب",
      submitSuccess: "تم تقديم الطلب بنجاح",
      kitchenReceipt: "إيصال المطبخ",
      customerReceipt: "إيصال العميل",
      back: "رجوع",
      total: "المجموع الكلي",
    },
  };

  const dict = (t as any)[language] || t.fa;

  const handleSubmit = async () => {
    if (!form.customerName.trim()) {
      toast.error("نام مشتری الزامی است");
      return;
    }
    if (!form.customerPhone.trim()) {
      toast.error("شماره تماس الزامی است");
      return;
    }
    if ((orderType === "delivery" || orderType === "inter_city") && !form.deliveryAddress.trim()) {
      toast.error("آدرس الزامی است");
      return;
    }
    if (orderType === "inter_city" && !form.city.trim()) {
      toast.error("نام شهر مقصد الزامی است");
      return;
    }
    if (items.length === 0) {
      toast.error("سبد خرید خالی است");
      return;
    }

    setLoading(true);

    // ایجاد دستگاه آیدی اگر نبود
    let deviceId = localStorage.getItem("watandar_device_id");
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("watandar_device_id", deviceId);
    }

    const deliveryFee = orderType === "inter_city" ? 50000 : orderType === "delivery" ? 30000 : 0;
    const finalPrice = subtotal + deliveryFee;

    const orderPayload = {
      device_id: deviceId,
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim(),
      table_number: orderType === "dine_in" ? form.tableNumber.trim() || null : null,
      delivery_address: (orderType === "delivery" || orderType === "inter_city") ? form.deliveryAddress.trim() || null : null,
      order_type: orderType,
      total_price: subtotal,
      delivery_fee: deliveryFee,
      final_price: finalPrice,
      status: "pending",
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cash" ? "pending" : "pending",
      is_printed: false,
      items: items.map((i) => ({
        id: i.id,
        name_fa: i.name_fa,
        name_ar: i.name_ar || null,
        name_en: i.name_en || null,
        price: i.price,
        quantity: i.quantity,
        notes: i.notes || null,
        is_store_item: !!i.is_store_item,
        image_url: i.image_url,
      })),
      notes: form.notes.trim() || null,
      inter_city_city: orderType === "inter_city" ? form.city.trim() : null,
    };

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        toast.error("خطا در ثبت سفارش");
      } else {
        toast.success("سفارش با موفقیت ثبت شد");
        clearCart();
        setStep("done");
        onSuccess?.();
      }
    } catch (e: any) {
      console.error("Submit error:", e);
      toast.error("خطا در ثبت سفارش");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "type":
        return (
          <div className="space-y-3">
            <h3 className="font-black text-lg">{dict.chooseType}</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setOrderType("dine_in"); setStep("info"); }}
                className={`text-right p-4 rounded-2xl border-2 transition-all ${theme.card} hover:border-emerald-500 hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Store size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{dict.dineIn}</p>
                    <p className="text-xs opacity-60">نام + شماره میز</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setOrderType("delivery"); setStep("info"); }}
                className={`text-right p-4 rounded-2xl border-2 transition-all ${theme.card} hover:border-orange-500 hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{dict.delivery}</p>
                    <p className="text-xs opacity-60">آدرس + شماره تماس</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setOrderType("inter_city"); setStep("info"); }}
                className={`text-right p-4 rounded-2xl border-2 transition-all ${theme.card} hover:border-blue-500 hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{dict.interCity}</p>
                    <p className="text-xs opacity-60">شهر مقصد + آدرس + ارسال</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case "info":
        return (
          <div className="space-y-4">
            <h3 className="font-black text-lg">{dict.customerInfo}</h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="cn">{dict.name}</Label>
                <Input
                  id="cn"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="علی احمدی"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="cp">{dict.phone}</Label>
                <Input
                  id="cp"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="0912..."
                  className="mt-1 rounded-xl"
                />
              </div>

              {orderType === "dine_in" && (
                <div>
                  <Label htmlFor="tn">{dict.table}</Label>
                  <Input
                    id="tn"
                    value={form.tableNumber}
                    onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                    placeholder="مثلاً ۵"
                    className="mt-1 rounded-xl"
                  />
                </div>
              )}

              {(orderType === "delivery" || orderType === "inter_city") && (
                <>
                  <div>
                    <Label htmlFor="ad">{dict.address}</Label>
                    <Textarea
                      id="ad"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                      placeholder="تهران، خیابان ولیعصر، ساختمان ..."
                      className="mt-1 rounded-xl min-h-[80px]"
                    />
                  </div>
                </>
              )}

              {orderType === "inter_city" && (
                <div>
                  <Label htmlFor="city">{dict.city}</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="مثلاً اصفهان"
                    className="mt-1 rounded-xl"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">{dict.notes}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="مثلاً بدون فلفل"
                  className="mt-1 rounded-xl min-h-[60px]"
                />
              </div>
            </div>

            {hasStoreItems && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Package size={16} />
                <span>در سفارش شما محصولات فروشگاهی وجود دارد. ارسال به شهر دیگر فعال است.</span>
              </div>
            )}
          </div>
        );

      case "pay":
        return (
          <div className="space-y-4">
            <h3 className="font-black text-lg">{dict.paymentTitle}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  paymentMethod === "cash"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : `${theme.card} hover:border-emerald-400`
                }`}
              >
                <Banknote size={24} className="mx-auto mb-2 text-emerald-600" />
                <p className="font-bold text-sm">{dict.cash}</p>
              </button>
              <button
                onClick={() => setPaymentMethod("online")}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  paymentMethod === "online"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : `${theme.card} hover:border-blue-400`
                }`}
              >
                <CreditCard size={24} className="mx-auto mb-2 text-blue-600" />
                <p className="font-bold text-sm">{dict.online}</p>
              </button>
            </div>

            {/* خلاصه */}
            <div className={`${theme.card} p-4 space-y-2`}>
              <div className="flex justify-between text-sm">
                <span>جمع جزء</span>
                <span>{subtotal.toLocaleString()} ؋</span>
              </div>
              {(orderType === "delivery" || orderType === "inter_city") && (
                <div className="flex justify-between text-sm">
                  <span>هزینه ارسال</span>
                  <span>{(orderType === "inter_city" ? 50000 : 30000).toLocaleString()} ؋</span>
                </div>
              )}
              {orderType === "inter_city" && (
                <div className="flex justify-between text-xs opacity-60">
                  <span>شهر مقصد</span>
                  <span>{form.city || "-"}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-dashed border-black/10">
                <span>{dict.total}</span>
                <span className="text-emerald-600">{(subtotal + (orderType === "inter_city" ? 50000 : orderType === "delivery" ? 30000 : 0)).toLocaleString()} ؋</span>
              </div>
            </div>
          </div>
        );

      case "done":
        return (
          <div className="text-center space-y-4 py-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="font-black text-xl">{dict.submitSuccess}</h3>
            <p className="text-sm opacity-60">سفارش شما در انتظار تایید صندوقدار است.</p>
            <Button
              onClick={() => { onOpenChange(false); setStep("type"); setForm({ customerName: "", customerPhone: "", tableNumber: "", deliveryAddress: "", city: "", notes: "" }); }}
              className="rounded-full mt-4"
            >
              بستن
            </Button>
          </div>
        );
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`max-h-[92vh] ${theme.page} rounded-t-3xl`} dir={language === "en" ? "ltr" : "rtl"}>
        <div className="mx-auto w-full max-w-lg flex flex-col max-h-[92vh] overflow-y-auto scrollbar-hide">
          <DrawerHeader className="shrink-0 px-5 pt-5">
            <DrawerTitle className="text-xl font-black flex items-center gap-2">
              {dict.title}
              <Badge variant="secondary" className="rounded-full text-xs ml-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                {items.length} آیتم
              </Badge>
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 px-5 space-y-4 pb-4">
            {renderStepContent()}
          </div>

          <DrawerFooter className="px-5 pb-5 pt-2 border-t border-black/5 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur">
            <div className="flex gap-2">
              {step !== "type" && step !== "done" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === "pay") setStep("info");
                    else if (step === "info") setStep("type");
                  }}
                  className="rounded-xl h-12 flex-1"
                >
                  {dict.back}
                </Button>
              )}
              <Button
                disabled={items.length === 0 || loading}
                onClick={() => {
                  if (step === "type") setStep("info");
                  else if (step === "info") setStep("pay");
                  else if (step === "pay") handleSubmit();
                }}
                className="rounded-xl h-12 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "در حال ثبت..." : step === "pay" ? dict.submitOrder : dict.next}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
