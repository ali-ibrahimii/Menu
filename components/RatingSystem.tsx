"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

interface RatingSystemProps {
  foodId: string;
  onRatingStatsChange?: (stats: RatingStats) => void; // ✅ اضافه کردن prop جدید
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// ✅ اینترفیس برای آمار امتیازها
export interface RatingStats {
  averageRating: number;
  totalReviews: number;
}

export default function RatingSystem({
  foodId,
  onRatingStatsChange,
}: RatingSystemProps) {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const t = (key: string) => {
    const translations = {
      fa: {
        addReview: "ثبت نظر",
        yourRating: "امتیاز شما",
        yourName: "نام شما",
        yourComment: "نظر شما",
        submitReview: "ثبت نظر",
        cancel: "انصراف",
        reviews: "نظرات",
        noReviews: "هنوز نظری ثبت نشده است",
        averageRating: "میانگین امتیاز",
        basedOn: "بر اساس",
        reviewsCount: "نظر",
        submit: "ثبت",
        submitting: "در حال ثبت...",
        loadingReviews: "در حال بارگذاری نظرات...",
      },
      ar: {
        addReview: "إضافة تقييم",
        yourRating: "تقييمك",
        yourName: "اسمك",
        yourComment: "تعليقك",
        submitReview: "إضافة التقييم",
        cancel: "إلغاء",
        reviews: "التقييمات",
        noReviews: "لا توجد تقييمات بعد",
        averageRating: "متوسط التقييم",
        basedOn: "بناءً على",
        reviewsCount: "تقييم",
        submit: "إرسال",
        submitting: "جاري الإرسال...",
        loadingReviews: "جاري تحميل التقييمات...",
      },
      en: {
        addReview: "Add Review",
        yourRating: "Your Rating",
        yourName: "Your Name",
        yourComment: "Your Comment",
        submitReview: "Submit Review",
        cancel: "Cancel",
        reviews: "Reviews",
        noReviews: "No reviews yet",
        averageRating: "Average Rating",
        basedOn: "Based on",
        reviewsCount: "reviews",
        submit: "Submit",
        submitting: "Submitting...",
        loadingReviews: "Loading reviews...",
      },
    };
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  // محاسبه میانگین امتیاز
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // ✅ تابع برای ارسال آمار به parent component
  const updateRatingStats = () => {
    if (onRatingStatsChange) {
      onRatingStatsChange({
        averageRating,
        totalReviews: reviews.length,
      });
    }
  };

  // ✅ بارگذاری نظرات
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("food_id", foodId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (foodId) {
      loadReviews();
    }
  }, [foodId]);

  // ✅ ارسال آمار هنگام تغییر reviews
  useEffect(() => {
    updateRatingStats();
  }, [reviews]);

  const submitReview = async () => {
    if (!customerName.trim() || rating === 0) {
      alert("لطفاً نام و امتیاز را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            food_id: foodId,
            customer_name: customerName.trim(),
            rating,
            comment: comment.trim(),
          },
        ])
        .select();

      if (error) throw error;

      // افزودن نظر جدید به لیست
      setReviews((prev) => [data[0], ...prev]);

      // ریست فرم
      setRating(0);
      setComment("");
      setCustomerName("");
      setShowReviewForm(false);

      alert("نظر شما با موفقیت ثبت شد");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* دکمه ثبت نظر */}
      <div className="flex justify-center">
        {!showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="glass-rate-card w-full"
          >
            {t("addReview")}
          </Button>
        )}
      </div>

      {/* فرم ثبت نظر */}
      {showReviewForm && (
        <div className="text-white glass-rate-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">{t("addReview")}</h3>

          <div className="space-y-2">
            <Label className="text-white">{t("yourRating")}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={`${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white" htmlFor="customerName ">{t("yourName")}</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={
                language === "fa"
                  ? "نام خود را وارد کنید"
                  : language === "ar"
                  ? "أدخل اسمك"
                  : "Enter your name"
              }
              className="glass-rate-card border-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white" htmlFor="comment">{t("yourComment")}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === "fa"
                  ? "نظر خود را بنویسید..."
                  : language === "ar"
                  ? "اكتب تعليقك..."
                  : "Write your comment..."
              }
              rows={4}
              className="text-white glass-rate-card border-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={submitReview}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Send size={16} className="" />
              {submitting ? t("submitting") : t("submit")}
            </Button>
            <Button
            className="text-black"
              variant="outline"
              onClick={() => setShowReviewForm(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* لیست نظرات */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{t("reviews")}</h3>

        {loadingReviews ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loadingReviews")}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t("noReviews")}</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="glass-rate-card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{review.customer_name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm  mr-2">({review.rating}.0)</span>
                    </div>
                  </div>
                  <span className="text-sm ">
                    {new Date(review.created_at).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                {review.comment && (
                  <p className="leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
