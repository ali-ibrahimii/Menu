"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, RefreshCw, Search, Star, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { databaseError } from "@/lib/branchManagement";
import type { Review } from "@/types/review";

const PAGE_SIZE = 20;
const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-slate-900";
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [foods, setFoods] = useState<Record<string, string>>({});
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [foodWarning, setFoodWarning] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const request = useRef(0);
  const lock = useRef(false);
  const load = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    setFoodWarning("");
    try {
      let builder = supabase
        .from("reviews")
        .select("id,created_at,food_id,customer_name,rating,comment", {
          count: "exact",
        });
      if (rating) builder = builder.eq("rating", Number(rating));
      if (query.trim())
        builder = builder.ilike(
          "customer_name",
          `%${query.trim().replace(/[\\%_]/g, "\\$&")}%`,
        );
      const { data, count, error } = await builder
        .order("created_at", { ascending: false })
        .order("id")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      if (id !== request.current) return;
      const rows = (data ?? []) as Review[];
      setReviews(rows);
      setTotal(count ?? 0);
      if (page > 0 && !rows.length) {
        setPage(Math.max(0, Math.ceil((count ?? 0) / PAGE_SIZE) - 1));
        return;
      }
      const foodIds = [...new Set(rows.map((r) => r.food_id).filter(Boolean))];
      if (!foodIds.length) {
        setFoods({});
        return;
      }
      const result = await supabase
        .from("foods")
        .select("id,name_fa")
        .in("id", foodIds);
      if (id !== request.current) return;
      if (result.error) {
        setFoods({});
        setFoodWarning("نام غذاها دریافت نشد؛ شناسه غذا نمایش داده می‌شود.");
      } else
        setFoods(
          Object.fromEntries((result.data ?? []).map((f) => [f.id, f.name_fa])),
        );
    } catch (error) {
      if (id === request.current) setError(databaseError(error));
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [page, rating, query]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      // Invalidate async requests on unmount; this is a counter, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
    };
  }, [load]);
  async function deleteReview(review: Review) {
    if (lock.current) return;
    if (
      !window.confirm(
        `نظر «${review.customer_name}» برای همیشه حذف شود؟ این عملیات قابل بازگشت نیست.`,
      )
    )
      return;
    lock.current = true;
    setBusy(review.id);
    setActionError("");
    setNotice("");
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id)
        .select("id")
        .single();
      if (error) throw error;
      setNotice("نظر حذف شد.");
      await load();
    } catch (error) {
      setActionError(databaseError(error));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  }
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-8"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            
            <h1 className="flex items-center gap-3 text-2xl font-black">
              <MessageSquare />
              مدیریت نظرات
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              مشاهده و حذف نظرهای غذاها، بدون تغییر متن یا امتیاز مشتری.
            </p>
          </div>
          <Button variant="outline" disabled={loading || !!busy} onClick={load}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            بازخوانی
          </Button>
        </header>
        <fieldset disabled={!!busy} className="grid gap-3 sm:grid-cols-3">
          <form
            className="flex gap-2 sm:col-span-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(0);
            }}
          >
            <label className="flex-1">
              <span className="sr-only">جستجوی نام مشتری</span>
              <input
                className={input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو بر اساس نام مشتری…"
              />
            </label>
            <Button type="submit" variant="outline" aria-label="جستجو">
              <Search size={18} />
            </Button>
          </form>
          <select
            aria-label="امتیاز"
            className={input}
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(0);
            }}
          >
            <option value="">همه امتیازها</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r.toLocaleString("fa-IR")} ستاره
              </option>
            ))}
          </select>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <p>
            {loading || error ? "—" : total.toLocaleString("fa-IR")} نظر مطابق
            فیلترها
          </p>
          <p>جدیدترین نظرات در ابتدا</p>
        </div>
        {notice && (
          <p
            role="status"
            className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400"
          >
            {notice}
          </p>
        )}
        {(error || actionError) && (
          <div
            role="alert"
            className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error || actionError}
            {error && (
              <Button variant="ghost" onClick={load}>
                تلاش دوباره
              </Button>
            )}
          </div>
        )}
        {foodWarning && (
          <p role="status" className="text-sm text-amber-600">
            {foodWarning}
          </p>
        )}
        {loading ? (
          <p role="status" className="py-16 text-center">
            در حال دریافت نظرات…
          </p>
        ) : (
          !error &&
          (reviews.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold" dir="auto">
                        {review.customer_name || "بدون نام"}
                      </h2>
                      <time
                        dateTime={review.created_at}
                        className="mt-1 block text-xs text-slate-500"
                      >
                        {new Date(review.created_at).toLocaleString("fa-IR")}
                      </time>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="break-all text-sm text-slate-500">
                      غذا:{" "}
                      {foods[review.food_id] ||
                        review.food_id ||
                        "غذای حذف‌شده"}
                    </p>
                    <span
                      className="flex items-center gap-1 text-sm text-amber-500"
                      aria-label={`${review.rating} از ۵ ستاره`}
                    >
                      <Star size={16} fill="currentColor" />
                      {review.rating.toLocaleString("fa-IR")} / ۵
                    </span>
                  </div>
                  <p
                    dir="auto"
                    className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-7 dark:bg-white/5"
                  >
                    {review.comment || "بدون متن"}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      disabled={!!busy}
                      onClick={() => deleteReview(review)}
                    >
                      <Trash2 size={16} />
                      {busy === review.id ? "در حال حذف…" : "حذف نظر"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center text-slate-500 dark:border-white/15">
              نظری با این فیلترها پیدا نشد.
            </div>
          ))
        )}
        <nav
          aria-label="صفحه‌بندی نظرات"
          className="flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            disabled={page === 0 || loading || !!busy}
            onClick={() => setPage((p) => p - 1)}
          >
            قبلی
          </Button>
          <span className="text-sm">
            صفحه {(page + 1).toLocaleString("fa-IR")} از{" "}
            {Math.max(1, Math.ceil(total / PAGE_SIZE)).toLocaleString("fa-IR")}
          </span>
          <Button
            variant="outline"
            disabled={
              (page + 1) * PAGE_SIZE >= total || loading || !!busy || !!error
            }
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </nav>
      </div>
    </main>
  );
}
