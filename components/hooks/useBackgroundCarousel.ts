"use client";

import { useState, useEffect, useRef } from "react";

export function useBackgroundCarousel(images: string[], isActive: boolean) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive || images.length === 0) return;

    const changeBackground = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 100);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    };

    intervalRef.current = setInterval(changeBackground, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, isAnimating, isActive]);

  return { currentIndex, isAnimating };
}