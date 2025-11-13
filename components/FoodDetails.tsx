"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star, Clock, Users } from "lucide-react";
import { Food } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface FoodDetailsProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
  getFoodName: (food: Food) => string;
  getFoodDescription: (food: Food) => string;
}

export default function FoodDetails({ 
  food, 
  isOpen, 
  onClose, 
  getFoodName, 
  getFoodDescription 
}: FoodDetailsProps) {
  const { language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // تصاویر نمونه (در واقعیت باید از دیتابیس بیاید)
  const foodImages = [
    food.image_url,
    "/food-detail-1.jpg", // تصاویر جایگزین
    "/food-detail-2.jpg",
    "/food-detail-3.jpg"
  ].filter(img => img !== null);

  const t = (key: string) => {
    const translations = {
      fa: {
        ingredients: "مواد تشکیل‌دهنده",
        cookingTime: "زمان پخت",
        serves: "مناسب برای",
        people: "نفر",
        minutes: "دقیقه",
        close: "بستن",
        category: "دسته‌بندی"
      },
      ar: {
        ingredients: "المكونات",
        cookingTime: "وقت الطهي",
        serves: "يكفي ل",
        people: "أشخاص",
        minutes: "دقيقة",
        close: "إغلاق",
        category: "الفئة"
      },
      en: {
        ingredients: "Ingredients",
        cookingTime: "Cooking Time",
        serves: "Serves",
        people: "people",
        minutes: "minutes",
        close: "Close",
        category: "Category"
      }
    };
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  // اطلاعات نمونه برای نمایش
  const foodDetails = {
    cookingTime: 30,
    serves: 2,
    ingredients: language === 'fa' 
      ? "گوشت گوساله، برنج، سبزیجات معطر، لیمو عمانی، پیاز، ادویه مخصوص"
      : language === 'ar'
      ? "لحم بقري، أرز، أعشاب عطرية، ليمون عماني، بصل، بهارات خاصة"
      : "Beef, rice, aromatic herbs, dried lime, onion, special spices",
    rating: 4.5,
    reviews: 24
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getFoodName(food)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getFoodDescription(food)}
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={onClose}
        >
          <X size={20} />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* بخش تصاویر */}
          <div className="space-y-4">
            {/* تصویر اصلی */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={foodImages[selectedImageIndex]}
                alt={getFoodName(food)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* گالری تصاویر کوچک */}
            {foodImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {foodImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-green-500' 
                        : 'border-gray-200'
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
            {/* قیمت و دسته‌بندی */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-3xl font-bold text-green-600">
                  {food.price.toLocaleString()} تومان
                </span>
                <Badge variant="secondary" className="mt-2">
                  {t('category')}: {food.category}
                </Badge>
              </div>
              
              {/* امتیاز */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-bold">{foodDetails.rating}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({foodDetails.reviews} {language === 'fa' ? 'نظر' : language === 'ar' ? 'تقييم' : 'reviews'})
                </span>
              </div>
            </div>

            {/* مشخصات */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Clock size={20} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('cookingTime')}</p>
                  <p className="font-semibold">
                    {foodDetails.cookingTime} {t('minutes')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Users size={20} className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('serves')}</p>
                  <p className="font-semibold">
                    {foodDetails.serves} {t('people')}
                  </p>
                </div>
              </div>
            </div>

            {/* مواد تشکیل‌دهنده */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🥘</span>
                {t('ingredients')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {foodDetails.ingredients}
              </p>
            </div>

            {/* توضیحات کامل */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {language === 'fa' ? 'توضیحات کامل' : 
                 language === 'ar' ? 'وصف مفصل' : 
                 'Full Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {getFoodDescription(food)}
              </p>
            </div>

            {/* اطلاعات غذایی (اختیاری) */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">350</div>
                <div className="text-sm text-gray-600">
                  {language === 'fa' ? 'کالری' : 
                   language === 'ar' ? 'سعرة' : 
                   'Calories'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">25g</div>
                <div className="text-sm text-gray-600">
                  {language === 'fa' ? 'پروتئین' : 
                   language === 'ar' ? 'بروتين' : 
                   'Protein'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">12g</div>
                <div className="text-sm text-gray-600">
                  {language === 'fa' ? 'چربی' : 
                   language === 'ar' ? 'دهون' : 
                   'Fat'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}