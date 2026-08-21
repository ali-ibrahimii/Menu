"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useBranch } from "@/contexts/BranchContext";
import Loader from "../Loader";

export default function LocationDrawer() {
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const { selectedBranch } = useBranch();
  const [mapLoading, setMapLoading] = useState(true);

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

  useEffect(() => {
    if (!open) {
      setMapLoading(true);
    }
  }, [open]);

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
          className="bg-white/5 rounded-full p-3 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="نمایش موقعیت و مسیریابی"
        >
          <MapPin size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className={`max-h-[92vh] rounded-top`}>
        {/* نقشه */}
        <div className="flex-1 relative w-full p-2">
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader />
            </div>
          )}

          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl"
            title="موقعیت رستوران وطندار"
            onLoad={() => setMapLoading(false)}
          />
        </div>

        {/* اطلاعات موقعیت */}
        <div className="my-6 flex justify-center items-center">
          {/* دکمه مسیریابی هوشمند */}
          <Button
            onClick={handleNavigation}
            className="w-5/12 py-6 dark:bg-white text-base font-medium"
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
