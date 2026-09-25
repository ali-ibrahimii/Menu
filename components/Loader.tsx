"use client";

import React from "react";

/**
 * لودر یکپارچه پروژه
 * ---------------------------------------------
 * تنها منوی رسمی «در حال بارگذاری» در کل سایت همین کامپوننت است.
 *
 *  - <Loader />                 : خودِ اسپینر (برای استفاده داخل کانتینر دلخواه)
 *  - <FullPageLoader />         : لودینگ تمام‌صفحه با پس‌زمینه تاریک و متن
 *  - <Loader text="..." />      : اسپینر همراه با متن دلخواه
 *  - <Spinner />                : اسپینر کوچک برای داخل دکمه‌ها
 */

type SpinnerProps = {
  size?: number;
  className?: string;
};

/** اسپینر کوچک — برای داخل دکمه‌ها و جایگاه‌های تنگ */
export function Spinner({ size = 20, className = "" }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-middle ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="در حال بارگذاری"
    />
  );
}

type LoaderProps = {
  /** متن اختیاری زیر اسپینر */
  text?: string;
  /** کلاس اضافه برای کانتینر */
  className?: string;
  /** اندازه اسپینر */
  size?: number;
};

/** اسپینر برند سایت (هماهنگ با تم تاریک و رنگ زمردی) */
export default function Loader({ text, className = "", size = 48 }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* حلقه پس‌زمینه */}
        <div
          className="absolute inset-0 rounded-full border-4 border-emerald-500/15"
          style={{ width: size, height: size }}
        />
        {/* حلقه چرخان */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"
          style={{ width: size, height: size }}
        />
        {/* نقطه مرکزی */}
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div> */}
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

type FullPageLoaderProps = LoaderProps & {
  /** جهت چیدمان؛ پیش‌فرض راست‌چین */
  dir?: "rtl" | "ltr";
};

/** لودینگ تمام‌صفحه یکپارچه — بافت تاریک برند */
export function FullPageLoader({
  text = "در حال بارگذاری...",
  className = "",
  size = 56,
  dir = "rtl",
}: FullPageLoaderProps) {
  return (
    <div
      dir={dir}
      className={`min-h-screen w-full flex items-center justify-center bg-slate-950 ${className}`}
    >
      <Loader text={text} size={size} />
    </div>
  );
}
