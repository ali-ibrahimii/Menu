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
import { useState } from "react";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { translatedInfo } = useRestaurantInfo();
  const { language } = useLanguage();
  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const handleClick = () => {
    setIsDrawerOpen(true);
  };

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

      <DrawerContent className="h-[35vh] bg-accent">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2 font-bold text-xl">
            {translatedInfo?.name}
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="px-5">
          <div>
            <h1>{translatedInfo?.branch1.name}</h1>
            <h1>{translatedInfo?.branch1.phone}</h1>
            <h1>{translatedInfo?.branch1.phone2}</h1>
            <h1>{translatedInfo?.branch1.address}</h1>
            <h1>{translatedInfo?.branch1.address}</h1>
            <h1>{}</h1>
          </div>
          <div>
            <h1>{translatedInfo?.branch2.name}</h1>
            <h1>{translatedInfo?.branch2.phone}</h1>
            <h1>{translatedInfo?.branch2.phone4}</h1>
            <h1>{translatedInfo?.branch2.address}</h1>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
