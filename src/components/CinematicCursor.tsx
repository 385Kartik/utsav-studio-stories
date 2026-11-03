import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

/**
 * CinematicCursor — Spatial 3D Viewfinder Reticle
 * ────────────────────────────────────────────────
 * Completely geometric & 3D:
 * • No circles, no round center dots.
 * • 3D faceted spatial brackets with metallic gold bevels and depth shadow.
 * • Real-time dynamic 3D velocity tilt in perspective space.
 * • 3D tactile depression on click.
 * • Expands into high-precision 3D framing brackets on interactive hover.
 */

export function CinematicCursor() {
  const cursorWrapRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"idle" | "hover" | "gallery">("idle");
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("cursor-none");

    const wrap = cursorWrapRef.current;
    const shadow = shadowRef.current;
    const reticle = reticleRef.current;
    if (!wrap || !reticle) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let posX = mouseX;
    let posY = mouseY;
    let prevX = mouseX;
    let prevY = mouseY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isGallery = target.closest("[data-gallery-card], [data-tilt-card]");
      const isInteract = target.closest("a, button, [role='button'], [data-cursor]");

      if (isGallery) setMode("gallery");
      else if (isInteract) setMode("hover");
      else setMode("idle");
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);

    // ── 60fps 3D Physics Loop ──────────────────────────────────────────
    const render = () => {
      // Smooth lerp
      posX += (mouseX - posX) * 0.16;
      posY += (mouseY - posY) * 0.16;

      // Velocity for 3D banking / tilting
      const velX = mouseX - prevX;
      const velY = mouseY - prevY;
      prevX = mouseX;
      prevY = mouseY;

      const tiltY = Math.max(-30, Math.min(30, velX * 1.6));
      const tiltX = Math.max(-30, Math.min(30, -velY * 1.6));
      const speed = Math.min(Math.sqrt(velX * velX + velY * velY) * 0.05, 0.4);

      wrap.style.transform = `translate3d(${posX}px, ${posY}px, 0) perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${1 + speed})`;

      if (shadow) {
        shadow.style.transform = `translate3d(${posX + 10 + velX * 0.4}px, ${posY + 14 + velY * 0.4}px, 0) scale(${0.9 - speed * 0.2})`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const isHover = mode === "hover";
  const isGallery = mode === "gallery";
  const isActive = isHover || isGallery;

  const size = isGallery ? 64 : isHover ? 48 : 32;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] hidden [@media(pointer:fine)]:block overflow-hidden"
      aria-hidden
    >
      {/* 3D Cast Shadow on page beneath cursor */}
      <div
        ref={shadowRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-sm bg-black/35 blur-[8px] transition-opacity duration-300 will-change-transform"
        style={{ opacity: isActive ? 0.6 : 0.3 }}
      />

      {/* Main 3D Floating Cursor Reticle */}
      <div
        ref={cursorWrapRef}
        className="fixed top-0 left-0 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={reticleRef}
          className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
            isMouseDown ? "scale-90" : "scale-100"
          }`}
          style={{
            width: size,
            height: size,
            marginLeft: -(size / 2),
            marginTop: -(size / 2),
            transformStyle: "preserve-3d",
          }}
        >
          {/* ── 4 Sharp 3D Beveled Corner Brackets (NO CIRCLES!) ── */}
          {/* Top-Left */}
          <div
            className="absolute top-0 left-0 transition-all duration-300"
            style={{
              width: isActive ? 12 : 8,
              height: isActive ? 12 : 8,
              borderTop: "2px solid var(--gold)",
              borderLeft: "2px solid var(--gold)",
              boxShadow: "-1px -1px 4px rgba(212,163,89,0.5)",
            }}
          />

          {/* Top-Right */}
          <div
            className="absolute top-0 right-0 transition-all duration-300"
            style={{
              width: isActive ? 12 : 8,
              height: isActive ? 12 : 8,
              borderTop: "2px solid var(--gold)",
              borderRight: "2px solid var(--gold)",
              boxShadow: "1px -1px 4px rgba(212,163,89,0.5)",
            }}
          />

          {/* Bottom-Left */}
          <div
            className="absolute bottom-0 left-0 transition-all duration-300"
            style={{
              width: isActive ? 12 : 8,
              height: isActive ? 12 : 8,
              borderBottom: "2px solid var(--gold)",
              borderLeft: "2px solid var(--gold)",
              boxShadow: "-1px 1px 4px rgba(212,163,89,0.5)",
            }}
          />

          {/* Bottom-Right */}
          <div
            className="absolute bottom-0 right-0 transition-all duration-300"
            style={{
              width: isActive ? 12 : 8,
              height: isActive ? 12 : 8,
              borderBottom: "2px solid var(--gold)",
              borderRight: "2px solid var(--gold)",
              boxShadow: "1px 1px 4px rgba(212,163,89,0.5)",
            }}
          />

          {/* Precision 3D Hairline Cross (Plus sign, NO DOT!) */}
          <div
            className="absolute inset-x-[36%] top-1/2 h-[1.5px] -translate-y-1/2 bg-gold/80 transition-all duration-200"
            style={{
              opacity: isActive ? 0.3 : 0.8,
            }}
          />
          <div
            className="absolute inset-y-[36%] left-1/2 w-[1.5px] -translate-x-1/2 bg-gold/80 transition-all duration-200"
            style={{
              opacity: isActive ? 0.3 : 0.8,
            }}
          />

          {/* Mode Text Badge in 3D */}
          {isActive && (
            <div
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] font-semibold tracking-[0.25em] text-gold uppercase px-1.5 py-0.5 rounded bg-black/85 border border-gold/40 shadow-lg"
              style={{
                transform: "translateX(-50%) translateZ(15px)",
              }}
            >
              {isGallery ? "VIEW 3D" : "SELECT"}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cursor-none, .cursor-none * {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
}
