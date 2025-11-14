"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Food } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Clock, 
  Users, 
  Star, 
  Flame, 
  Leaf, 
  CheckCircle,
  ShoppingCart
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";
import RatingSystem from "@/components/RatingSystem";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { addToCart } = useCartStore();
  
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const foodId = params.id as string;

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const { data, error } = await supabase
          .from("foods")
          .select("*")
          .eq("id", foodId)
          .single();

        if (error) throw error;
        setFood(data);
      } catch (error) {
        console.error("Error fetching food:", error);
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  const getFoodName = (food: Food) => {
    switch (language) {
      case "fa": return food.name_fa;
      case "ar": return food.name_ar;
      case "en": return food.name_en;
      default: return food.name_fa;
    }
  };

  const getFoodDescription = (food: Food) => {
    switch (language) {
      case "fa": return food.description_fa;
      case "ar": return food.description_ar;
      case "en": return food.description_en;
      default: return food.description_fa;
    }
  };

  const getIngredients = (food: Food) => {
    switch (language) {
      case "fa": return food.ingredients_fa;
      case "ar": return food.ingredients_ar;
      case "en": return food.ingredients_en;
      default: return food.ingredients_fa;
    }
  };

  const t = (key: string) => {
    const translations = {
      fa: {
        ingredients: "مواد تشکیل‌دهنده",
        cookingTime: "زمان پخت",
        serves: "مناسب برای",
        people: "نفر",
        minutes: "دقیقه",
        calories: "کالری",
        protein: "پروتئین",
        fat: "چربی",
        carbs: "کربوهیدرات",
        addToCart: "افزودن به سبد",
        category: "دسته‌بندی",
        tags: "برچسب‌ها",
        spicy: "تند",
        vegetarian: "گیاهی",
        available: "موجود",
        notAvailable: "ناموجود",
        backToMenu: "بازگشت به منو"
      },
      ar: {
        ingredients: "المكونات",
        cookingTime: "وقت الطهي",
        serves: "يكفي ل",
        people: "أشخاص",
        minutes: "دقيقة",
        calories: "سعرة",
        protein: "بروتين",
        fat: "دهون",
        carbs: "كربوهيدرات",
        addToCart: "إضافة إلى العربة",
        category: "الفئة",
        tags: "العلامات",
        spicy: "حار",
        vegetarian: "نباتي",
        available: "متوفر",
        notAvailable: "غير متوفر",
        backToMenu: "العودة إلى القائمة"
      },
      en: {
        ingredients: "Ingredients",
        cookingTime: "Cooking Time",
        serves: "Serves",
        people: "people",
        minutes: "minutes",
        calories: "Calories",
        protein: "Protein",
        fat: "Fat",
        carbs: "Carbs",
        addToCart: "Add to Cart",
        category: "Category",
        tags: "Tags",
        spicy: "Spicy",
        vegetarian: "Vegetarian",
        available: "Available",
        notAvailable: "Not Available",
        backToMenu: "Back to Menu"
      }
    };
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  const handleAddToCart = () => {
    if (!food) return;
    
    const cartItem = {
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar,
      name_en: food.name_en,
      price: food.price,
      image_url: food.image_url
    };
    
    addToCart(cartItem);
    alert("به سبد خرید اضافه شد!");
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">غذا یافت نشد</p>
          <Button onClick={() => router.back()} className="mt-4">
            {t('backToMenu')}
          </Button>
        </div>
      </div>
    );
  }

  const images = food.images && food.images.length > 0 ? food.images : [food.image_url];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowRight className="rotate-180" size={20} />
            {t('backToMenu')}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* بخش تصاویر */}
          <div className="space-y-4">
            {/* تصویر اصلی */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
              <img
                src={images[selectedImageIndex]}
                alt={getFoodName(food)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* گالری تصاویر */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-green-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${getFoodName(food)} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* بخش اطلاعات */}
          <div className="space-y-6">
            {/* عنوان و قیمت */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {getFoodName(food)}
                </h1>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {food.price.toLocaleString()} تومان
                  </div>
                  <Badge 
                    variant={food.is_available ? "default" : "destructive"} 
                    className="mt-2"
                  >
                    {food.is_available ? t('available') : t('notAvailable')}
                  </Badge>
                </div>
              </div>

              {/* دسته‌بندی و تگ‌ها */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {t('category')}: {food.category}
                </Badge>
                
                {food.is_spicy && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Flame size={14} />
                    {t('spicy')}
                  </Badge>
                )}
                
                {food.is_vegetarian && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Leaf size={14} />
                    {t('vegetarian')}
                  </Badge>
                )}
              </div>
            </div>

            {/* توضیحات */}
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {getFoodDescription(food)}
              </p>
            </div>

            {/* مشخصات فنی */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {food.cooking_time && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <Clock className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t('cookingTime')}</p>
                    <p className="font-semibold">
                      {food.cooking_time} {t('minutes')}
                    </p>
                  </div>
                </div>
              )}

              {food.serves && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <Users className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t('serves')}</p>
                    <p className="font-semibold">
                      {food.serves} {t('people')}
                    </p>
                  </div>
                </div>
              )}
            </div>

           

            

            <div>
                <RatingSystem foodId={foodId} />
            </div>

            {/* دکمه اقدام */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={handleAddToCart}
                disabled={!food.is_available}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                <ShoppingCart size={20} className="ml-2" />
                {t('addToCart')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}