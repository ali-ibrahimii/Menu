"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, MessageSquare, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import Loader from "./Loader";
import { toast } from "sonner";

interface RatingSystemProps {
  foodId: string;
  onRatingStatsChange?: (stats: RatingStats) => void;
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
}

const theme = {
  card: "rounded-[1.25rem] border border-black/[0.06] bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 transition-colors",
  input:
    "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-emerald-500/30 rounded-xl h-11",
  textarea:
    "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-emerald-500/30 rounded-xl",
  primaryBtn:
    "w-full rounded-xl h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 active:scale-[0.98] transition-all",
  secondaryBtn:
    "rounded-xl h-12 border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-white/5",
};

export default function RatingSystem({
  foodId,
  onRatingStatsChange,
}: RatingSystemProps) {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const t = (key: string) => {
    const translations: any = {
      fa: {
        addReview: "ثبت نظر",
        yourRating: "امتیاز شما",
        yourName: "نام شما",
        yourComment: "نظر شما",
        submitReview: "ثبت نظر",
        cancel: "انصراف",
        reviews: "نظرات کاربران",
        noReviews: "هنوز نظری ثبت نشده است",
        averageRating: "میانگین امتیاز",
        basedOn: "بر اساس",
        reviewsCount: "نظر",
        submit: "ثبت نظر",
        submitting: "در حال ثبت...",
        loadingReviews: "در حال بارگذاری نظرات...",
        namePlaceholder: "نام خود را وارد کنید",
        commentPlaceholder: "نظر خود را بنویسید...",
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
        namePlaceholder: "أدخل اسمك",
        commentPlaceholder: "اكتب تعليقك...",
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
        namePlaceholder: "Enter your name",
        commentPlaceholder: "Write your comment...",
      },
    };
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    [reviews],
  );

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
    if (foodId) loadReviews();
  }, [foodId]);

  useEffect(() => {
    onRatingStatsChange?.({
      averageRating,
      totalReviews: reviews.length,
    });
  }, [reviews, averageRating, onRatingStatsChange]);

  const submitReview = async () => {
    if (!customerName.trim() || rating === 0) {
      toast.warning(
        language === "fa"
          ? "لطفاً نام و امتیاز را وارد کنید"
          : "Please enter name and rating",
      );
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
      if (data?.[0]) setReviews((prev) => [data[0], ...prev]);

      setRating(0);
      setComment("");
      setCustomerName("");
      setShowReviewForm(false);
      toast.success(language === "fa" ? "نظر شما ثبت شد" : "Review submitted");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(language === "fa" ? "خطا در ثبت نظر" : "Error submitting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-5 sm:space-y-6"
      dir={language === "en" ? "ltr" : "rtl"}
    >
      {/* خلاصه امتیاز */}
      {reviews.length > 0 && (
        <div className={`${theme.card} p-4 sm:p-5 flex items-center gap-4`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("averageRating")} — {averageRating.toFixed(1)} / 5
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("basedOn")} {reviews.length} {t("reviewsCount")}
            </p>
          </div>
          <div className="hidden sm:flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={
                  s <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-white/10"
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* دکمه ثبت نظر */}
      <div className="flex justify-center">
        {!showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className={theme.primaryBtn}
          >
            <Sparkles size={18} className="ml-2" />
            {t("addReview")}
          </Button>
        )}
      </div>

      {/* فرم */}
      {showReviewForm && (
        <div className={`${theme.card} p-4 sm:p-6 space-y-5`}>
          <h3 className="text-base font-bold flex items-center gap-2 sm:text-lg">
            <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {t("addReview")}
          </h3>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              {t("yourRating")}
            </Label>
            <div className="flex gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-slate-200 dark:text-white/15 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="customerName"
              className="text-[13px] font-semibold text-slate-700 dark:text-slate-200"
            >
              {t("yourName")}
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className={theme.input}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="comment"
              className="text-[13px] font-semibold text-slate-700 dark:text-slate-200"
            >
              {t("yourComment")}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={4}
              className={theme.textarea}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-1">
            <Button
              onClick={submitReview}
              disabled={submitting}
              className="flex-1 rounded-xl h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 font-bold"
            >
              <Send size={16} className="ml-2" />
              {submitting ? t("submitting") : t("submit")}
            </Button>
            <Button
              variant="outline"
              className={theme.secondaryBtn}
              onClick={() => setShowReviewForm(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* لیست نظرات */}
      <div className="space-y-3">
        <h3 className="text-lg font-black tracking-tight sm:text-xl">
          {t("reviews")}
          <span className="ms-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            ({reviews.length})
          </span>
        </h3>

        {loadingReviews ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : reviews.length === 0 ? (
          <div className={`${theme.card} p-8 sm:p-10 text-center`}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("noReviews")}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className={`${theme.card} p-4 sm:p-5`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[14px] sm:text-[15px] truncate">
                      {review.customer_name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-white/10"
                          }
                        />
                      ))}
                      <span className="ms-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({review.rating}.0)
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-black/5 dark:border-white/10">
                    {new Date(review.created_at).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                {review.comment && (
                  <p className="mt-3 text-[13.5px] leading-6 text-slate-700 dark:text-slate-300 bg-[#fff8ed]/70 dark:bg-white/[0.02] rounded-xl p-3 border border-black/[0.03] dark:border-white/[0.05]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
