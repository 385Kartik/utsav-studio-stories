import { useRef, type ReactNode, type MouseEvent } from "react";
import { animate } from "animejs";

export function AnimeMagneticButton({
  children,
  className = "",
  distance = 0.35,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    animRef.current?.pause();
    animRef.current = animate(el, {
      translateX: x * distance,
      translateY: y * distance,
      duration: 350,
      ease: "outQuad",
    });
  };

  const onMouseLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    animRef.current?.pause();
    animRef.current = animate(el, {
      translateX: 0,
      translateY: 0,
      duration: 700,
      ease: "outElastic(1, 0.4)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
