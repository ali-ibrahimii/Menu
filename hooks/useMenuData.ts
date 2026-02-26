"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Food, Category } from "@/types";

interface UseMenuDataProps {
  selectedBranchId?: string;
  initialData?: {
    foods: Food[];
    categories: Category[];
  };
  enableRealtime?: boolean;
}

interface UseMenuDataReturn {
  foods: Food[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

// ثابت‌ها
const CACHE_DURATION = 10 * 60 * 1000; // افزایش به 10 دقیقه
const STALE_WHILE_REVALIDATE = true;

export function useMenuData({ 
  selectedBranchId, 
  initialData,
  enableRealtime = false 
}: UseMenuDataProps): UseMenuDataReturn {
  const [foods, setFoods] = useState<Food[]>(initialData?.foods || []);
  const [categories, setCategories] = useState<Category[]>(initialData?.categories || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const subscriptionRef = useRef<any>(null);
  const lastFetchRef = useRef<number>(0);

  // تابع بررسی کش با مدیریت بهینه‌تر
  const getCachedData = useCallback(() => {
    if (!selectedBranchId) return null;

    try {
      const cacheKey = `menu_${selectedBranchId}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < CACHE_DURATION) {
        return data;
      } else if (STALE_WHILE_REVALIDATE) {
        setIsStale(true);
        return data; // داده قدیمی را برمی‌گردانیم ولی با علامت stale
      }
    } catch (err) {
      console.error("Cache read error:", err);
    }
    return null;
  }, [selectedBranchId]);

  // ذخیره در کش با متادیتا
  const saveToCache = useCallback((foodsData: Food[], categoriesData: Category[]) => {
    if (!selectedBranchId) return;

    try {
      const cacheKey = `menu_${selectedBranchId}`;
      const cacheData = {
        data: { foods: foodsData, categories: categoriesData },
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      setIsStale(false);
    } catch (err) {
      console.error("Cache save error:", err);
    }
  }, [selectedBranchId]);

  // تابع اصلی واکشی داده با قابلیت abort
  const fetchData = useCallback(async (ignoreCache = false) => {
    if (!selectedBranchId) {
      setLoading(false);
      return;
    }

    // کنسل کردن درخواست قبلی
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // بررسی کش اگر ignoreCache false باشد
      if (!ignoreCache) {
        const cachedData = getCachedData();
        if (cachedData && !isStale) {
          setFoods(cachedData.foods);
          setCategories(cachedData.categories);
          setLoading(false);
          return;
        }
      }

      // بهینه‌سازی کوئری‌ها
      const foodsPromise = supabase
        .from("foods")
        .select("*")
        .eq("is_available", true)
        .or(`branch_id.eq.${selectedBranchId},branch_id.is.null`)
        .abortSignal(abortControllerRef.current.signal);

      const categoriesPromise = supabase
        .from("categories")
        .select("*")
        .order("order_number", { ascending: true, nullsFirst: false })
        .abortSignal(abortControllerRef.current.signal);

      // اجرای همزمان کوئری‌ها
      const [foodsResult, categoriesResult] = await Promise.all([
        foodsPromise,
        categoriesPromise
      ]);

      // بررسی خطاها
      if (foodsResult.error) throw foodsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      // پردازش داده‌ها
      const cleanedFoods = (foodsResult.data || []).map((food) => ({
        ...food,
        category: food.category?.trim(),
      }));

      const cleanedCategories = (categoriesResult.data || []).map((cat) => ({
        ...cat,
        slug: cat.slug?.trim(),
        name: cat.name || "",
        name_ar: cat.name_ar || "",
      }));

      // به‌روزرسانی state
      setFoods(cleanedFoods);
      setCategories(cleanedCategories);

      // ذخیره در کش
      saveToCache(cleanedFoods, cleanedCategories);
      
      lastFetchRef.current = Date.now();

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // درخواست کنسل شده، خطا را نادیده بگیر
      }
      
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err : new Error("خطا در دریافت اطلاعات"));
      
      // استفاده از کش منقضی شده در صورت خطا
      const cachedData = getCachedData();
      if (cachedData && !foods.length) {
        setFoods(cachedData.foods);
        setCategories(cachedData.categories);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, getCachedData, saveToCache, foods.length, isStale]);

  // تنظیم realtime subscription
  useEffect(() => {
    if (!enableRealtime || !selectedBranchId) return;

    // لغو subscription قبلی
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // ایجاد subscription جدید
    subscriptionRef.current = supabase
      .channel(`menu_${selectedBranchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'foods',
          filter: `branch_id=eq.${selectedBranchId}`
        },
        () => {
          // به‌روزرسانی خودکار هنگام تغییر
          fetchData(true);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedBranchId, enableRealtime, fetchData]);

  // اثر برای واکشی اولیه
  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    // اگر داده اولیه داریم، فقط stale بودن را بررسی کن
    if (initialData) {
      const shouldRefetch = Date.now() - lastFetchRef.current > CACHE_DURATION;
      if (shouldRefetch) {
        fetchData(true);
      }
    } else {
      initFetch();
    }

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedBranchId, initialData, fetchData]);

  // تابع برای واکشی مجدد
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    foods,
    categories,
    loading,
    error,
    refetch,
    isStale,
  };
}