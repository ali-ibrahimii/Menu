"use client";

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // راه‌اندازی AOS با تنظیمات دلخواه
    AOS.init({
      duration: 800, // مدت زمان انیمیشن
      easing: 'ease-in-out', // نوع انیمیشن
      once: false, // آیا انیمیشن فقط یکبار اجرا بشه
      mirror: false, // آیا هنگام اسکرول به بالا انیمیشن برعکس بشه
      anchorPlacement: 'top-bottom', // موقعیت شروع انیمیشن
      offset: 120, // فاصله از پایین صفحه برای شروع انیمیشن
      delay: 0, // تاخیر
      disable: false, // غیرفعال کردن در دستگاه‌های خاص
      startEvent: 'DOMContentLoaded', // رویداد شروع
    });
  }, []);

  return <>{children}</>;
}