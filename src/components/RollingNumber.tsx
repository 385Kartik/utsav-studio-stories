import { useEffect, useRef, useState } from "react";

interface RollingNumberProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function RollingNumber({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: RollingNumberProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const valStr = String(value);
  const chars = valStr.split("");

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-baseline overflow-hidden select-none ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {chars.map((ch, idx) => {
        const isDigit = /\d/.test(ch);
        if (!isDigit) {
          return (
            <span key={idx} className="inline-block px-[1px]">
              {ch}
            </span>
          );
        }
        const targetDigit = parseInt(ch, 10);
        // Stack of 30 digits (0..9 three times) so it scrolls through multiple full rotations
        const digits = [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        ];
        // Target index in the third loop
        const targetIndex = 20 + targetDigit;

        return (
          <span
            key={idx}
            className="inline-block relative h-[1.12em] overflow-hidden align-baseline"
            style={{ width: "0.64em" }}
          >
            <span
              className="flex flex-col will-change-transform"
              style={{
                transform: hasTriggered
                  ? `translateY(-${(targetIndex / digits.length) * 100}%)`
                  : "translateY(0%)",
                transition: hasTriggered
                  ? `transform ${1.8 + idx * 0.22}s cubic-bezier(0.12, 0.98, 0.24, 1)`
                  : "none",
              }}
            >
              {digits.map((d, dIdx) => (
                <span
                  key={dIdx}
                  className="h-[1.12em] flex items-center justify-center font-display"
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
}
