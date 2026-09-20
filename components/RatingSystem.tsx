"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
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
  comment: string | null;
  created_at: string;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
}

/** تعداد نظراتی که در نگاه اول رندر می‌شوند (بقیه با «مشاهده همه») */
const INITIAL_VISIBLE_REVIEWS = 8;
/** حداکثر نظری که از سرور گرفته می‌شود */
const REVIEWS_FETCH_LIMIT = 200;

/**
 * دیکشنری ترجمه‌ها یک‌بار و در سطح ماژول ساخته می‌شود.
 * قبلاً داخل هر بار صدا زدن t() یک آبجکت سه‌زبانه ساخته می‌شد که با هر
 * کلید کیبورد تکرار می‌شد و تایپ کردن را سنگین می‌کرد.
 */
type Dict = Record<string, string>;

const TRANSLATIONS: Record<"fa" | "ar" | "en", Dict> = {
  fa: {
    addReview: "ثبت نظر",
    yourRating: "امتیاز شما",
    yourName: "نام شما",
    yourComment: "نظر شما",
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
    fillRequired: "لطفاً نام و امتیاز را وارد کنید",
    submitted: "نظر شما ثبت شد",
    submitError: "خطا در ثبت نظر",
    loadError: "دریافت نظرات ناموفق بود",
    retry: "تلاش دوباره",
    showAll: "مشاهده همه نظرات",
    showLess: "بستن نظرات",
  },
  ar: {
    addReview: "إضافة تقييم",
    yourRating: "تقييمك",
    yourName: "اسمك",
    yourComment: "تعليقك",
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
    fillRequired: "الرجاء إدخال الاسم والتقييم",
    submitted: "تم إرسال تعليقك",
    submitError: "خطأ في الإرسال",
    loadError: "تعذر تحميل التقييمات",
    retry: "إعادة المحاولة",
    showAll: "عرض كل التقييمات",
    showLess: "إخفاء التقييمات",
  },
  en: {
    addReview: "Add Review",
    yourRating: "Your Rating",
    yourName: "Your Name",
    yourComment: "Your Comment",
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
    fillRequired: "Please enter your name and rating",
    submitted: "Review submitted",
    submitError: "Error submitting review",
    loadError: "Could not load reviews",
    retry: "Try again",
    showAll: "Show all reviews",
    showLess: "Hide reviews",
  },
};

function getDict(language: string): Dict {
  return TRANSLATIONS[(language as "fa" | "ar" | "en") ?? "en"] ?? TRANSLATIONS.en;
}

/** کش فرمت تاریخ تا برای هر نظر یک آبجکت Intl جدید ساخته نشود */
const DATE_LOCALES: Record<"fa" | "ar" | "en", string> = {
  fa: "fa-IR-u-nu-latn",
  ar: "ar",
  en: "en-GB",
};
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function formatDate(value: string, language: string): string {
  const locale = DATE_LOCALES[(language as "fa" | "ar" | "en") ?? "en"] ?? "en-GB";
  try {
    let formatter = dateFormatterCache.get(locale);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale);
      dateFormatterCache.set(locale, formatter);
    }
    return formatter.format(new Date(value));
  } catch {
    return "";
  }
}

/**
 * در iOS وقتی کیبورد باز می‌شود، فیلد ممکن است زیر کیبورد بماند.
 * با کمی تأخیر (بعد از باز شدن کیبورد) فیلد را به وسط دید می‌آوریم.
 */
