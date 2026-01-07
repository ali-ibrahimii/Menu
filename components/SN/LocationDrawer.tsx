"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { MapPin, Navigation, Map, Car, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LocationDrawer() {
  const [open, setOpen] = useState(false);
  const [showNavigationOptions, setShowNavigationOptions] = useState(false);
  
  const coords = { lat: 36.284732, lng: 59.596773 };
  const placeName = "Vatandar restaurant";
  const address = "مشهد، واتاندر";

  const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=16&output=embed`;

  // لینک‌های مسیریابی برای اپلیکیشن‌های مختلف
  const navigationLinks = {
    // googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`,
    // googleMapsPlace: `https://www.google.com/maps/place/Vatandar+restaurant/@36.2846696,59.5966489,21z/data=!4m12!1m5!3m4!2zMzbCsDE3JzA1LjAiTiA1OcKwMzUnNDguNyJF!8m2!3d36.2847222!4d59.5968611!3m5!1s0x3f6c916635535703:0x9486be4162a1e330!8m2!3d36.2846991!4d59.5967632!16s%2Fg%2F11rkpp4g97?entry=ttu`,
    
    // waze: `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`,
    
    appleMaps: `https://maps.apple.com/?daddr=${coords.lat},${coords.lng}&dirflg=d`,
    
    // برای ایران - اسنپ
    snap: `https://app.snapp.taxi/pre-ride?rideFrom={%22options%22:{%22serviceType%22:1,%22recommender%22:%22cab%22}}`,
    
    // برای ایران - تپسی
    tapsi: `tapsi://setdestination?lat=${coords.lat}&lng=${coords.lng}&label=${encodeURIComponent(placeName)}`,
    
    // بلد (ایران)
    balad: `balad://location?lat=${coords.lat}&lng=${coords.lng}`,
    
    // نسخه وب برای دستگاه‌های دسکتاپ
    // web: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
  };

  // تشخیص دستگاه برای نمایش اپلیکیشن‌های مناسب
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // بازکردن مسیریابی با انتخاب اپلیکیشن
  const openNavigationDialog = () => {
    setShowNavigationOptions(true);
  };

  const handleNavigation = (app: keyof typeof navigationLinks) => {
    window.open(navigationLinks[app], "_blank");
    setShowNavigationOptions(false);
  };

  // کپی آدرس
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      alert("آدرس کپی شد!");
    } catch (err) {
      console.error("خطا در کپی آدرس:", err);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <MapPin size={20} />
          </button>
        </DrawerTrigger>

        <DrawerContent className="h-[80vh]">
          <div className="flex-1 relative min-h-[300px]">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-t-lg"
            />
          </div>

          <div className="p-4 dark:bg-gray-900 space-y-3">
            {/* دکمه اصلی مسیریابی */}
            <Button 
              onClick={openNavigationDialog}
              className="w-full"
              size="lg"
            >
              <Navigation size={18} className="ml-2" />
              مسیریابی
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* دیالوگ انتخاب اپلیکیشن مسیریابی */}
      <AlertDialog open={showNavigationOptions} onOpenChange={setShowNavigationOptions}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Navigation size={20} />
              انتخاب اپلیکیشن مسیریابی
            </AlertDialogTitle>
            <AlertDialogDescription>
              برای مسیریابی به رستوران واتاندر، اپلیکیشن مورد نظر خود را انتخاب کنید.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            {/* Google Maps - همیشه موجود */}
            {/* <button
              onClick={() => handleNavigation("googleMaps")}
              className="w-full p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Map className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold">Google Maps</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">مسیریابی با گوگل مپ</p>
              </div>
            </button> */}


            {/* Apple Maps - فقط برای iOS */}
            {isIOS && (
              <button
                onClick={() => handleNavigation("appleMaps")}
                className="w-full p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold">Apple Maps</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">نقشه اپل</p>
                </div>
              </button>
            )}

            {/* اسنپ - برای ایران */}
            {isAndroid && (
              <button
                onClick={() => handleNavigation("snap")}
                className="w-full p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
              >
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <Car className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold">اسنپ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">دریافت خودرو</p>
                </div>
              </button>
            )}

            {/* تپسی - برای ایران */}
            {isAndroid && (
              <button
                onClick={() => handleNavigation("tapsi")}
                className="w-full p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
              >
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <Car className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold">تپسی</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">درخواست تاکسی</p>
                </div>
              </button>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}