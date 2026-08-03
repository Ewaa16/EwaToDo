"use client";

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#38bdf8"];

const PIECES = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37 + 13) % 100,
  delay: (i % 12) * 0.18,
  duration: 3 + (i % 5) * 0.5,
  width: 6 + (i % 4) * 2,
  height: 10 + (i % 3) * 3,
  color: COLORS[i % COLORS.length],
  rotate: (i * 47) % 360,
}));

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-sm"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
