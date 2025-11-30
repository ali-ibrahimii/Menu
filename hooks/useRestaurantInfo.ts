"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RestaurantInfo } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export function useRestaurantInfo() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_info')
          .select('*')
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setRestaurantInfo(data);
      } catch (err) {
        console.error('Error fetching restaurant info:', err);
        setError('خطا در دریافت اطلاعات رستوران');
        setRestaurantInfo(getDefaultRestaurantInfo());
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, []);

  // تابع برای گرفتن اطلاعات بر اساس زبان
  const getTranslatedInfo = () => {
    if (!restaurantInfo) return null;

    return {
      name: restaurantInfo[`name_${language}` as keyof RestaurantInfo] as string || restaurantInfo.name_fa,
      workingHours: restaurantInfo[`working_hours_${language}` as keyof RestaurantInfo] as string || restaurantInfo.working_hours_fa,
      branch1: {
        name: restaurantInfo[`branch1_name_${language}` as keyof RestaurantInfo] as string || restaurantInfo.branch1_name_fa,
        phone: restaurantInfo.branch1_phone,
        phone2: restaurantInfo.branch1_phone2,
        address: restaurantInfo[`branch1_address_${language}` as keyof RestaurantInfo] as string || restaurantInfo.branch1_address_fa
      },
      branch2: {
        name: restaurantInfo[`branch2_name_${language}` as keyof RestaurantInfo] as string || restaurantInfo.branch2_name_fa,
        phone: restaurantInfo.branch2_phone,
        phone2: restaurantInfo.branch2_phone2,
        address: restaurantInfo[`branch2_address_${language}` as keyof RestaurantInfo] as string || restaurantInfo.branch2_address_fa
      },
      instagram: restaurantInfo.instagram_url,
      whatsapp: restaurantInfo.whatsapp_number
    };
  };

  return {
    restaurantInfo,
    translatedInfo: getTranslatedInfo(),
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // fetchRestaurantInfo();
    }
  };
}

// اطلاعات پیش‌فرض
function getDefaultRestaurantInfo(): RestaurantInfo {
  return {
    id: 'default',
    name_fa: 'رستوران وطندار',
    name_ar: 'مطعم وطندار',
    name_en: 'Vatandar Restaurant',
    
    branch1_name_fa: 'شعبه مرکزی',
    branch1_name_ar: 'الفرع الرئيسي',
    branch1_name_en: 'Main Branch',
    branch1_phone: '۰۲۱-۸۸۵۶۱۰۰۰',
    branch1_address_fa: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    branch1_address_ar: 'طهران، شارع وليعصر، رقم ١٢٣',
    branch1_address_en: 'Tehran, Valiasr Street, No. 123',
    
    branch2_name_fa: 'شعبه ۲',
    branch2_name_ar: 'الفرع الثاني',
    branch2_name_en: 'Branch 2',
    branch2_phone: '۰۲۱-۷۷۵۴۳۲۱۰',
    branch2_address_fa: 'تهران، میدان ونک، برج ونک',
    branch2_address_ar: 'طهران، ميدان فنك، برج فنك',
    branch2_address_en: 'Tehran, Vanak Square, Vanak Tower',
    
    working_hours_fa: 'هر روز از ۱۲:۰۰ تا ۲۳:۰۰',
    working_hours_ar: 'كل يوم من ١٢:٠٠ الى ٢٣:٠٠',
    working_hours_en: 'Everyday from 12:00 to 23:00',
    
    instagram_url: 'https://instagram.com/vatandar.restaurant',
    whatsapp_number: '۰۹۱۲۳۴۵۶۷۸۹',
    
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}