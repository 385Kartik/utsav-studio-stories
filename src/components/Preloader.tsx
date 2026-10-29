import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { refreshScrollTriggers } from "@/components/motion";

const BRAND = "UTSAV STUDIO";

export function Preloader() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        refreshScrollTriggers();
        setDone(true);
      },
    });
    tl.to(obj, {
      v: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(obj.v)).padStart(3, "0");
      },
    })
      .from(
        "[data-preloader-letter]",
        { yPercent: 130, duration: 0.9, stagger: 0.05, ease: "power4.out" },
        0.15,
      )
      .from("[data-preloader-sub]", { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.9)
      .to("[data-preloader-center]", { opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.25")
      .to(
        "[data-preloader-blade-top]",
        { yPercent: -100, duration: 0.85, ease: "power4.inOut" },
        "<0.1",
      )
      .to(
        "[data-preloader-blade-bottom]",
        { yPercent: 100, duration: 0.85, ease: "power4.inOut" },
        "<0.06",
      );
    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[120]" aria-hidden>
      <div data-preloader-blade-top className="absolute inset-x-0 top-0 h-1/2 bg-background" />
      <div data-preloader-blade-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-card" />
      <div
        data-preloader-center
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
      >
        <span
          className="flex overflow-hidden font-display text-[11vw] leading-none tracking-tight md:text-[7vw]"
        >
          {BRAND.split("").map((ch, i) => (
            <span
              key={i}
              data-preloader-letter
              className="inline-block will-change-transform"
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </span>
        <span
          data-preloader-sub
          className="text-xs uppercase tracking-[0.5em] text-muted-foreground"
        >
          Photography &amp; Cinematography
        </span>
      </div>
      <span className="absolute bottom-8 right-8 font-display text-4xl text-gold tabular-nums md:bottom-12 md:right-14 md:text-6xl">
        <span ref={countRef}>000</span>
        <span className="text-muted-foreground">%</span>
      </span>
    </div>
  );
}
