import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../types';

interface AuroraBackgroundProps {
  theme: ThemeMode;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction for subtle wave displacement
    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    // Aurora wave configurations
    const waves = [
      {
        baseY: 0.28,
        amplitude: 65,
        speed: 0.009,
        freq: 0.0022,
        colorStart: isDark ? 'rgba(147, 51, 234, 0.45)' : 'rgba(168, 85, 247, 0.25)', // Deep Purple
        colorMid: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.22)',   // Electric Blue
        colorEnd: 'rgba(0, 0, 0, 0)',
        heightFactor: 0.45,
      },
      {
        baseY: 0.35,
        amplitude: 80,
        speed: 0.007,
        freq: 0.0018,
        colorStart: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.28)', // Blue
        colorMid: isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(34, 211, 238, 0.24)',   // Cyan
        colorEnd: 'rgba(0, 0, 0, 0)',
        heightFactor: 0.52,
      },
      {
        baseY: 0.22,
        amplitude: 55,
        speed: 0.012,
        freq: 0.0031,
        colorStart: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(192, 132, 252, 0.2)', // Violet
        colorMid: isDark ? 'rgba(14, 165, 233, 0.35)' : 'rgba(56, 189, 248, 0.2)',   // Sky Blue
        colorEnd: 'rgba(0, 0, 0, 0)',
        heightFactor: 0.42,
      },
      {
        baseY: 0.42,
        amplitude: 95,
        speed: 0.006,
        freq: 0.0015,
        colorStart: isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(34, 211, 238, 0.2)',  // Cyan Greenish
        colorMid: isDark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(167, 139, 250, 0.2)', // Purple
        colorEnd: 'rgba(0, 0, 0, 0)',
        heightFactor: 0.58,
      },
    ];

    const render = () => {
      time += 1;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Save context
      ctx.save();
      ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';

      waves.forEach((w, index) => {
        const currentBaseY = height * w.baseY + Math.sin(time * 0.004 + index) * 20;
        const ribbonHeight = height * w.heightFactor;

        // Create vertical gradient
        const grad = ctx.createLinearGradient(0, currentBaseY - ribbonHeight * 0.4, 0, currentBaseY + ribbonHeight * 0.8);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.25, w.colorStart);
        grad.addColorStop(0.6, w.colorMid);
        grad.addColorStop(1, w.colorEnd);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, currentBaseY);

        const step = 20;
        for (let x = 0; x <= width + step; x += step) {
          // Compound sine waves for realistic natural aurora undulation
          const wave1 = Math.sin(x * w.freq + time * w.speed) * w.amplitude;
          const wave2 = Math.cos(x * w.freq * 1.8 - time * w.speed * 0.7) * (w.amplitude * 0.45);
          const wave3 = Math.sin(x * 0.0008 + time * 0.005) * 30;

          // Mouse proximity ripple
          const dx = x - mouseX;
          const dist = Math.abs(dx);
          const mouseDisplace = dist < 300 ? Math.cos((dist / 300) * (Math.PI / 2)) * 35 : 0;

          const y = currentBaseY + wave1 + wave2 + wave3 - mouseDisplace;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Shimmering vertical light rays / curtains
        const rayCount = 8;
        for (let r = 0; r < rayCount; r++) {
          const rayX = ((time * 0.4 + r * (width / rayCount) * 1.3) % (width + 200)) - 100;
          const rayWidth = 70 + Math.sin(time * 0.02 + r) * 25;
          const rayAlpha = (Math.sin(time * 0.015 + r * 2) + 1) * (isDark ? 0.08 : 0.04);

          const rayGrad = ctx.createLinearGradient(rayX, currentBaseY - 100, rayX, currentBaseY + 250);
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          rayGrad.addColorStop(0.4, `rgba(200, 225, 255, ${rayAlpha})`);
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = rayGrad;
          ctx.fillRect(rayX - rayWidth / 2, currentBaseY - 120, rayWidth, ribbonHeight);
        }
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background base tone */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-[#090814]'
            : 'bg-gradient-to-b from-[#f8f9ff] via-[#f3f4fc] to-[#eef2ff]'
        }`}
      />

      {/* Floating Aurora Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full filter blur-[28px] opacity-80 transition-opacity duration-700"
      />

      {/* Subtle futuristic cyber grid */}
      <div
        className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] ${
          isDark ? 'opacity-30' : 'opacity-15'
        }`}
      />

      {/* Radial vignette mask for depth */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(9,8,20,0.65)_85%,rgba(9,8,20,0.95)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(248,249,255,0.5)_85%,rgba(248,249,255,0.85)_100%)]'
        }`}
      />
    </div>
  );
};
