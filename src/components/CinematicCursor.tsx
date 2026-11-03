import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

export function CinematicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("cursor-none");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Inner dot follows instantly
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], [data-cursor]");
      if (interactive) {
        setIsHovered(true);
        const customText = interactive.getAttribute("data-cursor-text");
        if (customText) {
          setCursorText(customText);
        } else if (interactive.closest("[data-gallery-card]")) {
          setCursorText("VIEW");
        } else if (interactive.tagName === "BUTTON" || interactive.tagName === "A") {
          setCursorText("");
        }
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    // Smooth physics loop for outer follower ring
    const render = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden [@media(pointer:fine)]:block overflow-hidden">
      {/* Precise center gold dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 size-2 rounded-full bg-gold transition-opacity duration-200 will-change-transform"
        style={{ opacity: isHovered ? 0 : 0.9 }}
      />

      {/* Smooth outer follower badge */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-5 -mt-5 flex items-center justify-center rounded-full border border-gold/70 transition-all duration-300 ease-out will-change-transform ${
          isHovered
            ? cursorText
              ? "size-16 -ml-8 -mt-8 bg-background/85 backdrop-blur-md border-gold shadow-[0_0_20px_rgba(212,163,89,0.35)] scale-110"
              : "size-12 -ml-6 -mt-6 bg-gold/20 backdrop-blur-xs scale-125 border-gold"
            : "size-10 bg-transparent"
        }`}
      >
        {cursorText && (
          <span
            ref={textRef}
            className="font-mono text-[9px] font-semibold tracking-widest uppercase text-gold"
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
