"use client";

import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const CategoryButton = memo(function CategoryButton({
  isSelected,
  onClick,
  children,
}: Props) {
  
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      layout
      className="rounded-full"
    >
      <Button
        onClick={handleClick}
        variant="outline"
        className={`text-[13px] min-w-max rounded-full transition-all duration-200 border 
          ${isSelected 
            ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md" 
            : "bg-transparent text-black dark:text-white border-neutral-300 dark:border-neutral-600"
          }`}
      >
        {children}
      </Button>
    </motion.div>
  );
});

CategoryButton.displayName = "CategoryButton";

export default CategoryButton;