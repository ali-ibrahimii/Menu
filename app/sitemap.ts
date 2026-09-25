import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** بازتولید sitemap هر یک ساعت (همراه با کش دادهٔ سئو) */
export const revalidate = 3600;

/**
 * sitemap.xml — فقط صفحه‌های عمومی و ایندکس‌شدنی.
 * صفحه‌های شخصی/مدیریت (admin, login, my-orders) عمداً نیامده‌اند.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/branches`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  return entries;
}
