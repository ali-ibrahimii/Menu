"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  X,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";
import RatingSystem from "@/components/RatingSystem";
import { translations } from "@/translations/translation";

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
  getFoodDescription,
}: FoodDetailsProps) {
  const params = useParams();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const foodId = params.id as string;
  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.fa] || key;
  };
  

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const { data, error } = await supabase
          .from("foods")
          .select("*")
          .eq("id", foodId)
          .single();
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


  const handleAddToCart = () => {
    if (!food) return;

    const cartItem = {
      id: food.id,
      name_fa: food.name_fa,
      name_ar: food.name_ar,
      name_en: food.name_en,
      price: food.price,
      image_url: food.image_url,
    };

    addToCart(cartItem);
    alert("به سبد خرید اضافه شد!");
    router.back();
  };

  


  const images =
    food.images && food.images.length > 0 ? food.images : [food.image_url];

  const getIngredients = (food: Food) => {
    switch (language) {
      case "fa":
        return food.ingredients_fa;
      case "ar":
        return food.ingredients_ar;
      case "en":
        return food.ingredients_en;
      default:
        return food.ingredients_fa;
    }
  };

  if (!food) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">غذا یافت نشد</p>
          <Button onClick={onClose} className="mt-4">
            {t("backToMenu")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] mt-auto rounded-t-2xl overflow-y-auto bg-cyan-100">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold text-center">
            {getFoodName(food)}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {/* {getFoodDescription(food)} */}
            <p>نمایش اطلاعات غذا</p>
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[85vh]">
          {/* بخش تصاویر */}
          <div className="space-y-4">
            {/* تصویر اصلی */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg">
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
                        ? "border-green-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
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
                    className="mt-2 pb-1"
                  >
                    {food.is_available ? t("available") : t("notAvailable")}
                  </Badge>
                </div>
              </div>

              {/* دسته‌بندی و تگ‌ها */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {t("category")}: {food.category}
                </Badge>

                {food.is_spicy && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Flame size={14} />
                    {t("spicy")}
                  </Badge>
                )}

                {food.is_vegetarian && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Leaf size={14} />
                    {t("vegetarian")}
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
                    <p className="text-sm text-gray-600">{t("cookingTime")}</p>
                    <p className="font-semibold">
                      {food.cooking_time} {t("minutes")}
                    </p>
                  </div>
                </div>
              )}

              {food.serves && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <Users className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t("serves")}</p>
                    <p className="font-semibold">
                      {food.serves} {t("people")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <RatingSystem foodId={food.id} />
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
                {t("addToCart")}
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// <Dialog open={isOpen} onOpenChange={onClose}>
//   <DialogContent className="w-2xl max-h-[80vh] overflow-y-auto">
//     <DialogHeader>
//       <DialogTitle className="text-2xl font-bold text-center">
//         {getFoodName(food)}
//       </DialogTitle>
//       <DialogDescription className="text-center">
//         {getFoodDescription(food)}
//       </DialogDescription>
//     </DialogHeader>

//     <Button
//       variant="ghost"
//       size="icon"
//       className="absolute left-4 top-4"
//       onClick={onClose}
//     >
//       <X size={20} />
//     </Button>

//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
//       {/* بخش تصاویر */}
//       <div className="space-y-4">
//         {/* تصویر اصلی */}
//         <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
//           <img
//             src={foodImages[selectedImageIndex]}
//             alt={getFoodName(food)}
//             className="w-full h-full object-cover"
//           />
//         </div>

//         {/* گالری تصاویر کوچک */}
//         {foodImages.length > 1 && (
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             {foodImages.map((image, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedImageIndex(index)}
//                 className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
//                   selectedImageIndex === index
//                     ? 'border-green-500'
//                     : 'border-gray-200'
//                 }`}
//               >
//                 <img
//                   src={image}
//                   alt={`${getFoodName(food)} ${index + 1}`}
//                   className="w-full h-full object-cover"
//                 />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* بخش اطلاعات */}
//       <div className="space-y-6">
//         {/* قیمت و دسته‌بندی */}
//         <div className="flex justify-between items-start">
//           <div>
//             <span className="text-3xl font-bold text-green-600">
//               {food.price.toLocaleString()} تومان
//             </span>
//             <Badge variant="secondary" className="mt-2">
//               {t('category')}: {food.category}
//             </Badge>
//           </div>

//           {/* امتیاز */}
//           <div className="text-right">
//             <div className="flex items-center gap-1">
//               <Star className="fill-yellow-400 text-yellow-400" size={20} />
//               <span className="font-bold">{foodDetails.rating}</span>
//             </div>
//             <span className="text-sm text-gray-500">
//               ({foodDetails.reviews} {language === 'fa' ? 'نظر' : language === 'ar' ? 'تقييم' : 'reviews'})
//             </span>
//           </div>
//         </div>

//         {/* مشخصات */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
//             <Clock size={20} className="text-blue-500" />
//             <div>
//               <p className="text-sm text-gray-600">{t('cookingTime')}</p>
//               <p className="font-semibold">
//                 {foodDetails.cookingTime} {t('minutes')}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
//             <Users size={20} className="text-green-500" />
//             <div>
//               <p className="text-sm text-gray-600">{t('serves')}</p>
//               <p className="font-semibold">
//                 {foodDetails.serves} {t('people')}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* مواد تشکیل‌دهنده */}
//         <div>
//           <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//             <span>🥘</span>
//             {t('ingredients')}
//           </h3>
//           <p className="text-gray-700 leading-relaxed">
//             {foodDetails.ingredients}
//           </p>
//         </div>

//         {/* توضیحات کامل */}
//         <div>
//           <h3 className="text-lg font-semibold mb-3">
//             {language === 'fa' ? 'توضیحات کامل' :
//              language === 'ar' ? 'وصف مفصل' :
//              'Full Description'}
//           </h3>
//           <p className="text-gray-700 leading-relaxed">
//             {getFoodDescription(food)}
//           </p>
//         </div>

//         {/* اطلاعات غذایی (اختیاری) */}
//         <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
//           <div className="text-center">
//             <div className="text-2xl font-bold text-orange-500">350</div>
//             <div className="text-sm text-gray-600">
//               {language === 'fa' ? 'کالری' :
//                language === 'ar' ? 'سعرة' :
//                'Calories'}
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-blue-500">25g</div>
//             <div className="text-sm text-gray-600">
//               {language === 'fa' ? 'پروتئین' :
//                language === 'ar' ? 'بروتين' :
//                'Protein'}
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-green-500">12g</div>
//             <div className="text-sm text-gray-600">
//               {language === 'fa' ? 'چربی' :
//                language === 'ar' ? 'دهون' :
//                'Fat'}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>
