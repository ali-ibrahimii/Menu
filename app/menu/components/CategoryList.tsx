"use client";

import { memo } from "react";
import CategoryButton from "@/components/CategoryButton";

function CategoryList({
  categories,
  active,
  onSelect,
  t,
  language,
}: {
  categories: any[];
  active: string | null;
  onSelect: (slug: string | null) => void;
  t: any;
  language: string;
}) {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar hide-scroll-shadow">
      <div
        dir={language === "en" ? "ltr" : "rtl"}
        className="flex space-x-2 border min-w-max"
      >
        <CategoryButton
          isSelected={active === null}
          onClick={() => onSelect(null)}
        >
          {t("allFoods")}
        </CategoryButton>

        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            isSelected={active === category.slug}
            onClick={() => onSelect(category.slug)}
          >
            {language === "en"
              ? category.slug
                  ?.split("-")
                  .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")
              : language === "ar"
                ? category.name_ar
                : category.name}
          </CategoryButton>
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryList);
