import React, { useEffect, useRef } from 'react';

const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points: { x: number; y: number; age: number }[] = [];
  const maxPoints = 150; // Ditambah untuk trail lebih smooth
  const trailAge = 160; // Waktu menghilang lebih lama
  const hueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const onMouseMove = (e: MouseEvent) => {
      const lastPoint = points[points.length - 1];
      
      // Menambahkan titik interpolasi untuk membuat gerakan lebih smooth
      if (lastPoint) {
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {  // Jarak minimum antar titik
          const steps = Math.floor(distance / 5);
          for (let i = 1; i <= steps; i++) {
            const ratio = i / steps;
            points.push({
              x: lastPoint.x + dx * ratio,
              y: lastPoint.y + dy * ratio,
              age: 0
            });
          }
        }
      } else {
        points.push({ x: e.clientX, y: e.clientY, age: 0 });
      }

      while (points.length > maxPoints) points.shift();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hueRef.current = (hueRef.current + 0.5) % 360;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round'; // Membuat sudut lebih smooth

      // Gambar trail dengan dua pass untuk efek yang lebih halus
      // Pass 1: Glow effect
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        const alpha = 1 - point.age / trailAge;
        const hue = (hueRef.current + i * 2) % 360;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        
        ctx.shadowBlur = 30;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha * 0.5})`;
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.3})`;
        ctx.lineWidth = 8 * (1 - point.age / trailAge);
        ctx.stroke();
      }

      // Pass 2: Core trail
      ctx.shadowBlur = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        const alpha = 1 - point.age / trailAge;
        const hue = (hueRef.current + i * 2) % 360;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.lineWidth = 2 * (1 - point.age / trailAge);
        ctx.stroke();
      }

      // Update age dengan increment yang lebih kecil
      for (let i = 0; i < points.length; i++) {
        points[i].age += 0.8; // Lebih lambat menghilang
        
        if (points[i].age > trailAge) {
          points.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default CursorTrail;

