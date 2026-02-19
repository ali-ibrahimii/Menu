"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import { Branch } from "@/types";

// گالری عکس‌های هر شعبه
const branchImageGalleries: Record<string, string[]> = {
  main: ["/branch1/1.jpg", "/branch1/2.jpg", "/branch1/3.jpg", "/branch1/4.jpg"],
  branch2: [
    "/branch2/1.jpg",
    "/branch2/2.jpg",
    "/branch2/3.jpg",
    "/branch2/4.jpg",
    "/branch2/5.jpg",
    "/branch2/6.jpg",
    "/branch2/7.jpg",
  ],
  default: ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"],
};

export const getBranchImageGallery = (branchSlug: string) => {
  return branchImageGalleries[branchSlug] || branchImageGalleries.default;
};

export function useBranchData() {
  const [bgImages, setBgImages] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const { selectedBranch, setSelectedBranch } = useBranch();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkBranch = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const branchSlug = searchParams?.get("branch");

      // بررسی URL
      if (branchSlug) {
        try {
          const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("slug", branchSlug)
            .eq("is_active", true)
            .single();

          if (!error && data) {
            setSelectedBranch(data);
            setBgImages(getBranchImageGallery(data.slug));
            setIsRedirecting(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching branch from URL:", error);
        }
      }

      // بررسی localStorage
      const storedBranch = localStorage.getItem("selectedBranch");
      if (storedBranch) {
        try {
          const branch = JSON.parse(storedBranch);
          setSelectedBranch(branch);
          setBgImages(getBranchImageGallery(branch.slug));
          setIsRedirecting(false);
          return;
        } catch (error) {
          console.error("Error parsing stored branch:", error);
        }
      }

      // هدایت به صفحه انتخاب شعبه
      setIsRedirecting(false);
      router.push("/branches");
    };

    checkBranch();
  }, [searchParams, setSelectedBranch, router]);

  return {
    selectedBranch,
    bgImages,
    isRedirecting,
  };
}