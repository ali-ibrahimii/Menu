// app/page.tsx

import { Suspense } from "react";
import HomeContent from "./HomeContent";
import { BRAND, DEFAULT_DESCRIPTION, SEO_DEFAULTS, absUrl } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <Suspense>
        <HomeContent />
      </Suspense>

      {/*
        فقط برای کاربران/خزنده‌های بدون جاوااسکریپت نمایش داده می‌شود؛
        رفتار عادی سایت (ریدایرکت به شعبه‌ها) دست‌نخورده است.
        با این بلوک، صفحهٔ اصلی هم برای خزنده‌هایی که JS اجرا نمی‌کنند
        محتوای واقعی و لینک‌های داخلی دارد.
      */}
      <noscript>
        <main
          style={{
            padding: "2rem 1.5rem",
            lineHeight: 1.9,
            fontFamily: "Vazirmatn, Tahoma, sans-serif",
          }}
        >
          <h1>
            {BRAND.fa} {SEO_DEFAULTS.city}
          </h1>
          <p>{DEFAULT_DESCRIPTION}</p>

          <h2>دسترسی سریع</h2>
          <ul>
            <li>
              <a href={absUrl("/menu")}>منوی غذا و نوشیدنی</a>
            </li>
            <li>
              <a href={absUrl("/branches")}>شعبه‌ها، آدرس و تلفن تماس</a>
            </li>
            <li>
              <a href={absUrl("/about")}>درباره رستوران وطندار</a>
            </li>
          </ul>
        </main>
      </noscript>
    </>
  );
}
