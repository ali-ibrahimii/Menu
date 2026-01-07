"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

export default function LocationDrawer() {
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  
  const coords = { lat: 36.284732, lng: 59.596773 };

  useEffect(() => {
    // تشخیص دستگاه بعد از رندر اولیه
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/android/i.test(userAgent));
  }, []);

  const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=fa&z=16&output=embed`;

  // تعریف لینک‌های مسیریابی
  const getNavigationLink = () => {
    if (isIOS) {
      // لینک Apple Maps
      return `https://maps.apple.com/?daddr=${coords.lat},${coords.lng}&dirflg=d`;
    } else {
      // لینک Google Maps (پیش‌فرض)
      return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`;
    }
  };

  // متن دکمه بر اساس دستگاه
  const getButtonText = () => {
    if (isIOS) return "مسیریابی با Apple Maps";
    return "مسیریابی با Google Maps";
  };

  // آیکون بر اساس دستگاه
  const getButtonIcon = () => {
    return <Navigation size={18} className="ml-2" />;
  };

  const handleNavigation = () => {
    window.open(getNavigationLink(), "_blank");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button 
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition duration-200"
          aria-label="نمایش موقعیت و مسیریابی"
        >
          <MapPin size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[50vh] glass-drawer">
        {/* نقشه */}
        <div className="flex-1 relative w-full p-2">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-4xl"
            title="موقعیت رستوران وطندار"
          />
        </div>

        {/* اطلاعات موقعیت */}
        <div className="my-6">
          
          {/* دکمه مسیریابی هوشمند */}
          <Button 
            onClick={handleNavigation}
            className="w-full py-6 bg-gray-600/30 text-base font-medium"
            size="lg"
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}