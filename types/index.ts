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
  cooking_time: number;
  serves: number;
  images: string[];
};

export type Category = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  created_at?: string;
};

export type Language = 'fa' | 'ar' | 'en';

export interface RestaurantInfo {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  
  branch1_name: string;
  branch1_phone: string;
  branch1_address: string;
  
  branch2_name: string;
  branch2_phone: string;
  branch2_address: string;
  
  working_hours_fa: string;
  working_hours_ar: string;
  working_hours_en: string;
  
  instagram_url: string;
  whatsapp_number: string;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}