
  // app/page.tsx
"use client";

import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function HomePage() {
  return (
    <Suspense 
      // fallback={
      //   <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-900 to-green-800">
      //     <div className="text-center text-white">
      //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-300 mx-auto mb-4"></div>
      //       <p className="text-gray-200">در حال بارگذاری...</p>
      //     </div>
      //   </div>
      // }
    >
      <HomeContent />
    </Suspense>
  );
}