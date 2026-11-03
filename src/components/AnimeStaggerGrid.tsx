"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * AnimeStaggerGrid
 * ─────────────────
 * Full-coverage dot grid that ripples outward from the mouse position —
 * exactly like the animejs.com hero. Uses animejs grid stagger.
 * Mouse interaction: ripple from nearest dot on move.
 * Click: explosive burst from click position.
 * Auto-loop: cascading waves when idle.
 */

const COLS = 28;
const ROWS = 14;
const DOT = 3; // px

export function AnimeStaggerGrid({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef<number>(-1);
  const rafRef = useRef<number>(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const dotsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const container = containerRef.current!;
    dotsRef.current = Array.from(container.querySelectorAll<HTMLElement>("[data-dot]"));

    const getIndex = (x: number, y: number) => {
      const rect = container.getBoundingClientRect();
      const col = Math.round(((x - rect.left) / rect.width) * (COLS - 1));
      const row = Math.round(((y - rect.top) / rect.height) * (ROWS - 1));
      return Math.min(Math.max(row * COLS + col, 0), COLS * ROWS - 1);
    };

    const fire = (idx: number, intensity: number = 1) => {
      if (idx === lastIndexRef.current && intensity === 1) return;
      lastIndexRef.current = idx;

      animate(dotsRef.current, {
        scale: [
          { to: 1 + 1.4 * intensity, duration: 260, ease: "outExpo" },
          { to: 1, duration: 500, ease: "outElastic(1, 0.4)" },
        ],
        opacity: [
          { to: intensity, duration: 120 },
          { to: 0.12, duration: 600 },
        ],
        delay: stagger(55 / intensity, { grid: [COLS, ROWS], from: idx }),
      });
    };

    const onMove = (e: MouseEvent) => {
      pendingRef.current = { x: e.clientX, y: e.clientY };
    };

    // Click: dramatic explosive burst
    const onClick = (e: MouseEvent) => {
      const idx = getIndex(e.clientX, e.clientY);
      lastIndexRef.current = -1; // force re-fire
      animate(dotsRef.current, {
        scale: [
          { to: 3.5, duration: 180, ease: "outExpo" },
          { to: 1, duration: 800, ease: "outElastic(1, 0.3)" },
        ],
        opacity: [
          { to: 1, duration: 80 },
          { to: 0.12, duration: 900 },
        ],
        delay: stagger(30, { grid: [COLS, ROWS], from: idx }),
      });
    };

    const tick = () => {
      if (pendingRef.current) {
        const idx = getIndex(pendingRef.current.x, pendingRef.current.y);
        fire(idx, 1);
        pendingRef.current = null;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    // Auto-loop animation — ripple from different focus points
    const centers = [
      Math.floor((ROWS / 2) * COLS + COLS / 2),
      Math.floor((ROWS / 4) * COLS + COLS / 4),
      Math.floor((ROWS / 4) * COLS + (3 * COLS) / 4),
      Math.floor((3 * ROWS) / 4) * COLS + Math.floor(COLS / 2),
      Math.floor(ROWS / 2) * COLS + Math.floor(COLS * 0.8),
    ];
    let autoIdx = 0;

    const autoFire = () => {
      const from = centers[autoIdx % centers.length];
      autoIdx++;
      lastIndexRef.current = -1;

      animate(dotsRef.current, {
        scale: [
          { to: 1.8, duration: 300, ease: "outExpo" },
          { to: 1, duration: 700, ease: "outElastic(1, 0.5)" },
        ],
        opacity: [
          { to: 0.7, duration: 200 },
          { to: 0.12, duration: 800 },
        ],
        delay: stagger(38, { grid: [COLS, ROWS], from }),
      });
    };

    const autoId = setInterval(autoFire, 2600);
    setTimeout(autoFire, 300);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(rafRef.current);
      clearInterval(autoId);
    };
  }, []);

  const dots = Array.from({ length: COLS * ROWS });

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: "100%",
          height: "100%",
          padding: "4% 2%",
          boxSizing: "border-box",
        }}
      >
        {dots.map((_, i) => (
          <div
            key={i}
            data-dot
            style={{
              width: DOT,
              height: DOT,
              borderRadius: "50%",
              backgroundColor: "var(--gold)",
              opacity: 0.12,
              transform: "scale(1)",
              willChange: "transform, opacity",
              margin: "auto",
            }}
          />
        ))}
      </div>
    </div>
  );
}
