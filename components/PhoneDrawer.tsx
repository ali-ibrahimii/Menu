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
import { PhoneCall } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { translatedInfo, loading, error } = useRestaurantInfo();
  const { language } = useLanguage()

    const handleClick = () => {
        setIsDrawerOpen(true)
    }
  

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="p-5 rounded-full border-2 border-black"
          onClick={() => handleClick()}
        >
          <PhoneCall size={20} color="#000" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[30vh] bg-accent/90">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2 font-bold text-xl">Contact us</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div>
            <h1>{translatedInfo?.branch1.name}</h1>
            <h1>{translatedInfo?.branch1.phone}</h1>
            <h1>{translatedInfo?.branch1.address}</h1>
        </div>
        <div>
            <h1>{translatedInfo?.branch2.name}</h1>
            <h1>{translatedInfo?.branch2.phone}</h1>
            <h1>{translatedInfo?.branch2.address}</h1>
        </div>

        <DrawerFooter className="flex-row gap-3">
          <DrawerClose asChild>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
