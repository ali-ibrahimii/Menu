export type Food = {
  id: string;
  name_fa: string;
  name_ar: string | null;
  name_en: string | null;
  description_fa: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  image_url: string;
  images: string[] | null;
  category: string; // slug
  category_id: string;
  branch_id: string;
  is_available?: boolean;
  is_spicy: boolean | null;
  is_vegetarian: boolean | null;
  ingredients_fa: string | null;
  ingredients_ar: string | null;
  ingredients_en: string | null;
  tags: string[] | null;
  cooking_time: number | null;
  serves: number | null;
  sort_order?: number;
  created_at: string;
  updated_at: string;
};

export type FoodFormState = {
  name_fa: string;
  name_ar: string;
  name_en: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  price: string;
  branch_id: string;
  cooking_time: string;
  serves: string;
  ingredients_fa: string;
  ingredients_ar: string;
  ingredients_en: string;
  is_available: boolean;
  is_spicy: boolean;
  is_vegetarian: boolean;
  tags: string;
};

export type SortConfig = {
  key: keyof Food;
  direction: "asc" | "desc";
};