function focusIntoView(element: HTMLElement) {
  window.setTimeout(() => {
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 250);
}

const theme = {
  // بدون backdrop-blur: چندین لایه‌ی بلور داخل یک کشوی اسکرول‌شونده
  // روی آیفون باعث افت فریم هنگام اسکرول می‌شد.
  card: "rounded-[1.25rem] border border-black/[0.06] bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-card",
  input:
    "bg-white dark:bg-card border-black/10 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-emerald-500/30 rounded-xl h-12",
  textarea:
    "bg-white dark:bg-card border-black/10 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-emerald-500/30 rounded-xl text-base leading-7 sm:text-[15px]",
  label: "text-[13px] font-semibold text-slate-700 dark:text-slate-200",
};

/* ───────────────────────── کارت یک نظر ───────────────────────── */

const ReviewCard = memo(function ReviewCard({
  review,
  dateLabel,
}: {
  review: Review;
  dateLabel: string;
}) {
  return (
    <div className={`${theme.card} p-4 sm:p-5`}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-[14px] sm:text-[15px] truncate">
            {review.customer_name}
          </h4>
          <div className="flex items-center gap-1 mt-1.5">
            <Stars value={review.rating} size={14} />
            <span className="ms-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              ({review.rating}.0)
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-black/5 dark:border-white/10">
          {dateLabel}
        </span>
      </div>

      {review.comment && (
        <p className="mt-3 text-[13.5px] leading-6 text-slate-700 dark:text-slate-300 bg-[#fff8ed]/70 dark:bg-white/[0.02] rounded-xl p-3 border border-black/[0.03] dark:border-white/[0.05]">
          {review.comment}
        </p>
      )}
    </div>
  );
});

/* ───────────────────────── ستاره‌ها ───────────────────────── */

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-white/10"
          }
        />
      ))}
    </>
  );
}

/* ───────────────────────── فرم ثبت نظر ───────────────────────── */
/**
 * فرم یک کامپوننت جدا است تا state تایپ (نام/نظر) داخل خودش بماند؛
 * با این کار با هر کلید کیبورد فقط فرم رندر می‌شود و لیست نظرات دست‌نخورده
 * می‌ماند. (قبلاً هر کاراکتر، کل لیست نظرات را دوباره رندر می‌کرد.)
 */
const ReviewForm = memo(function ReviewForm({
  dict,
  submitting,
  onSubmit,
}: {
  dict: Dict;
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");

  const closeForm = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (submitting) return;

      if (!customerName.trim() || rating === 0) {
        toast.warning(dict.fillRequired);
        return;
      }

      await onSubmit({
        name: customerName.trim(),
        rating,
        comment: comment.trim(),
      });

      setRating(0);
      setComment("");
      setCustomerName("");
      setOpen(false);
    },
    [comment, customerName, dict, onSubmit, rating, submitting],
  );

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 active:scale-[0.98] transition-transform"
        >
          <Sparkles size={18} className="ms-2" />
          {dict.addReview}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${theme.card} p-4 sm:p-6 space-y-5`}>
      <h3 className="text-base font-bold flex items-center gap-2 sm:text-lg">
        <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        {dict.addReview}
      </h3>

      <div className="space-y-2">
        <Label className={theme.label}>{dict.yourRating}</Label>
        <div className="flex gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} / 5`}
              aria-pressed={rating === star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="rounded-lg p-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 active:scale-90"
            >
              <Star
                size={30}
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
        <Label htmlFor="customerName" className={theme.label}>
          {dict.yourName}
        </Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          onFocus={(e) => focusIntoView(e.currentTarget)}
          placeholder={dict.namePlaceholder}
          autoComplete="name"
          autoCorrect="off"
          spellCheck={false}
          maxLength={40}
          className={theme.input}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className={theme.label}>
          {dict.yourComment}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={(e) => focusIntoView(e.currentTarget)}
          placeholder={dict.commentPlaceholder}
          rows={4}
          enterKeyHint="send"
          maxLength={600}
          className={theme.textarea}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-1">
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 font-bold disabled:opacity-60"
        >
          <Send size={16} className="ms-2" />
          {submitting ? dict.submitting : dict.submit}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl h-12 border-black/10 dark:border-white/10 font-bold"
          onClick={closeForm}
          disabled={submitting}
        >
          {dict.cancel}
        </Button>
      </div>
    </form>
  );
});

/* ───────────────────────── کامپوننت اصلی ───────────────────────── */

