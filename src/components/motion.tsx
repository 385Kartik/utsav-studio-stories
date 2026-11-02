import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow, OutlineButton } from "@/components/buttons";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/* The only place gsap/ScrollTrigger is imported: other modules call these
 * helpers so the plugin never crosses a chunk boundary as an import binding. */
export function refreshScrollTriggers() {
  ensureGsap();
  ScrollTrigger.refresh();
}


/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis) wired into the GSAP ticker                    */
/* ------------------------------------------------------------------ */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Custom cursor — a ring that grows over interactive elements         */
/* ------------------------------------------------------------------ */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    ensureGsap();
    document.documentElement.classList.add("cursor-native-none");
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const hit = (e.target as HTMLElement).closest("a, button, [data-cursor]");
      el.dataset["active"] = hit ? "true" : "false";
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.classList.remove("cursor-native-none");
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[130] hidden [@media(pointer:fine)]:block">
      <div
        data-cursor-ring
        className="flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/80 transition-all duration-300 data-[active=true]:scale-[2.2] data-[active=true]:bg-gold/15 data-[active=true]:backdrop-blur-[2px]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — fades/slides children in when they enter the viewport      */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  y = 48,
  delay = 0,
  duration = 1.1,
  style,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, delay, duration]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedTitle — word-by-word masked reveal for display headlines    */
/* ------------------------------------------------------------------ */
export function AnimatedTitle({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-word-inner]"), {
        yPercent: 115,
        duration: 1.2,
        delay,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          <span data-word-inner className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ImageReveal — shutter-style clip reveal on images                   */
/* ------------------------------------------------------------------ */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.3,
        delay,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      gsap.from(el.firstElementChild, {
        scale: 1.25,
        duration: 1.6,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{ willChange: "clip-path" }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ParallaxImage — image drifts as the page scrolls past it            */
/* ------------------------------------------------------------------ */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  speed = 8,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  speed?: number;
  eager?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = wrap.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img.current,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={wrap} className={`relative overflow-hidden ${className ?? ""}`}>
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={`absolute left-0 top-[-10%] h-[120%] w-full object-cover ${imgClassName ?? ""}`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element gently follows the pointer                       */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — number counts up when scrolled into view                  */
/* ------------------------------------------------------------------ */
export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
        },
      });
    });
    return () => ctx.revert();
  }, [to, decimals, prefix, suffix]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* HorizontalScroll — pins a section and scrolls its track sideways    */
