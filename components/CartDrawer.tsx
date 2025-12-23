"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Notebook,
  User,
  Hash,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

// تابع ایجاد شناسه دستگاه (همان تابع قبلی)
const getDeviceId = () => {
  if (typeof window === "undefined") return "unknown";

  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId =
      "device_" +
      Math.random().toString(36).substr(2, 9) +
      "_" +
      Date.now().toString(36);
    localStorage.setItem("deviceId", deviceId);
    localStorage.setItem("customerName", "مهمان");
  }

  return deviceId;
};

export default function CartDrawer() {
  const { language } = useLanguage();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const getFoodName = (item: any) => {
    return item[`name_${language || "fa"}`];
  };

  const handleSaveOrder = async () => {
    if (!customerName.trim()) {
      alert(t("customerNameRequired"));
      return;
    }

    if (items.length === 0) {
      alert(t("emptyCartError"));
      return;
    }

    setIsSubmitting(true);

    try {
      // گرفتن device_id
      const deviceId = getDeviceId();

      // آماده کردن داده‌های سفارش با device_id
      const orderData = {
        customer_name: customerName.trim(),
        table_number: tableNumber.trim() || null,
        notes: notes.trim() || null,
        total_price: getTotalPrice(),
        items: items,
        status: "pending",
        device_id: deviceId, // ✅ اضافه کردن device_id
        created_at: new Date().toISOString(),
      };

      console.log("📦 ثبت سفارش با device_id:", deviceId);
      console.log("📊 داده‌های سفارش:", orderData);

      // ثبت سفارش در دیتابیس Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (error) {
        console.error("❌ خطا در ثبت سفارش:", error);
        throw error;
      }

      console.log("✅ سفارش با موفقیت ثبت شد:", data);

      // ذخیره اطلاعات مشتری برای استفاده بعدی
      localStorage.setItem("customerName", customerName.trim());
      if (tableNumber.trim()) {
        localStorage.setItem("tableNumber", tableNumber.trim());
      }

      // نمایش پیام موفقیت
      toast.success(t("orderSubmitted"));

      // ریست فرم و سبد خرید
      clearCart();
      setCustomerName("");
      setTableNumber("");
      setNotes("");

      setIsDrawerOpen(false);
    } catch (error: any) {
      console.error("Error saving order:", error);
      alert(t("orderError") + ": " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // وقتی دراور باز می‌شه، اطلاعات قبلی رو از localStorage بیار
  const handleDrawerOpen = () => {
    const savedName = localStorage.getItem("customerName");

    if (savedName && savedName !== "مهمان") {
      setCustomerName(savedName);
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleDrawerOpen}
        >
          <ShoppingCart className="opacity-60" size={20} />
          {getTotalItems() > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="h-[90vh] glass-drawer"
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center text-white">
            {t("shoppingCart")}
          </DrawerTitle>
          <DrawerDescription>{t("cartDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* آیتم‌های سبد خرید */}
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t("emptyCart")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 p-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card-menu w-full p-3 gap-2"
                  >
                    <img
                      src={item.image_url}
                      alt={getFoodName(item)}
                      className="w-12 h-12 rounded-md object-cover"
                    />

                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {getFoodName(item)}
                      </h4>
                      <p className="text-green-600 text-[12px] font-bold">
                        {item.price.toLocaleString()} {t("price")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="h-7 w-7 p-0 glass-cart-btn"
                      >
                        <Minus size={14} />
                      </Button>

                      <span className="text-[13px] font-medium min-w-5 text-center">
                        {item.quantity}
                      </span>

                      <Button
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-7 w-7 p-0 glass-cart-btn"
                      >
                        <Plus size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/*  خط جدا کننده  */}
              <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />

              {/* جمع کل   */}
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t("total")}:</span>
                  <span className="text-sm font-bold text-green-600">
                    {getTotalPrice().toLocaleString()} {t("price")}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="flex flex-row w-full items-center justify-center space-x-12 backdrop-blur-2xl pt-4">
          {items.length > 0 && (
            <>
              <Button
                // variant="outline"
                onClick={clearCart}
                className="glass-cart-btn px-14"
                disabled={isSubmitting}
              >
                <Trash2 size={16} className="ml-1" />
                {t("clearCart")}
              </Button>
            </>
          )}

          <DrawerClose asChild>
            <Button
              // variant="outline"
              className="glass-cart-btn px-4"
              disabled={isSubmitting}
            >
              {t("close")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
