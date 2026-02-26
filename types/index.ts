export type Food = {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  price: number;
  image_url: string;
  category: string;
  is_available?: boolean;
  sort_order?: number;
  ingredients_fa: Text;
  ingredients_ar: Text;
  ingredients_en: Text;
  is_spicy: Text;
  is_vegetarian: Text;
  tags: string[];
  cooking_time: number;
  serves: number;
  images: string[];
  created_at: string;
  category_id: string;
  updated_at: string;
  branch_id: string;
};

export type Category = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  created_at?: string;
  order_number: number | null
};


export type Branch = {
  id: string;
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  address_fa: string;
  address_ar: string;
  address_en: string;
  phone_1: string;
  phone_2: string;
  Instagram: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
};

export type Language = 'fa' | 'ar' | 'en';