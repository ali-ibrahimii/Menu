"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Food, Category } from "@/types";

interface UseMenuDataProps {
  selectedBranchId?: string;
}

interface UseMenuDataReturn {
  foods: Food[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMenuData({ selectedBranchId }: UseMenuDataProps): UseMenuDataReturn {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 دقیقه

  // تابع بررسی کش
  const checkCache = () => {
    if (!selectedBranchId) return false;

    try {
      const cachedFoods = sessionStorage.getItem(`cached_foods_${selectedBranchId}`);
      const cachedCategories = sessionStorage.getItem(`cached_categories_${selectedBranchId}`);
      const cacheTimestamp = sessionStorage.getItem(`cache_timestamp_${selectedBranchId}`);
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;

      if (cachedFoods && cachedCategories && cacheAge < CACHE_DURATION) {
        setFoods(JSON.parse(cachedFoods));
        setCategories(JSON.parse(cachedCategories));
        return true;
      }
    } catch (err) {
      console.error("Error reading cache:", err);
    }
    return false;
  };

  // ذخیره در کش
  const saveToCache = (foodsData: Food[], categoriesData: Category[]) => {
    if (!selectedBranchId) return;

    try {
      sessionStorage.setItem(`cached_foods_${selectedBranchId}`, JSON.stringify(foodsData));
      sessionStorage.setItem(`cached_categories_${selectedBranchId}`, JSON.stringify(categoriesData));
      sessionStorage.setItem(`cache_timestamp_${selectedBranchId}`, Date.now().toString());
    } catch (err) {
      console.error("Error saving to cache:", err);
    }
  };

  // پاک کردن کش
  const clearCache = () => {
    if (!selectedBranchId) return;

    sessionStorage.removeItem(`cached_foods_${selectedBranchId}`);
    sessionStorage.removeItem(`cached_categories_${selectedBranchId}`);
    sessionStorage.removeItem(`cache_timestamp_${selectedBranchId}`);
  };

  // تابع اصلی واکشی داده
  const fetchData = async () => {
    if (!selectedBranchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // بررسی کش
      if (checkCache()) {
        setLoading(false);
        return;
      }

      // ساخت کوئری غذاها
      let foodsQuery = supabase
        .from("foods")
        .select("*")
        .eq("is_available", true);

      // فیلتر بر اساس شعبه
      foodsQuery = foodsQuery.or(
        `branch_id.eq.${selectedBranchId},branch_id.is.null`
      );

      // اجرای کوئری‌ها
      const [foodsResult, categoriesResult] = await Promise.all([
        foodsQuery,
        supabase
          .from("categories")
          .select("*")
          .order("order_number", { ascending: true, nullsFirst: false }),
      ]);

      // بررسی خطاها
      if (foodsResult.error) throw foodsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      // پاکسازی داده‌ها
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

      // ذخیره در state
      setFoods(cleanedFoods);
      setCategories(cleanedCategories);

      // ذخیره در کش
      saveToCache(cleanedFoods, cleanedCategories);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error("خطا در دریافت اطلاعات"));
      
      // در صورت خطا، سعی کن از کش استفاده کنی (حتی اگر منقضی شده باشد)
      if (selectedBranchId) {
        const cachedFoods = sessionStorage.getItem(`cached_foods_${selectedBranchId}`);
        const cachedCategories = sessionStorage.getItem(`cached_categories_${selectedBranchId}`);
        
        if (cachedFoods && cachedCategories) {
          setFoods(JSON.parse(cachedFoods));
          setCategories(JSON.parse(cachedCategories));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // اثر برای واکشی اولیه
  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]); // وابستگی به selectedBranchId

  // تابع برای واکشی مجدد
  const refetch = async () => {
    clearCache(); // پاک کردن کش برای واکشی مجدد
    await fetchData();
  };

  return {
    foods,
    categories,
    loading,
    error,
    refetch,
  };
}