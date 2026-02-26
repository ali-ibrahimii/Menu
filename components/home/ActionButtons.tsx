"use client";

import { Building2, Instagram } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClockDrawer from "@/components/SN/ClockDrawer";
import LocationDrawer from "@/components/SN/LocationDrawer";
import PhoneDrawer from "@/components/SN/PhoneDrawer";
import { Button } from "@/components/ui/button";

export default function ActionButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 z-50">
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push("/branches");
        }}
        className=" bg-white/5 rounded-full p-3 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Building2 size={20} />
      </button>
      <Link
        href="https://www.instagram.com/vatandar_restaurant?igsh=N3R3a3VlOXUwYXF6ZQ=="
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white/5 rounded-full p-3 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Instagram size={20} />
      </Link>

      <ClockDrawer />
      <LocationDrawer />
      <PhoneDrawer />
    </div>
  );
}
