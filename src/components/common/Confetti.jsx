import { useEffect, useRef } from 'react';

const COLORS = ['#FF5F57', '#5B5EA6', '#FFD166', '#06D6A0', '#FF9F1C', '#8338EC'];

export default function Confetti({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      r: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vrot: -0.1 + Math.random() * 0.2,
    }));

    const start = Date.now();
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.04;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      if (Date.now() - start < 3000) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
