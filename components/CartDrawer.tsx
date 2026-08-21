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
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Image from "next/image";

// تم درست - روشن / تاریک مثل بقیه پروژه
const theme = {
  page: "bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-2xl border border-black/5 bg-white/90 dark:border-white/10 dark:bg-slate-900/70 backdrop-blur shadow-sm",
  input:
    "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl h-12 focus-visible:ring-emerald-500/30",
  textarea:
    "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/30",
  tabActive:
    "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md",
  tabInactive:
    "bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10",
  mutedText: "text-slate-600 dark:text-slate-400",
};

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
  const { language } = useLanguage();
  const t = useTranslate();
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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [table, setTable] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = getTotalPrice();
  const deliveryFee = orderType === "delivery" ? 30000 : 0;
  const finalPrice = subtotal + deliveryFee;

  const tr = useCallback(
    (key: string) => {
      const dict: Record<string, any> = {
        fa: {
          cartTitle: "سبد خرید شما",
          emptyCart: "سبد خالی است",
          goToMenu: "رفتن به منو",
          itemsCount: `${getTotalItems()} آیتم`,
          deliveryDesc: "ارسال با پیک",
          dineInDesc: "سرو داخل رستوران",
          dineIn: "داخل رستوران",
          delivery: "بیرون‌بر",
          customerName: "نام شما *",
          namePlaceholder: "نام شما",
          tableNumber: "شماره میز *",
          tablePlaceholder: "مثلا 12",
          phoneNumber: "شماره تماس *",
          phonePlaceholder: "09xx xxx xxxx",
          address: "آدرس دقیق *",
          addressPlaceholder: "خیابان، کوچه، پلاک، واحد...",
          notes: "یادداشت (اختیاری)",
          notesPlaceholder: "بدون فلفل، سس اضافه...",
          paymentMethod: "روش پرداخت",
          cash: "نقدی / در محل",
          online: "آنلاین",
          subtotal: "جمع جزء",
          deliveryFee: "هزینه ارسال",
          totalPayable: "قابل پرداخت",
          continueShopping: "ادامه خرید",
          submitOrder: "ثبت سفارش",
          submitting: "در حال ثبت...",
          nameRequired: "لطفا نام خود را وارد کنید",
          phoneRequired: "شماره تماس الزامی است",
          addressRequired: "آدرس الزامی است",
          tableRequired: "شماره میز الزامی است",
          emptyCartError: "سبد خرید خالی است",
          orderSuccessDelivery: "سفارش بیرون‌بر ثبت شد 🛵",
          orderSuccessDineIn: "سفارش شما ثبت شد 🍽️ - منتظر تایید",
          onlineRedirect: "سفارش ثبت شد، انتقال به درگاه...",
          onlineSoon: "پرداخت آنلاین به زودی - سفارش با پرداخت در محل ثبت شد",
          toman: "تومان",
        },
        ar: {
          cartTitle: "سلة التسوق الخاصة بك",
          emptyCart: "السلة فارغة",
          goToMenu: "اذهب إلى القائمة",
          itemsCount: `${getTotalItems()} عنصر`,
          deliveryDesc: "توصيل مع سائق",
          dineInDesc: "الخدمة داخل المطعم",
          dineIn: "داخل المطعم",
          delivery: "خارجي",
          customerName: "اسمك *",
          namePlaceholder: "اسمك",
          tableNumber: "رقم الطاولة *",
          tablePlaceholder: "مثلا 12",
          phoneNumber: "رقم الهاتف *",
          phonePlaceholder: "09xx xxx xxxx",
          address: "العنوان الدقيق *",
          addressPlaceholder: "شارع، زقاق، رقم...",
          notes: "ملاحظات (اختياري)",
          notesPlaceholder: "بدون فلفل...",
          paymentMethod: "طريقة الدفع",
          cash: "نقدي / عند الاستلام",
          online: "عبر الإنترنت",
          subtotal: "المجموع الفرعي",
          deliveryFee: "رسوم التوصيل",
          totalPayable: "المبلغ المستحق",
          continueShopping: "مواصلة التسوق",
          submitOrder: "تقديم الطلب",
          submitting: "جاري التقديم...",
          nameRequired: "الرجاء إدخال اسمك",
          phoneRequired: "رقم الهاتف مطلوب",
          addressRequired: "العنوان مطلوب",
          tableRequired: "رقم الطاولة مطلوب",
          emptyCartError: "سلة التسوق فارغة",
          orderSuccessDelivery: "تم تسجيل طلبك الخارجي 🛵",
          orderSuccessDineIn: "تم تسجيل طلبك 🍽️ - في انتظار التأكيد",
          onlineRedirect: "تم تسجيل الطلب، جاري التحويل إلى بوابة الدفع...",
          onlineSoon:
            "الدفع عبر الإنترنت قريبا - تم تسجيل الطلب بالدفع عند الاستلام",
          toman: "تومان",
        },
        en: {
          cartTitle: "Your Cart",
          emptyCart: "Cart is empty",
          goToMenu: "Go to menu",
          itemsCount: `${getTotalItems()} items`,
          deliveryDesc: "Delivery with courier",
          dineInDesc: "Dine in service",
          dineIn: "Dine in",
          delivery: "Delivery",
          customerName: "Your name *",
          namePlaceholder: "Your name",
          tableNumber: "Table number *",
          tablePlaceholder: "e.g. 12",
          phoneNumber: "Phone number *",
          phonePlaceholder: "09xx xxx xxxx",
          address: "Exact address *",
          addressPlaceholder: "Street, alley, number...",
          notes: "Notes (optional)",
          notesPlaceholder: "No pepper, extra sauce...",
          paymentMethod: "Payment method",
          cash: "Cash / On delivery",
          online: "Online",
          subtotal: "Subtotal",
          deliveryFee: "Delivery fee",
          totalPayable: "Total payable",
          continueShopping: "Continue shopping",
          submitOrder: "Submit order",
          submitting: "Submitting...",
          nameRequired: "Please enter your name",
          phoneRequired: "Phone number is required",
          addressRequired: "Address is required",
          tableRequired: "Table number is required",
          emptyCartError: "Cart is empty",
          orderSuccessDelivery: "Delivery order placed 🛵",
          orderSuccessDineIn: "Order placed 🍽️ - Awaiting confirmation",
          onlineRedirect: "Order placed, redirecting to payment...",
          onlineSoon:
            "Online payment coming soon - Order placed with cash on delivery",
          toman: "Toman",
        },
      };
      return dict[language]?.[key] || dict.fa[key] || key;
    },
    [language, getTotalItems],
  );

  useEffect(() => {
    if (open) {
      setName(localStorage.getItem("watandar_name") || "");
      setPhone(localStorage.getItem("watandar_phone") || "");
      setTable(localStorage.getItem("watandar_table") || "");
      setAddress(localStorage.getItem("watandar_address") || "");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error(tr("nameRequired"));
    if (orderType === "delivery" && !phone.trim())
      return toast.error(tr("phoneRequired"));
    if (orderType === "delivery" && !address.trim())
      return toast.error(tr("addressRequired"));
    if (orderType === "dine_in" && !table.trim())
      return toast.error(tr("tableRequired"));
    if (items.length === 0) return toast.error(tr("emptyCartError"));

    setLoading(true);
    try {
      const deviceId = getDeviceId();
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
          name_ar: i.name_ar,
          name_en: i.name_en,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();
      if (error) throw error;

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        food_id: i.id,
        food_name_fa: i.name_fa,
        food_price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));
      await supabase.from("order_items").insert(itemsPayload);

      if (paymentMethod === "online") {
        toast.success(tr("onlineRedirect"));
        toast.info(tr("onlineSoon"));
      } else {
        toast.success(
          orderType === "delivery"
            ? tr("orderSuccessDelivery")
            : tr("orderSuccessDineIn"),
        );
      }

      clearCart();
      setOpen(false);
    } catch (e: any) {
      toast.error("خطا: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart size={20} />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-emerald-500 text-white rounded-full text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className={`max-h-[92vh] ${theme.page} rounded-top`}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <div className="mx-auto w-full max-w-lg flex flex-col max-h-[92vh] overflow-y-auto scrollbar-hide">
          <DrawerHeader className="shrink-0">
            <DrawerTitle className="text-xl font-black">
              {tr("cartTitle")}
            </DrawerTitle>
            <DrawerDescription className={theme.mutedText}>
              {tr("itemsCount")} •{" "}
              {orderType === "delivery" ? tr("deliveryDesc") : tr("dineInDesc")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingCart className="mx-auto opacity-20 mb-3" size={48} />
                <p className="font-medium">{tr("emptyCart")}</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full border-black/10 dark:border-white/10"
                  onClick={() => setOpen(false)}
                >
                  {tr("goToMenu")}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={theme.card + " p-2.5 flex items-center gap-3"}
                    >
                      <Image
                        src={item.image_url || "/bg.jpg"}
                        alt={item.name_fa}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover h-14 w-14 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {language === "fa"
                            ? item.name_fa
                            : language === "ar"
                              ? item.name_ar || item.name_fa
                              : item.name_en || item.name_fa}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.price.toLocaleString()} {tr("toman")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full bg-black/5 dark:bg-white/10"
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
                          className="h-7 w-7 rounded-full bg-black/5 dark:bg-white/10"
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

                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
                  {[
                    {
                      key: "dine_in" as OrderType,
                      label: tr("dineIn"),
                      icon: Store,
                    },
                    {
                      key: "delivery" as OrderType,
                      label: tr("delivery"),
                      icon: Bike,
                    },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setOrderType(t.key)}
                      className={`h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${orderType === t.key ? theme.tabActive : theme.tabInactive}`}
                    >
                      <t.icon size={16} /> {t.label}
                    </button>
                  ))}
                </div>

                <div className={theme.card + " p-4 space-y-3"}>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold flex items-center gap-1">
                      <User size={12} /> {tr("customerName")}
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={tr("namePlaceholder")}
                      className={theme.input}
                    />
                  </div>
                  {orderType === "dine_in" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center gap-1">
                        <Hash size={12} /> {tr("tableNumber")}
                      </Label>
                      <Input
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        placeholder={tr("tablePlaceholder")}
                        className={theme.input}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <Phone size={12} /> {tr("phoneNumber")}
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={tr("phonePlaceholder")}
                          dir="ltr"
                          className={theme.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <MapPin size={12} /> {tr("address")}
                        </Label>
                        <Textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={tr("addressPlaceholder")}
                          rows={2}
                          className={theme.textarea}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{tr("notes")}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={tr("notesPlaceholder")}
                      rows={2}
                      className={theme.textarea}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${paymentMethod === "cash" ? theme.tabActive + " border-slate-900 dark:border-white" : theme.card + " border-transparent"}`}
                  >
                    <Banknote size={16} /> {tr("cash")}
                  </button>
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${paymentMethod === "online" ? "bg-emerald-600 text-white border-emerald-600" : theme.card + " border-transparent"}`}
                  >
                    <CreditCard size={16} /> {tr("online")}
                  </button>
                </div>

                <div className={theme.card + " p-4 space-y-2 text-sm"}>
                  <div className="flex justify-between">
                    <span>{tr("subtotal")}</span>
                    <span>
                      {subtotal.toLocaleString()} {tr("toman")}
                    </span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span>{tr("deliveryFee")}</span>
                      <span>
                        {deliveryFee.toLocaleString()} {tr("toman")}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-black/10 dark:bg-white/10" />
                  <div className="flex justify-between font-black text-base">
                    <span>{tr("totalPayable")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {finalPrice.toLocaleString()} {tr("toman")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="flex-row gap-2 px-4 pb-6">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-slate-900"
              onClick={() => setOpen(false)}
            >
              {tr("continueShopping")}
            </Button>
            {items.length > 0 && (
              <Button
                className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? tr("submitting") : tr("submitOrder")}
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
