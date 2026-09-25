import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — باید داخل پوشهٔ app/ باشد تا Next آن را منتشر کند.
 * (قبلاً در ریشهٔ پروژه بود و عملاً هرگز ساخته نمی‌شد)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/my-orders", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
