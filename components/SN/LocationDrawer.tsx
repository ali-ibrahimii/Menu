"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useBranch } from "@/contexts/BranchContext";


export default function LocationDrawer() {
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
    const { selectedBranch } = useBranch();

  
  // const coords = { lat: 36.299265340575474, lng: 59.640879444238244 };

  
  
  useEffect(() => {
    // تشخیص دستگاه بعد از رندر اولیه
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/android/i.test(userAgent));
  }, []);

  const mapUrl = `https://maps.google.com/maps?q=${selectedBranch?.latitude},${selectedBranch?.longitude}&hl=fa&z=16&output=embed`;

  // تعریف لینک‌های مسیریابی
  const getNavigationLink = () => {
    if (isIOS) {
      // لینک Apple Maps
      return `https://maps.apple.com/?daddr=${selectedBranch?.latitude},${selectedBranch?.longitude}&dirflg=d`;
    } else {
      // لینک Google Maps (پیش‌فرض)
      return `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch?.latitude},${selectedBranch?.longitude}&travelmode=driving`;
    }
  };

  // متن دکمه بر اساس دستگاه
  const getButtonText = () => {
    if (isIOS) return "Apple Maps";
    return "Google Maps";
  };

  // آیکون بر اساس دستگاه
  const getButtonIcon = () => {
    return <Navigation size={18} className="" />;
  };

  const handleNavigation = () => {
    window.open(getNavigationLink(), "_blank");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button 
          className="bg-white/5 rounded-full p-3 border border-white/10"
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