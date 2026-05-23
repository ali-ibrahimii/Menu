"use client";

import { memo } from "react";
import FoodCard from "@/components/FoodCard";

function FoodGrid({ foods, language, onSelectFood, t, getFoodName, getIngredients }: {foods: any; language: string; onSelectFood: any; t: any; getFoodName: any; getIngredients: any}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {foods.map((food , index) => (
        <FoodCard
          key={food.id}
          food={food}
          language={language}
          t={t}
          getFoodName={getFoodName}
          getIngredients={getIngredients}
          handleFoodClick={onSelectFood}
          index={index}
        />
      ))}
    </div>
  );
}

export default memo(FoodGrid);