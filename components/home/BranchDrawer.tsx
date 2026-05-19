"use client";

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
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch } from "@/types";

interface BranchDrawerProps {
  branch: Branch;
  onClearBranch: () => void;
  t: (key: string) => string;
}

export default function BranchDrawer({ branch, onClearBranch, t }: BranchDrawerProps) {
  const { language } = useLanguage();

  return (
    <Drawer direction={language === "en" ? "left" : "right"}>
      <DrawerTrigger asChild>
        <Button className="p-2 bg-white/5 rounded-md text-white backdrop-blur-[2px] border border-white/10">
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={`side-drawer ${
          language === "en" ? "rounded-r-[55px]" : "rounded-l-[55px]"
        }`}
      >
        <DrawerHeader>
          <DrawerTitle>
            <div className="flex flex-col gap-5 justify-center p-2 rounded-3xl bg-gray-100/5 border-[0.1px] border-gray-500/60 items-center mt-10">
              <Image
                src="/logo1.png"
                alt="Watandar logo"
                width={120}
                height={30}
                className="object-cover dark:opacity-80"
              />
            </div>
          </DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>
        
        <div className="flex flex-col gap-3 p-4">
          <div className="text-center mb-4">
            <div className="flex items-center flex-col justify-center gap-2 mb-2">
              <h1 className="font-bold text-2xl">{t("restaurantName")}</h1>
              <span className="font-medium">
                {language === "en"
                  ? branch.name_en || branch.name_fa
                  : language === "ar"
                  ? branch.name_ar || branch.name_fa
                  : branch.name_fa}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/branches"
              className="block font-medium p-2.5 px-8 dark:bg-white bg-black rounded-full text-center text-white dark:text-black"
              onClick={onClearBranch}
            >
              {t("change")} / {t("selectBranch")}
            </Link>
            <div>
              <ThemeToggle />
            </div>
            <Link
              href="/about"
              className="block font-medium p-2.5 px-8 dark:bg-white bg-black rounded-full text-center text-white dark:text-black"
              onClick={onClearBranch}
            >
              {t("change")} / {t("selectBranch")}
            </Link>
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose className="absolute top-6 left-2">
            <Button variant="ghost">
              <X />
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}