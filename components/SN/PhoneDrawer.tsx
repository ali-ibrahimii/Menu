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
import { PhoneCall, MapPin, Building, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations/translation";

export default function PhoneDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { translatedInfo, loading } = useRestaurantInfo();
  const { language } = useLanguage();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // تابع برای فرمت کردن شماره تلفن
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild className="">
        <button
          className="glass-btn glass-small flex items-center justify-center"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PhoneCall size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[40vh] glass-btn-card rounded-t-2xl">
        <div className="my-15">
          <div className="space-y-10">
            {/* شعبه اول */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg ">
                  {translatedInfo?.branch1.name || t("branch1")}
                </h3>
              </div>

              <div className="flex flex-row">
                {/* شماره تلفن‌ها */}
                <div className="flex space-x-10 justify-center items-center">
                  {translatedInfo?.branch1.phone && (
                    <div className="flex items-center gap-3">
                      
                      <div className="">
                        <p className="text-sm">{t("phone")}</p>
                        <a
                          href={`tel:${translatedInfo.branch1.phone.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          className="text-base font-semibold hover:text-green-600 transition-colors"
                        >
                          {formatPhoneNumber(translatedInfo.branch1.phone)}
                        </a>
                      </div>
                    </div>
                  )}

                  {translatedInfo?.branch1.phone2 && (
                    <div className="flex items-center gap-3 ml-2">
                      
                      <div className="flex-1">
                        <p className="text-sm ">{t("phone2")}</p>
                        <a
                          href={`tel:${translatedInfo.branch1.phone2.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          className="text-base font-semibold hover:text-blue-600 transition-colors"
                        >
                          {formatPhoneNumber(translatedInfo.branch1.phone2)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* شعبه دوم */}
            {translatedInfo?.branch2.phone && (
              <div className="text-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-lg ">
                    {translatedInfo?.branch2.name || t("branch2")}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* شماره تلفن‌ها */}
                  <div className="flex space-x-10">
                    {translatedInfo?.branch2.phone && (
                      <div className="flex items-center gap-3">
                        
                        <div className="flex-1">
                          <p className="text-sm ">{t("phone")}</p>
                          <a
                            href={`tel:${translatedInfo.branch2.phone.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            className="text-base font-semibold  hover:text-green-600 transition-colors"
                          >
                            {formatPhoneNumber(translatedInfo.branch2.phone)}
                          </a>
                        </div>
                      </div>
                    )}

                    {translatedInfo?.branch2.phone2 && (
                      <div className="flex items-center gap-3 ml-2">
                        <div className="flex-1">
                          <p className="text-sm">{t("phone2")}</p>
                          <a
                            href={`tel:${translatedInfo.branch2.phone2.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            className="text-base font-semibold hover:text-blue-600 transition-colors"
                          >
                            {formatPhoneNumber(translatedInfo.branch2.phone2)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
