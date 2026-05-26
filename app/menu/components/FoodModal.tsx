"use client";

import { memo } from "react";
import FoodDetails from "@/components/FoodDetails";

type Food = any;

interface FoodModalProps {
  food: Food | null;
  isOpen: boolean;
  onClose: () => void;
  getFoodName?: (food: Food) => string;
  getIngredients?: (food: Food) => string[];
  getDescription?: (food: Food) => string;
}

function FoodModal({
  food,
  isOpen,
  onClose,
  getFoodName,
  getIngredients,
  getDescription,
}: FoodModalProps) {
  if (!food) return null;

  return (
    <FoodDetails
      food={food}
      isOpen={isOpen}
      onClose={onClose}
      // Always pass functions to match FoodDetailsProps expectations
      getFoodName={
        getFoodName ?? ((f: Food) => (f && (f.name ?? String(f))) ?? "")
      }
      getIngredients={
        getIngredients ?? ((f: Food) => (f && f.ingredients) ?? [])
      }
      getFoodDescription={
        getDescription ?? ((f: Food) => (f && f.description) ?? "")
      }
    />
  );
}

export default memo(FoodModal);
