"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import type { Branch } from "@/types";
import { getFolderForBranch } from "@/lib/mediaPaths";
import { listImages } from "@/lib/storageImages";

// گالری عکس‌های هر شعبه
const DEFAULT_IMAGES = ["/bg.jpg", "/bg1.jpg", "/bg2.jpg", "/bg3.jpg"];

export async function getBranchImageGallery(slug: string): Promise<string[]> {
  try {
    const folder = getFolderForBranch(slug);
    const images = await listImages(folder);
    return images.length > 0
      ? images.map((image) => image.url)
      : DEFAULT_IMAGES;
  } catch (error) {
    console.error("Error loading branch images:", error);
    return DEFAULT_IMAGES;
  }
}


export function useBranchData() {
  const [bgImages, setBgImages] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const { selectedBranch, setSelectedBranch } = useBranch();
  const searchParams = useSearchParams();
  const branchSlug = searchParams?.get("branch");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const applyBranch = async (branch: Branch) => {
      const images = await getBranchImageGallery(branch.slug);
      // A slow response for the previous branch must not overwrite the new one.
      if (cancelled) return;
      setSelectedBranch(branch);
      setBgImages(images);
      setIsRedirecting(false);
    };

    const checkBranch = async () => {
      setIsRedirecting(true);
      if (branchSlug) {
        try {
          const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("slug", branchSlug)
            .eq("is_active", true)
            .single();

          if (cancelled) return;
          if (!error && data) {
            await applyBranch(data as Branch);
            return;
          }
        } catch (error) {
          console.error("Error fetching branch from URL:", error);
        }
      }

      if (cancelled) return;
      try {
        const storedBranch = localStorage.getItem("selectedBranch");
        if (storedBranch) {
          const branch = JSON.parse(storedBranch) as Branch | null;
          if (branch && typeof branch.slug === "string" && branch.slug.trim()) {
            await applyBranch(branch);
            return;
          }
        }
      } catch (error) {
        console.error("Error parsing stored branch:", error);
      }

      if (cancelled) return;
      setIsRedirecting(false);
      router.push("/branches");
    };

    // Remote loading also controls the loading state when the URL changes.
    void checkBranch();
    return () => {
      cancelled = true;
    };
  }, [branchSlug, setSelectedBranch, router]);

  return { selectedBranch, bgImages, isRedirecting };
}