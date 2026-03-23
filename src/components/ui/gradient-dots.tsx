'use client';

import React, { useEffect, useRef } from 'react';

interface GradientDotsProps {
  dotSize?: number;
  spacing?: number;
  duration?: number;
  colorCycleDuration?: number;
}

export function GradientDots({
  dotSize = 6,
  spacing = 20,
  duration = 20,
  colorCycleDuration = 15,
}: GradientDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const colors = [
      [79, 70, 229],    // indigo
      [236, 72, 153],   // pink
      [16, 185, 129],   // emerald
      [245, 158, 11],   // amber
    ];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          const x = col * spacing;
          const y = row * spacing;

          // Wave distortion
          const wave = Math.sin(x * 0.03 + t * 0.5) * Math.cos(y * 0.03 + t * 0.3) * 0.5 + 0.5;

          // Color cycling
          const ci = (t / colorCycleDuration) % colors.length;
          const c1 = colors[Math.floor(ci) % colors.length];
          const c2 = colors[(Math.floor(ci) + 1) % colors.length];
          const frac = ci - Math.floor(ci);
          const r = c1[0] + (c2[0] - c1[0]) * frac;
          const g = c1[1] + (c2[1] - c1[1]) * frac;
          const b = c1[2] + (c2[2] - c1[2]) * frac;

          const alpha = wave * 0.35 + 0.05;
          const radius = (dotSize / 2) * (wave * 0.6 + 0.4);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
          ctx.fill();
        }
      }

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [dotSize, spacing, colorCycleDuration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
}
