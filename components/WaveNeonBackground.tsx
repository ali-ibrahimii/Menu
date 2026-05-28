// components/WaveNeonBackground.tsx
"use client";

import { memo, useEffect, useRef } from "react";

const WaveNeonBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // گرادیانت پس‌زمینه
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0a0f1c');
      gradient.addColorStop(1, '#05050f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // رسم موج نئونی
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x <= canvas.width; x += 20) {
          const y = canvas.height / 2 + 
            Math.sin(x * 0.01 + time + i * 2) * 30 +
            Math.cos(x * 0.02 + time * 1.5) * 20;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = i === 0 ? '#06b6d4' : i === 1 ? '#ec4899' : '#8b5cf6';
        ctx.strokeWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = i === 0 ? '#06b6d4' : i === 1 ? '#ec4899' : '#8b5cf6';
        ctx.stroke();
      }
      
      time += 0.02;
      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" />;
});

WaveNeonBackground.displayName = "WaveNeonBackground";
export default WaveNeonBackground;