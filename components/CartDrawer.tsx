"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

// تم درست - روشن / تاریک مثل بقیه پروژه
const theme = {
  page: "bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-2xl border border-black/5 bg-white/90 dark:border-white/10 dark:bg-slate-900/70 backdrop-blur shadow-sm",
  mutedText: "text-slate-600 dark:text-slate-400",
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

  const [open, setOpen] = useState(false);

  const subtotal = getTotalPrice();

  const getTranslations = () => {
    const dict: Record<string, any> = {
      fa: {
        cartTitle: "سبد خرید شما",
        emptyCart: "سبد خالی است",
        goToMenu: "رفتن به منو",
        itemsCount: `${getTotalItems()} آیتم`,
        toman: "تومان",
        subtotal: "جمع کل",
        continueShopping: "ادامه خرید",
        clearCart: "خالی کردن سبد",
      },
      ar: {
        cartTitle: "سلة التسوق الخاصة بك",
        emptyCart: "السلة فارغة",
        goToMenu: "اذهب إلى القائمة",
        itemsCount: `${getTotalItems()} عنصر`,
        toman: "تومان",
        subtotal: "المجموع الكلي",
        continueShopping: "مواصلة التسوق",
        clearCart: "مسح السلة",
      },
      en: {
        cartTitle: "Your Cart",
        emptyCart: "Cart is empty",
        goToMenu: "Go to menu",
        itemsCount: `${getTotalItems()} items`,
        toman: "Toman",
        subtotal: "Total",
        continueShopping: "Continue shopping",
        clearCart: "Clear cart",
      },
    };
    return dict[language] || dict.fa;
  };

  const t = getTranslations();

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
              {t.cartTitle}
            </DrawerTitle>
            <p className={theme.mutedText + " text-sm"}>
              {t.itemsCount}
            </p>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingCart className="mx-auto opacity-20 mb-3" size={48} />
                <p className="font-medium">{t.emptyCart}</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full border-black/10 dark:border-white/10"
                  onClick={() => setOpen(false)}
                >
                  {t.goToMenu}
                </Button>
              </div>
            ) : (
              <>
                {/* لیست آیتم‌های سبد خرید */}
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
                          {item.price.toLocaleString()} {t.toman}
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

                {/* جمع کل */}
                <div className={theme.card + " p-4 space-y-2 text-sm"}>
                  <div className="flex justify-between font-black text-lg">
                    <span>{t.subtotal}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {subtotal.toLocaleString()} {t.toman}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="flex-row gap-2 px-4 pb-6">
            {items.length > 0 && (
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={clearCart}
              >
                {t.clearCart}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-slate-900"
              onClick={() => setOpen(false)}
            >
              {t.continueShopping}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