function RatingSystem({ foodId, onRatingStatsChange }: RatingSystemProps) {
  const { language } = useLanguage();
  const dict = useMemo(() => getDict(language), [language]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REVIEWS);

  /** برای اینکه پاسخ دیرهنگام یک محصول، محصول فعلی را بازنویسی نکند */
  const requestRef = useRef(0);
  const statsSignatureRef = useRef("");

  const loadReviews = useCallback(
    async (showLoader = true) => {
      const requestId = ++requestRef.current;
      if (showLoader) {
        setLoadingReviews(true);
        setLoadError(false);
      }

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, customer_name, rating, comment, created_at")
          .eq("food_id", foodId)
          .order("created_at", { ascending: false })
          .limit(REVIEWS_FETCH_LIMIT);

        if (error) throw error;
        if (requestId !== requestRef.current) return;
        setReviews((data as Review[]) || []);
        setVisibleCount(INITIAL_VISIBLE_REVIEWS);
      } catch (error) {
        if (requestId !== requestRef.current) return;
        console.error("Error loading reviews:", error);
        setLoadError(true);
      } finally {
        if (requestId === requestRef.current) setLoadingReviews(false);
      }
    },
    [foodId],
  );

  useEffect(() => {
    if (!foodId) return;
    loadReviews();
    return () => {
      // با تغییر محصول، درخواست قبلی بی‌اثر شود
      requestRef.current += 1;
    };
  }, [foodId, loadReviews]);

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviews.length) *
              10,
          ) / 10
        : 0,
    [reviews],
  );

  /**
   * فقط وقتی آمار واقعاً عوض شده باشد به والد خبر می‌دهیم؛
   * وگرنه هر تغییر کوچک باعث رندر مجدد کل پنل جزئیات محصول می‌شد.
   */
  useEffect(() => {
    if (!onRatingStatsChange) return;
    const signature = `${averageRating}|${reviews.length}`;
    if (statsSignatureRef.current === signature) return;
    statsSignatureRef.current = signature;
    onRatingStatsChange({
      averageRating,
      totalReviews: reviews.length,
    });
  }, [averageRating, onRatingStatsChange, reviews.length]);

  const handleSubmit = useCallback(
    async ({
      name,
      rating,
      comment,
    }: {
      name: string;
      rating: number;
      comment: string;
    }) => {
      setSubmitting(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .insert([
            {
              food_id: foodId,
              customer_name: name,
              rating,
              comment,
            },
          ])
          .select("id, customer_name, rating, comment, created_at");

        if (error) throw error;

        const inserted = (data as Review[])?.[0];
        setReviews((prev) =>
          inserted ? [inserted, ...prev] : prev,
        );
        toast.success(dict.submitted);
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error(dict.submitError);
      } finally {
        setSubmitting(false);
      }
    },
    [dict, foodId],
  );

  const visibleReviews = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  );

  return (
    <div
      className="space-y-5 sm:space-y-6"
      dir={language === "en" ? "ltr" : "rtl"}
    >
      {/* فرم ثبت نظر */}
      <ReviewForm
        dict={dict}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {/* لیست نظرات */}
      <div className="space-y-3">
        <h3 className="text-lg font-black tracking-tight sm:text-xl">
          {dict.reviews}
          <span className="ms-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            ({reviews.length})
          </span>
        </h3>

        {loadingReviews ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : loadError ? (
          <div className={`${theme.card} p-8 text-center`}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {dict.loadError}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadReviews()}
              className="mt-4 rounded-full border-black/10 dark:border-white/10"
            >
              {dict.retry}
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className={`${theme.card} p-8 sm:p-10 text-center`}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {dict.noReviews}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {visibleReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                dateLabel={formatDate(review.created_at, language)}
              />
            ))}

            {reviews.length > visibleCount && (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleCount(reviews.length)}
                  className="rounded-full border-black/10 dark:border-white/10 font-bold"
                >
                  {dict.showAll} ({reviews.length - visibleCount})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(RatingSystem);
