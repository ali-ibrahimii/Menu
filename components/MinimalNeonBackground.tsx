// components/MinimalNeonBackground.tsx
"use client";

import { memo } from "react";
import { useTheme } from "next-themes";

const MinimalNeonBackground = memo(() => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* گرادیانت پایه بر اساس تم */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isDark 
          ? "bg-gradient-to-br from-[#0a0f1c] via-[#0a0a1a] to-[#05050f]"
          : "bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc]"
      } animate-gradient-xy`} />
      
      {/* دایره نئونی متحرک اول - آبی */}
      <div className={`absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full 
                      mix-blend-screen filter blur-[150px] opacity-20 animate-neon-float-1
                      transition-all duration-1000 ${
                        isDark ? "bg-blue-500" : "bg-sky-400"
                      }`} />
      
      {/* دایره نئونی متحرک دوم - بنفش/آبی روشن */}
      <div className={`absolute bottom-20 right-1/4 w-[500px] h-[500px] rounded-full 
                      mix-blend-screen filter blur-[150px] opacity-20 animate-neon-float-2
                      transition-all duration-1000 ${
                        isDark ? "bg-purple-500" : "bg-indigo-400"
                      }`} />
      
      {/* دایره نئونی متحرک سوم - صورتی/نارنجی روشن */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[600px] h-[600px] rounded-full 
                      mix-blend-screen filter blur-[150px] opacity-10 animate-neon-pulse
                      transition-all duration-1000 ${
                        isDark ? "bg-pink-500" : "bg-rose-400"
                      }`} />
      
      {/* خطوط گلدانامه متحرک - رنگ بر اساس تم */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isDark ? "opacity-15" : "opacity-5"
      }`}>
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, ${
              isDark ? "rgba(0, 255, 255, 0.15)" : "rgba(14, 165, 233, 0.1)"
            } 1px, transparent 1px),
                              linear-gradient(0deg, ${
                                isDark ? "rgba(0, 255, 255, 0.15)" : "rgba(14, 165, 233, 0.1)"
                              } 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
      </div>
      
      {/* نقاط نئونی چشمک‌زن */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isDark ? "opacity-20" : "opacity-5"
      }`}
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${
            isDark ? "rgba(0, 255, 255, 0.3)" : "rgba(14, 165, 233, 0.2)"
          } 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          animation: 'dots-pulse 4s ease-in-out infinite alternate'
        }}
      />
    </div>
  );
});

MinimalNeonBackground.displayName = "MinimalNeonBackground";
export default MinimalNeonBackground;