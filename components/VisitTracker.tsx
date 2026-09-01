"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VisitTracker() {
  useEffect(() => {
    // تولید ID منحصر به فرد برای دستگاه اگر وجود نداشته باشد
    const generateDeviceId = (): string => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const id = localStorage.getItem("watandar_device_id") || generateDeviceId();

    // ذخیره ID در localStorage برای استفاده‌های بعدی
    if (!localStorage.getItem("watandar_device_id")) {
      localStorage.setItem("watandar_device_id", id);
    }

    // ثبت بازدید در پایگاه داده
    supabase
      .from("site_visits")
      .insert({
        device_id: id,
        page: window.location.pathname,
        user_agent: navigator.userAgent,
      })
      .then(({ error }) => {
        if (error) {
          console.error("خطا در ثبت بازدید:", error);
        }
      });
  }, []);

  return null; // این کامپوننت چیزی render نمی‌کند
}
