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
  is_active: boolean;
};

export type Language = 'fa' | 'ar' | 'en';

export interface RestaurantInfo {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  
  branch1_name_fa: 'شعبه مرکزی',
    branch1_name_ar: 'الفرع الرئيسي',
    branch1_name_en: 'Main Branch',
    branch1_phone: '021-88561000',
    branch1_phone2: '',
    branch1_address_fa: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    branch1_address_ar: 'طهران، شارع وليعصر، رقم ١٢٣',
    branch1_address_en: 'Tehran, Valiasr Street, No. 123',
    
    branch2_name_fa: 'شعبه ۲',
    branch2_name_ar: 'الفرع الثاني',
    branch2_name_en: 'Branch 2',
    branch2_phone: '021-77543210',
    branch2_phone2: '',
    branch2_address_fa: 'تهران، میدان ونک، برج ونک',
    branch2_address_ar: 'طهران، ميدان فنك، برج فنك',
    branch2_address_en: 'Tehran, Vanak Square, Vanak Tower',
    
    working_hours_fa: 'هر روز از ۱۲:۰۰ تا ۲۳:۰۰',
    working_hours_ar: 'كل يوم من ١٢:٠٠ الى ٢٣:٠٠',
    working_hours_en: 'Everyday from 12:00 to 23:00',
    
    instagram_url: 'https://instagram.com/vatandar.restaurant',
    whatsapp_number: '09123456789',
    
    is_active: true,
    created_at: string,
    updated_at: string
}