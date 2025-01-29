import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
  size: number;
}

const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points: { x: number; y: number; age: number }[] = [];
  const particles: Particle[] = [];
  const maxPoints = 200;
  const trailAge = 180;
  const hueRef = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    // Handle resize untuk mengecek device
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Hanya jalankan animasi jika di desktop
    if (!isDesktop) return;
    
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

    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particles.push({
        x,
        y,
        age: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const lastPoint = points[points.length - 1];
      
      if (lastPoint) {
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 3) {
          const steps = Math.floor(distance / 3);
          for (let i = 1; i <= steps; i++) {
            const ratio = i / steps;
            const x = lastPoint.x + dx * ratio;
            const y = lastPoint.y + dy * ratio;
            points.push({ x, y, age: 0 });
            
            if (Math.random() < 0.2) {
              createParticle(x, y);
            }
          }
        }
      } else {
        points.push({ x: e.clientX, y: e.clientY, age: 0 });
      }

      while (points.length > maxPoints) points.shift();
    };

    const drawFlower = (x: number, y: number, time: number, hue: number) => {
      const petalCount = 8;  // Jumlah kelopak bunga
      const size = 15;       // Ukuran bunga
      const rotation = time * 2; // Kecepatan rotasi

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Gambar kelopak bunga
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        const petalX = Math.cos(angle) * size;
        const petalY = Math.sin(angle) * size;
        const waveOffset = Math.sin(time * 3 + i) * 2; // Efek bergelombang

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          petalX / 2, petalY / 2 + waveOffset,
          petalX, petalY
        );
        ctx.quadraticCurveTo(
          petalX / 2, petalY / 2 - waveOffset,
          0, 0
        );

        const alpha = 0.7 + Math.sin(time * 2 + i) * 0.3;
        ctx.fillStyle = `hsla(${hue + i * 30}, 100%, 70%, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${hue + i * 30}, 100%, 50%, 0.5)`;
        ctx.fill();
      }

      // Gambar pusat bunga
      ctx.beginPath();
      ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue + 60}, 100%, 70%, 0.8)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${hue + 60}, 100%, 50%, 0.5)`;
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hueRef.current = (hueRef.current + 0.8) % 360;

      // Draw main trail
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer glow
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        const alpha = 1 - point.age / trailAge;
        const hue = (hueRef.current + i * 2) % 360;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        
        const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, 100%, 50%, ${alpha * 0.5})`);

        ctx.shadowBlur = 40;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha})`;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12 * (1 - point.age / trailAge);
        ctx.stroke();
      }

      // Inner trail
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        const alpha = 1 - point.age / trailAge;
        const hue = (hueRef.current + i * 2) % 360;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${alpha})`;
        ctx.lineWidth = 3 * (1 - point.age / trailAge);
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.age++;
        particle.x += particle.vx * 0.8;
        particle.y += particle.vy * 0.8;
        particle.vy += 0.05;

        const alpha = 1 - particle.age / 50;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const hue = (hueRef.current + particle.age) % 360;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha})`;
        ctx.fill();
      }

      // Tambahkan bunga di sekitar cursor
      const time = Date.now() / 1000;
      const flowerCount = 3; // Jumlah bunga
      for (let i = 0; i < flowerCount; i++) {
        const angle = (time * 2 + (i * Math.PI * 2) / flowerCount);
        const radius = 30 + Math.sin(time * 3 + i) * 5;
        const x = mousePos.current.x + Math.cos(angle) * radius;
        const y = mousePos.current.y + Math.sin(angle) * radius;
        
        drawFlower(x, y, time + i, hueRef.current + i * 120);
      }

      // Wave effect around cursor (dimodifikasi untuk lebih sesuai dengan bunga)
      ctx.beginPath();
      for (let i = 0; i < Math.PI * 2; i += 0.1) {
        const radius = 25 + Math.sin(i * 8 + time * 5) * 5;
        const x = mousePos.current.x + Math.cos(i) * radius;
        const y = mousePos.current.y + Math.sin(i) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hueRef.current}, 100%, 50%, 0.3)`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(${hueRef.current}, 100%, 50%, 0.5)`;
      ctx.stroke();

      // Update ages
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age += 0.5;
        if (points[i].age > trailAge) {
          points.splice(i, 1);
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
  }, [isDesktop]);

  // Jangan render canvas sama sekali di mobile
  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: isDesktop ? 'block' : 'none' // Extra safety dengan CSS
      }}
    />
  );
};

export default CursorTrail;

