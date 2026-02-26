"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// ==================== کامپوننت دکمه دسته‌بندی ====================
const CategoryButton = memo(function CategoryButton({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} layout>
      <Button
        onClick={onClick}
        className={`${
          isSelected
            ? "dark:bg-white rounded-full dark:text-black border transition-all duration-200 overflow-hidden"
            : "bg-transparent border dark:text-white rounded-full text-black transition-all duration-200 overflow-hidden"
        } text-[13px] min-w-max`}
      >
        {children}
      </Button>
    </motion.div>
  );
});

CategoryButton.displayName = "CategoryButton";

export default CategoryButton;