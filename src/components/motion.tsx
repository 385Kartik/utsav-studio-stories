import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

let registered = false;
function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
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
      el.dataset.active = hit ? "true" : "false";
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
        yPercent: 120,
        rotate: 4,
        duration: 1.1,
        delay,
        ease: "power4.out",
        stagger: 0.045,
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
  separator = "✦",
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
