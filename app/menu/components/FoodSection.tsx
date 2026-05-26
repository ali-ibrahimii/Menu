"use client";

import { memo } from "react";
import FoodGrid from "./FoodGrid";

type FoodSectionProps = {
  title: string;
  foods: any[];
  language: string;
  t: any;
  getFoodName: (...args: any[]) => string;
  getIngredients: (...args: any[]) => string;
  onSelectFood: (...args: any[]) => void;
};

function FoodSection({ title, foods, language, t, getFoodName, getIngredients, onSelectFood }: FoodSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-bold font-[BTitr]">{title}</h2>
      <div className="h-px bg-linear-to-r from-transparent via-black dark:via-gray-200 to-transparent" />
      <FoodGrid
        foods={foods}
        t={t}
        language={language}
        getFoodName={getFoodName}
        getIngredients={getIngredients}
        onSelectFood={onSelectFood}
      />
    </section>
  );
}

export default memo(FoodSection);