/* ------------------------------------------------------------------ */
export function HorizontalScroll({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsap();
    const section = sectionRef.current!;
    const track = trackRef.current!;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="h-screen overflow-hidden">
      <div ref={trackRef} className="flex h-full items-center gap-[5vw] px-[6vw] will-change-transform">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — endless CSS-driven ticker (content duplicated inside)     */
/* ------------------------------------------------------------------ */
export function Marquee({
  items,
  className,
  duration = 32,
  reverse = false,
  separator = "·",
}: {
  items: string[];
  className?: string;
  duration?: number;
  reverse?: boolean;
  separator?: string;
}) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span>{item}</span>
          <span className="mx-6 text-gold md:mx-10" aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className ?? ""}`} aria-hidden>
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : undefined,
          } as CSSProperties
        }
      >
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CurvedReelScrollExperience — Ref 1 Serpentine Wave + Ref 2 3D Reel  */
/* ------------------------------------------------------------------ */
export interface GalleryScrollItem {
  src: string;
  title: string;
  category: string;
}

export function CurvedReelScrollExperience({
  items,
  heroImage,
}: {
  items: GalleryScrollItem[];
  heroImage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const serpentineStageRef = useRef<HTMLDivElement>(null);
  const serpentineTrackRef = useRef<HTMLDivElement>(null);
  const cylinderStageRef = useRef<HTMLDivElement>(null);
  const cylinderWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsap();
    if (!containerRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (statementRef.current) statementRef.current.style.opacity = "1";
      if (cylinderStageRef.current) cylinderStageRef.current.style.opacity = "1";
      return;
    }

    const container = containerRef.current;
    const heroWrap = heroWrapperRef.current;
    const heroImg = heroImgRef.current;
    const heroText = heroTextRef.current;
    const stmt = statementRef.current;
    const serpStage = serpentineStageRef.current;
    const serpCards = serpentineTrackRef.current
      ? (Array.from(serpentineTrackRef.current.children) as HTMLElement[])
      : [];
    const cylStage = cylinderStageRef.current;
    const cylWrapper = cylinderWrapperRef.current;
    const cylCards = cylWrapper ? (Array.from(cylWrapper.children) as HTMLElement[]) : [];

    const ribbonCount = serpCards.length;
    const cylinderCount = cylCards.length;

    const ctx = gsap.context(() => {
      let width = window.innerWidth;
      let height = window.innerHeight;
      let isMobile = width < 768;

      const updateDimensions = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        isMobile = width < 768;
      };

      const getSerpentinePoint = (t: number) => {
        const x = -width * 0.18 + t * (width * 1.36);
        const amplitudeY = isMobile ? height * 0.14 : height * 0.20;
        const baseY = isMobile ? height * 0.60 : height * 0.62;
        const y =
          baseY -
          Math.sin(t * Math.PI * 1.8) * amplitudeY +
          Math.cos(t * Math.PI * 2.2) * (isMobile ? 18 : 32);
        const z = Math.sin(t * Math.PI) * (isMobile ? 80 : 160) - 20;
        const angle = Math.cos(t * Math.PI * 1.8) * -20;
        const tilt = Math.sin(t * Math.PI * 2) * 12;
        return { x, y, z, angle, tilt };
      };

      const motionState = { progress: 0 };

      const applyFrame = (p: number) => {
        // ==========================================================
        // Phase 1: Hero 3D Page-Fold & Squeeze (0.00 -> 0.24)
        // ==========================================================
        if (heroWrap) {
          if (p <= 0.24) {
            const norm = p / 0.24;
            const squeezeX = 1 - norm * 0.32; // Horizontal squeeze
            const squeezeY = 1 + norm * 0.10; // Vertical stretch
            const rotateX = norm * 45; // 3D page fold forward
            const driftY = norm * -90;
            const opacity = Math.max(0, 1 - norm * 1.2);
            const blur = norm * 6;

            heroWrap.style.transform = `perspective(1200px) translate3d(0, ${driftY}px, ${-norm * 200}px) rotateX(${rotateX}deg) scale(${squeezeX}, ${squeezeY})`;
            heroWrap.style.opacity = String(opacity);
            heroWrap.style.filter = `blur(${blur}px)`;

            if (heroImg) {
              heroImg.style.transform = `scale(${1.05 + norm * 0.25}) translateY(${norm * 40}px)`;
            }
            if (heroText) {
              heroText.style.letterSpacing = `${-norm * 4}px`;
            }
          } else {
            heroWrap.style.opacity = "0";
          }
        }

        // ==========================================================
        // Phase 2: "Three Decades" Editorial Statement (0.16 -> 0.48)
        // ==========================================================
        if (stmt) {
          if (p >= 0.14 && p <= 0.48) {
            let stmtOpacity = 1;
            if (p < 0.24) stmtOpacity = (p - 0.14) / 0.10;
            else if (p > 0.38) stmtOpacity = 1 - (p - 0.38) / 0.10;
            stmt.style.opacity = String(Math.max(0, stmtOpacity));
            stmt.style.transform = `translate3d(0, ${(0.28 - p) * 35}px, 0)`;
          } else {
            stmt.style.opacity = "0";
          }
        }

        // ==========================================================
        // Phase 3: Serpentine Curved Ribbon (Ref 1) (0.14 -> 0.50)
        // ==========================================================
        if (serpStage) {
          if (p >= 0.12 && p <= 0.52) {
            let ribbonOpacity = 1;
            if (p < 0.20) ribbonOpacity = (p - 0.12) / 0.08;
            else if (p > 0.42) ribbonOpacity = 1 - (p - 0.42) / 0.10;
            serpStage.style.opacity = String(Math.max(0, Math.min(1, ribbonOpacity)));

            const ribbonProgress = (p - 0.12) / 0.36;
            serpCards.forEach((card, idx) => {
              const offset = idx / ribbonCount;
              const cardT = ribbonProgress * 1.5 - offset * 0.7;
              const clampedT = Math.max(0, Math.min(1.08, cardT));

              const pt = getSerpentinePoint(clampedT);
              const scale = 0.82 + Math.sin(clampedT * Math.PI) * 0.22;
              const cardOpacity = clampedT <= 0 || clampedT >= 1.05 ? 0 : 1;

              card.style.transform = `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px) rotateZ(${pt.angle}deg) rotateX(${pt.tilt}deg) scale(${scale})`;
              card.style.opacity = String(cardOpacity);
              card.style.zIndex = String(Math.round(pt.z + 200));
            });
          } else {
            serpStage.style.opacity = "0";
          }
        }

        // ==========================================================
        // Phase 4: Wide 3D Panoramic Bundle Reel (Ref 2) (0.42 -> 0.98)
        // ==========================================================
        if (cylStage && cylWrapper) {
          if (p >= 0.40 && p <= 0.98) {
            let reelOpacity = 1;
            if (p < 0.50) reelOpacity = (p - 0.40) / 0.10;
            else if (p > 0.88) reelOpacity = 1 - (p - 0.88) / 0.10;
            cylStage.style.opacity = String(Math.max(0, Math.min(1, reelOpacity)));

            const radius = isMobile ? 260 : Math.min(width * 0.46, 560);
            const reelNorm = (p - 0.40) / 0.48;
            const currentRot = reelNorm * 540;

            cylCards.forEach((card, idx) => {
              const baseAngle = (idx / cylinderCount) * 360;
              const cardDeg = baseAngle + currentRot;
              const rad = (cardDeg * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const z = Math.cos(rad) * radius;

              card.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${cardDeg}deg)`;
              const depthAlpha = 0.38 + ((z + radius) / (radius * 2)) * 0.62;
              card.style.opacity = String(depthAlpha);
            });

            cylWrapper.style.transform = `rotateX(${isMobile ? 6 : 9}deg) rotateZ(-2deg)`;
          } else {
            cylStage.style.opacity = "0";
          }
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            updateDimensions();
            applyFrame(motionState.progress);
          },
        },
      });

      tl.to(motionState, {
        progress: 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          applyFrame(motionState.progress);
        },
      });

      // Initial layout pass
      applyFrame(0);
    }, container);

    return () => ctx.revert();
  }, [items]);

  // Gallery items for ribbon (14 cards) and cylinder (18 cards)
  const ribbonCards = Array.from({ length: 14 }).map((_, i) => items[i % items.length]);
  const cylinderCards = Array.from({ length: 18 }).map((_, i) => items[i % items.length]);

  return (
    <section ref={containerRef} className="relative h-[250vh] md:h-[270vh] bg-background">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center select-none"
        style={{ perspective: "1300px" }}
      >
        {/* Subtle cinematic backlight */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/5 blur-[140px]" />

        {/* Ambient floating sparkles across the scene */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="sparkle-particle"
              style={{
                width: `${(i % 3) * 2.5 + 3}px`,
                height: `${(i % 3) * 2.5 + 3}px`,
                left: `${(i * 17) % 96}%`,
                top: `${(i * 23) % 94}%`,
                animation: `sparkle-float ${4 + (i % 4)}s ease-in-out ${(i % 5) * 0.7}s infinite`,
              }}
            />
          ))}
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STAGE 1: Hero View with 3D Page-Fold & Squeeze Animation     */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={heroWrapperRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 will-change-transform"
          style={{ transformOrigin: "center top", transformStyle: "preserve-3d" }}
        >
          {heroImage && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                ref={heroImgRef}
                src={heroImage}
                alt="A candid wedding moment photographed by Utsav Studio"
                className="w-full h-full object-cover scale-105 opacity-35 mix-blend-luminosity filter contrast-125 transition-transform duration-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/90" />
            </div>
          )}

          <div ref={heroTextRef} className="relative z-10 flex flex-col items-center transition-all duration-75">
            <p className="mb-4 text-[11px] uppercase tracking-[0.6em] text-gold font-mono font-medium">
              Mira Road East · Est. 1994
            </p>
            <h1 className="font-display text-[14vw] md:text-[9.5vw] font-light leading-[0.96] tracking-tight text-foreground">
              Utsav Studio
            </h1>
            <span className="mt-6 h-px w-20 bg-gold/60" aria-hidden />
            <p className="mt-6 text-xs uppercase tracking-[0.45em] text-muted-foreground font-light">
              Photography &amp; Cinematography
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STAGE 2: Minimal Statement ("Three decades...")               */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={statementRef}
          className="pointer-events-none absolute top-12 md:top-16 inset-x-0 z-20 mx-auto max-w-3xl px-6 text-center opacity-0 transition-transform duration-75 will-change-transform"
        >
          <Eyebrow>About our studio</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-light leading-[1.15] tracking-tight text-foreground md:text-5xl">
            Three decades of turning fleeting moments into family heirlooms.
          </h2>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STAGE 3: Unobstructed Serpentine Curved Ribbon (Ref 1)        */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={serpentineStageRef}
          className="pointer-events-none absolute inset-0 opacity-0 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div ref={serpentineTrackRef} className="absolute inset-0">
            {ribbonCards.map((item, idx) => (
              <div
                key={`ribbon-${idx}`}
                className="absolute left-0 top-0 w-36 md:w-56 p-2 rounded-lg bg-card/95 border border-border/80 shadow-2xl backdrop-blur-md will-change-transform pointer-events-auto"
              >
                <div className="flex items-center justify-between pb-1 px-1 text-[8px] font-mono tracking-widest text-muted-foreground border-b border-border/60">
                  <span>UTSAV #{String((idx % 7) + 1).padStart(2, "0")}</span>
                  <span className="text-gold font-semibold">• 35MM</span>
                </div>
                <div className="w-full aspect-[4/5] mt-1.5 rounded overflow-hidden bg-muted/20 relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="pt-1.5 px-1 flex justify-between items-center text-[10px]">
                  <span className="font-display text-foreground truncate">{item.title}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STAGE 4: Wide 3D Panoramic Bundle Reel (Ref 2)                */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={cylinderStageRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-0 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Section Heading */}
          <div className="absolute top-10 md:top-14 z-20 text-center px-4">
            <Eyebrow>Selected frames</Eyebrow>
            <h3 className="mt-3 font-display text-3xl font-light tracking-tight text-foreground md:text-5xl">
              Stories we've told lately
            </h3>
          </div>

          {/* Wide 3D Cylindrical Panoramic Reel */}
          <div
            ref={cylinderWrapperRef}
            className="relative w-[180px] md:w-[240px] h-[240px] md:h-[300px] mt-10 md:mt-14"
            style={{ transformStyle: "preserve-3d" }}
          >
            {cylinderCards.map((item, idx) => (
              <div
                key={`cyl-${idx}`}
                className="absolute left-0 top-0 w-[150px] md:w-[190px] p-2 rounded-lg bg-card/90 border border-border/80 shadow-2xl backdrop-blur-sm will-change-transform pointer-events-auto"
              >
                <div className="flex items-center justify-between pb-1 px-1 text-[8px] font-mono tracking-widest text-muted-foreground border-b border-border/60">
                  <span>FRAME #{String((idx % 7) + 1).padStart(2, "0")}</span>
                  <span className="text-gold">• FILM</span>
                </div>
                <div className="w-full aspect-[3/4] mt-1.5 rounded overflow-hidden bg-muted/20">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="pt-1.5 px-0.5 text-center font-display text-xs text-foreground truncate">
                  {item.title}
                </div>
              </div>
            ))}
          </div>

          {/* Action button anchored cleanly at bottom */}
          <div className="absolute bottom-10 md:bottom-14 z-20 pointer-events-auto">
            <OutlineButton to="/portfolio">
              View full portfolio
            </OutlineButton>
          </div>
        </div>

      </div>
    </section>
  );
}
