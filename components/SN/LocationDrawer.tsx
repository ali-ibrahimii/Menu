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
      <DrawerTrigger asChild>
        <button
          className="glass-btn glass-small flex items-center justify-center"
          onClick={() => setIsDrawerOpen(true)}
        >
          <MapPin size={20} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[50vh] glass-drawer">
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* شعبه اول */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg text-gray-800">
                  {translatedInfo?.branch1.name || t("branch1")}
                </h3>
              </div>

              <div className="space-y-3">
                {/* شماره تلفن‌ها */}
                <div className="space-y-2">
                  {translatedInfo?.branch1.phone && (
                    <div className="flex items-center gap-3">
                      <div className="bg-accent p-2 rounded-lg">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{t("phone")}</p>
                        <a
                          href={`tel:${translatedInfo.branch1.phone.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          className="text-base font-semibold text-gray-800 hover:text-green-600 transition-colors"
                        >
                          {formatPhoneNumber(translatedInfo.branch1.phone)}
                        </a>
                      </div>
                    </div>
                  )}

                  {translatedInfo?.branch1.phone2 && (
                    <div className="flex items-center gap-3 ml-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Phone size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{t("phone2")}</p>
                        <a
                          href={`tel:${translatedInfo.branch1.phone2.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          className="text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {formatPhoneNumber(translatedInfo.branch1.phone2)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* آدرس */}
                {translatedInfo?.branch1.address && (
                  <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-red-100 p-2 rounded-lg mt-1">
                      <MapPin size={16} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t("address")}</p>
                      <p className="text-gray-700 leading-relaxed">
                        {translatedInfo.branch1.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* شعبه دوم */}
            {translatedInfo?.branch2.phone && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building size={18} className="text-purple-600" />
                  <h3 className="font-bold text-lg text-gray-800">
                    {translatedInfo?.branch2.name || t("branch2")}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* شماره تلفن‌ها */}
                  <div className="space-y-2">
                    {translatedInfo?.branch2.phone && (
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Phone size={16} className="" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{t("phone")}</p>
                          <a
                            href={`tel:${translatedInfo.branch2.phone.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            className="text-base font-semibold text-gray-800 hover:text-green-600 transition-colors"
                          >
                            {formatPhoneNumber(translatedInfo.branch2.phone)}
                          </a>
                        </div>
                      </div>
                    )}

                    {translatedInfo?.branch2.phone2 && (
                      <div className="flex items-center gap-3 ml-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Phone size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{t("phone2")}</p>
                          <a
                            href={`tel:${translatedInfo.branch2.phone2.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            className="text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {formatPhoneNumber(translatedInfo.branch2.phone2)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* آدرس */}
                  {translatedInfo?.branch2.address && (
                    <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-red-100 p-2 rounded-lg mt-1">
                        <MapPin size={16} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{t("address")}</p>
                        <p className="text-gray-700 leading-relaxed">
                          {translatedInfo.branch2.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t bg-white pt-4">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              {t("close")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
