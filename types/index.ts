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
};

export type Category = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  created_at?: string;
};

export type Language = 'fa' | 'ar' | 'en';