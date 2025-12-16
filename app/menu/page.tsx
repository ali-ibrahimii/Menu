// app/menu/page.tsx
"use client";

import { Suspense } from "react";
import MenuContent from "./MenuContent";

export default function MenuPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری منو...</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}