import { gsap } from "gsap";
import { animate, scrambleText, stagger } from "animejs";
import { useEffect, useRef, useState } from "react";
import { refreshScrollTriggers } from "@/components/motion";

const BRAND = "UTSAV STUDIO";

export function Preloader() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";

    // ── Phase 1: Scramble the BRAND letters into place ──────────────
    if (brandRef.current) {
      const el = brandRef.current;
      animate(el, {
        innerHTML: scrambleText({
          text: BRAND,
          chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          speed: 0.55,
          revealDelay: 0,
        }),
        duration: 1600,
        ease: "linear",
      });
    }

    // ── Phase 2: Sub text fade in after scramble ─────────────────────
    if (subRef.current) {
      animate(subRef.current, {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: 900,
        duration: 600,
        ease: "outExpo",
      });
    }

    // ── Phase 3: Counter 0 → 100 with GSAP for timing ───────────────
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
      duration: 1.85,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current)
          countRef.current.textContent = String(Math.round(obj.v)).padStart(3, "0");
      },
    })
      // blade wipe out
      .to("[data-preloader-center]", { opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.15")
      .to("[data-preloader-blade-top]", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "<0.08")
      .to("[data-preloader-blade-bottom]", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<0.06");

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
        {/* Scramble brand text — single element, animejs scrambles innerHTML */}
        <div
          ref={brandRef}
          className="font-display text-[11vw] leading-none tracking-tight md:text-[7vw] whitespace-nowrap"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {BRAND}
        </div>

        <span
          ref={subRef}
          data-preloader-sub
          className="text-xs uppercase tracking-[0.5em] text-muted-foreground opacity-0"
        >
          Photography &amp; Cinematography
        </span>
      </div>

      {/* Counter */}
      <span className="absolute bottom-8 right-8 font-display text-4xl text-gold tabular-nums md:bottom-12 md:right-14 md:text-6xl">
        <span ref={countRef}>000</span>
        <span className="text-muted-foreground">%</span>
      </span>

      {/* Vertical scan line — pure CSS, dramatic cinematic feel */}
      <div
        className="absolute inset-y-0 w-px bg-gold/40"
        style={{
          animation: "preloader-scan 1.85s linear forwards",
          left: 0,
        }}
      />
    </div>
  );
}
