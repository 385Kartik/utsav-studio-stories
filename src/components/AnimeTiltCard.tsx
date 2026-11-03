import { useRef, type ReactNode, type MouseEvent } from "react";
import { animate } from "animejs";

interface AnimeTiltCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number;
  scale?: number;
  hasShutterFlash?: boolean;
}

export function AnimeTiltCard({
  children,
  className = "",
  onClick,
  maxTilt = 7,
  scale = 1.025,
  hasShutterFlash = true,
}: AnimeTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    animRef.current?.pause();
    animRef.current = animate(card, {
      rotateX,
      rotateY,
      scale,
      duration: 350,
      ease: "outQuad",
    });
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;

    animRef.current?.pause();
    // Smooth elastic recoil back to baseline
    animRef.current = animate(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 800,
      ease: "outElastic(1, 0.4)",
    });
  };

  const handleClick = () => {
    // Camera flash burst effect
    if (hasShutterFlash && flashRef.current) {
      animate(flashRef.current, {
        opacity: [0, 0.9, 0],
        duration: 280,
        ease: "outQuad",
      });
    }
    onClick?.();
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative will-change-transform"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`relative transition-shadow duration-300 hover:shadow-2xl hover:shadow-gold/10 will-change-transform ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}

        {/* Shutter Camera Flash Layer */}
        {hasShutterFlash && (
          <div
            ref={flashRef}
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] bg-white opacity-0"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
