"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranch } from "@/contexts/BranchContext";
import { Badge } from "../ui/badge";

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Simple custom marker
const customIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNGRjM3MzIiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Map Center Component
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

// Countdown Timer
function useCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const currentlyOpen = hour >= 8 && hour < 23;
      setIsOpen(currentlyOpen);

      if (!currentlyOpen) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }

      const closeTime = new Date();
      closeTime.setHours(23, 0, 0, 0);
      const diff = closeTime.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ hours, minutes });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return { timeLeft, isOpen };
}

export default function LocationDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const { selectedBranch } = useBranch();

  const { timeLeft, isOpen } = useCountdownTimer();

  // Your coordinates - جایگزین با مختصات واقعی شعبه
  const branchCoords = selectedBranch?.latitude && selectedBranch?.longitude
    ? { lat: selectedBranch.latitude, lng: selectedBranch.longitude }
    : { lat: 36.284732, lng: 59.596773 };

  // Translations
  const translations = {
    open: language === "en" ? "Open" : language === "ar" ? "مفتوح" : "باز",
    closed: language === "en" ? "Closed" : language === "ar" ? "مغلق" : "بسته",
    timeLeft: language === "en" ? "Closes in" : language === "ar" ? "يغلق بعد" : "بسته می‌شود",
    directions: language === "en" ? "Directions" : language === "ar" ? "الاتجاهات" : "مسیریابی",
    openHours: language === "en" ? "8AM-11PM" : language === "ar" ? "٨ص-١١م" : "۸ص-۱۱م",
    hours: language === "en" ? "h" : language === "ar" ? "س" : "ساعت",
    minutes: language === "en" ? "m" : language === "ar" ? "د" : "دقیقه"
  };

  const formatTime = (h: number, m: number) => {
    if (h > 0) return `${h}${translations.hours} ${m}${translations.minutes}`;
    return `${m}${translations.minutes}`;
  };

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${branchCoords.lat},${branchCoords.lng}`,
      "_blank"
    );
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition-colors">
          <MapPin size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[85vh]">
        {/* Simple Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">
                {language === "ar" ? selectedBranch?.name_ar : 
                 language === "fa" ? selectedBranch?.name_fa : 
                 selectedBranch?.name_en}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isOpen ? "default" : "secondary"} className="text-xs">
                  {isOpen ? translations.open : translations.closed}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{translations.openHours}</span>
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDrawerOpen(false)}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Clean Map Section */}
        <div className="flex-1 relative">
          <MapContainer
            center={[branchCoords.lat, branchCoords.lng]}
            zoom={16}
            className="h-full w-full"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[branchCoords.lat, branchCoords.lng]} icon={customIcon} />
            <MapCenter lat={branchCoords.lat} lng={branchCoords.lng} />
          </MapContainer>
        </div>

        {/* Simple Bottom Panel */}
        <div className="border-t bg-white">
          <div className="p-4">
            {/* Status Card */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">{translations.timeLeft}</div>
                {isOpen && timeLeft.hours + timeLeft.minutes > 0 ? (
                  <div className="text-xl font-bold mt-1">
                    {formatTime(timeLeft.hours, timeLeft.minutes)}
                  </div>
                ) : (
                  <div className="text-lg font-medium mt-1">Tomorrow 8AM</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Last Order</div>
                <div className="font-medium">10:30 PM</div>
              </div>
            </div>

            {/* Simple Action Button */}
            <Button 
              onClick={openDirections}
              className="w-full py-6"
            >
              <Navigation size={18} className="ml-2" />
              {translations.directions}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}