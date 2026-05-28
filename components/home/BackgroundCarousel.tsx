"use client";

import Image from "next/image";
import { useBackgroundCarousel } from "@/components/hooks/useBackgroundCarousel";

interface BackgroundCarouselProps {
  images: string[];
  branchName: string;
  isActive: boolean;
}

export default function BackgroundCarousel({ images, branchName, isActive }: BackgroundCarouselProps) {
  const { currentIndex, isAnimating } = useBackgroundCarousel(images, isActive);

  if (!images.length) return null;

  return (
    <div className="min-h-full w-screen fixed inset-0 -z-10">
      <div
        className={`absolute inset-0 transition-all duration-2000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isAnimating ? "scale-105 opacity-80" : "scale-100 opacity-100"
        }`}
        key={currentIndex}
      >
        <Image
          src={images[currentIndex]}
          alt={branchName}
          fill
          loading="eager"
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </div>
  );
}