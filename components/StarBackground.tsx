'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawCtx = ctx; // Non-null reference

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create stars
    const stars: Star[] = [];
    const STAR_COUNT = 250;
    const SPEED = 0.4;

    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 300 + 100;
      stars.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        z: Math.random() * 1000,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        vz: SPEED * 2,
      });
    }

    let frameCount = 0;
    const shootingStarFrequency = 200;

    function animate() {
      // Clear canvas
      drawCtx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      drawCtx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Update and draw stars
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.z += star.vz;

        // Reset star if it moves too far
        if (
          star.z > 2000 ||
          star.x < 0 ||
          star.x > canvas!.width ||
          star.y < 0 ||
          star.y > canvas!.height
        ) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 300 + 100;
          star.x = canvas!.width / 2 + Math.cos(angle) * radius;
          star.y = canvas!.height / 2 + Math.sin(angle) * radius;
          star.z = 0;
          star.vx = Math.cos(angle) * SPEED;
          star.vy = Math.sin(angle) * SPEED;
          star.vz = SPEED * 2;
        }

        // Draw star
        const size = (1 - star.z / 2000) * 2;
        drawCtx.fillStyle = `rgba(255, 255, 100, ${1 - star.z / 2000})`;
        drawCtx.fillRect(star.x, star.y, size, size);
      });

      // Draw shooting stars occasionally
      if (frameCount % shootingStarFrequency === 0) {
        const shootingX = Math.random() * canvas!.width;
        const shootingY = Math.random() * canvas!.height;
        const shootingLength = 50;
        const shootingAngle = Math.random() * Math.PI * 2;

        drawCtx.strokeStyle = 'rgba(255, 200, 100, 0.8)';
        drawCtx.lineWidth = 2;
        drawCtx.beginPath();
        drawCtx.moveTo(shootingX, shootingY);
        drawCtx.lineTo(
          shootingX + Math.cos(shootingAngle) * shootingLength,
          shootingY + Math.sin(shootingAngle) * shootingLength
        );
        drawCtx.stroke();
      }

      frameCount++;
      requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
