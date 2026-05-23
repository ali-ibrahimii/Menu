"use client";

import { memo } from "react";
import FoodDetails from "@/components/FoodDetails";

function FoodModal({ food, isOpen, onClose, getFoodName, getIngredients, getDescription }) {
  if (!food) return null;

  return (
    <FoodDetails
      food={food}
      isOpen={isOpen}
      onClose={onClose}
      getFoodName={getFoodName}
      getIngredients={getIngredients}
      getFoodDescription={getDescription}
    />
  );
}

export default memo(FoodModal);