"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useMenuData = (branchId?: string) => {
  return useQuery({
    queryKey: ["menu-data", branchId],
    queryFn: async () => {
      let foodsQuery = supabase
        .from("foods")
        .select("*")
        .eq("is_available", true);

      if (branchId) {
        foodsQuery = foodsQuery.or(
          `branch_id.eq.${branchId},branch_id.is.null`
        );
      } else {
        foodsQuery = foodsQuery.is("branch_id", null);
      }

      const [{ data: foods }, { data: categories }] = await Promise.all([
        foodsQuery,
        supabase
          .from("categories")
          .select("*")
          .order("order_number", { ascending: true }),
      ]);

      return {
        foods: (foods || []).map((f) => ({
          ...f,
          category: f.category?.trim(),
        })),
        categories: categories || [],
      };
    },
  });
};
